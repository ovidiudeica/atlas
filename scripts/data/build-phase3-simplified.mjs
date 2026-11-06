#!/usr/bin/env node
/**
 * Rebuild the topology-preserving Atlas display geometries from certified v2
 * canonical geometry. Requires mapshaper CLI version 0.7.101.
 *
 * Usage:
 *   MAPSHAPER_BIN=/path/to/mapshaper node scripts/data/build-phase3-simplified.mjs \
 *     data/candidates/phase3/actual /tmp/atlas-display-layers
 *
 * Never writes into the source directory. Original polygons are immutable.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { spawnSync } from 'node:child_process';

const source = path.resolve(process.argv[2] || 'data/candidates/phase3/actual');
const destination = path.resolve(process.argv[3] || 'tmp/atlas-display-rebuild');
const cli = process.env.MAPSHAPER_BIN || 'mapshaper';
if (source === destination) throw Error('Refusing to overwrite the canonical source directory');
function exec(args,cwd){
  const run=spawnSync(cli,args,{cwd,encoding:'utf8',maxBuffer:10_000_000,timeout:240000,shell:process.platform==='win32'});
  if (run.error || run.status !== 0) throw Error('Mapshaper failed: '+[run.error,run.stderr,run.stdout].filter(Boolean).join('\n').slice(0,2500));
  return run.stdout+' '+run.stderr;
}
const version=exec(['-v'],process.cwd());
if (!version.includes('0.7.101')) throw Error('This release requires mapshaper 0.7.101, got '+version);
const work=fs.mkdtempSync(path.join(os.tmpdir(),'atlas-phase3-mapshaper-'));
const files=[
 ['ro-administrative-v2.geojson.gz','ro-admin.geojson','ro-administrative-simplified-v1.geojson.gz',3229],
 ['ro-statistical-v2.geojson.gz','ro-stat.geojson','ro-statistical-simplified-v1.geojson.gz',12],
 ['md-administrative-v2.geojson.gz','md-admin.geojson','md-administrative-simplified-v1.geojson.gz',1036],
 ['md-statistical-v2.geojson.gz','md-stat.geojson','md-statistical-simplified-v1.geojson.gz',6],
];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
try {
  for(const [compressed,input] of files){
    const json=zlib.gunzipSync(fs.readFileSync(path.join(source,compressed)));
    fs.writeFileSync(path.join(work,input),json);
  }
  for(const country of ['ro','md']){
    const out=path.join(work,'out-'+country);
    fs.mkdirSync(out);
    exec(['-i',country+'-admin.geojson',country+'-stat.geojson','combine-files',
      '-simplify','weighted','50%','keep-shapes','-o',out,'format=geojson','extension=geojson'],work);
  }
  fs.mkdirSync(destination,{recursive:true});
  const entries={};
  for(const [compressed,input,output,expected] of files){
    const country=input.slice(0,2),produced=path.join(work,'out-'+country,input);
    const data=JSON.parse(fs.readFileSync(produced,'utf8'));
    if(data.type!=='FeatureCollection'||data.features.length!==expected||
      new Set(data.features.map(f=>f.properties?.atlasId)).size!==expected) {
      throw Error('Feature identity mismatch: '+input);
    }
    const bytes=zlib.gzipSync(Buffer.from(JSON.stringify(data)),{level:7,mtime:0});
    fs.writeFileSync(path.join(destination,output),bytes);
    entries[output]={bytes:bytes.length,sha256:hash(bytes),featureCount:expected};
  }
  fs.writeFileSync(path.join(destination,'rebuild-output-manifest.json'),JSON.stringify({
    schema:'atlas-simplified-rebuild-v1',mapshaper:'0.7.101',method:'weighted_50pct_keep_shapes',
    sharedTopology:'combine-files per country (administrative plus statistical)',artifacts:entries
  },null,2)+'\n');
  console.log(JSON.stringify(entries,null,2));
} finally {
  fs.rmSync(work,{recursive:true,force:true});
}