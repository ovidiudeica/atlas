#!/usr/bin/env node
/**
 * Create static, lazily fetched Phase 4 assets from certified Phase 3 geometry.
 *
 * Source: data/candidates/phase3/actual; destination: public/data/phase4.
 * No network operations. Source blobs and provenance are never modified.
 * The original and topologically simplified outlines are stored separately.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const root=process.cwd();
const source=path.join(root,'data/candidates/phase3/actual');
const dest=path.join(root,'public/data/phase4');
const manifest=JSON.parse(fs.readFileSync(path.join(source,'manifest-v3.json'),'utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const loadJSON=p=>JSON.parse(fs.readFileSync(path.join(source,p),'utf8'));
const unzip=p=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(source,p))).toString('utf8'));
if(manifest.status!=='CERTIFIED_CARTOGRAPHIC_SOURCE_WITH_ACCEPTED_EXCEPTIONS'||manifest.legallyCertified!==false)throw Error('Phase 3 cartographic certificate not admitted');
const cat=loadJSON('catalog-v2.json'),byId=new Map(cat.entities.map(x=>[x.id,x]));
if(byId.size!==4283)throw Error('Unexpected certified entity count');
const rootIds={RO:'osm-r90689',MD:'osm-r58974'};
const BINS={RO:12,MD:6};
function fnv32(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function groupOf(e){
 if(e.adminLevel===2)return 'roots';
 if(e.roles.includes('statistical')&&!e.roles.includes('administrative'))return e.country.toLowerCase()+'-stat';
 let cursor=e;
 const seen=new Set();
 while(cursor.administrativeParentId && cursor.administrativeParentId!==rootIds[e.country]){
  if(seen.has(cursor.id))throw Error('Administrative cycle '+cursor.id);
  seen.add(cursor.id);
  cursor=byId.get(cursor.administrativeParentId);
  if(!cursor)throw Error('Missing administrative parent '+e.id);
 }
 const bucket=fnv32(cursor.id)%BINS[e.country];
 return e.country.toLowerCase()+'-adm-'+String(bucket).padStart(2,'0');
}
for(const e of cat.entities)e.geometryShard=groupOf(e);
const indexed=new Map();
for(const e of cat.entities){if(!indexed.has(e.geometryShard))indexed.set(e.geometryShard,[]);indexed.get(e.geometryShard).push(e.id)}
const output={};
function write(name,data,gzip=false){
 const target=path.join(dest,name);fs.mkdirSync(path.dirname(target),{recursive:true});
 const bytes=gzip?zlib.gzipSync(Buffer.from(JSON.stringify(data)),{level:7,mtime:0}):Buffer.from(JSON.stringify(data)+'\n');
 fs.writeFileSync(target,bytes);
 output[name]={bytes:bytes.length,sha256:sha(bytes)};
 return bytes;
}
const collections=[
 {country:'ro',mode:'detailed',kind:'administrative',filename:'ro-administrative-v2.geojson.gz'},
 {country:'ro',mode:'simplified',kind:'administrative',filename:'ro-administrative-simplified-v1.geojson.gz'},
 {country:'md',mode:'detailed',kind:'administrative',filename:'md-administrative-v2.geojson.gz'},
 {country:'md',mode:'simplified',kind:'administrative',filename:'md-administrative-simplified-v1.geojson.gz'},
 {country:'ro',mode:'detailed',kind:'statistical',filename:'ro-statistical-v2.geojson.gz'},
 {country:'ro',mode:'simplified',kind:'statistical',filename:'ro-statistical-simplified-v1.geojson.gz'},
 {country:'md',mode:'detailed',kind:'statistical',filename:'md-statistical-v2.geojson.gz'},
 {country:'md',mode:'simplified',kind:'statistical',filename:'md-statistical-simplified-v1.geojson.gz'}
];
const groups=new Map();
const sourceCount=new Map();
for(const c of collections){
 const name=c.country+'-'+c.kind+'-'+c.mode;
 const fc=unzip(c.filename);
 if(fc.type!=='FeatureCollection')throw Error('Invalid Phase 3 source '+c.filename);
 sourceCount.set(name,fc.features.length);
 for(const f of fc.features){
  const id=f.properties?.atlasId;
  const ent=byId.get(id);
  if(!ent || ent.country.toLowerCase()!==c.country)throw Error('Source geometry has unknown Atlas identity '+id);
  const key=ent.geometryShard+'|'+c.mode;
  if(!groups.has(key))groups.set(key,[]);
  const props={...f.properties,atlasId:id,country:c.country,roles:ent.roles,adminLevel:ent.adminLevel};
  groups.get(key).push({type:'Feature',id,properties:props,geometry:f.geometry});
 }
}
const shapeManifest={};
for(const [key,features] of [...groups.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){
 const [group,mode]=key.split('|');
 const relative='geometry/'+group+'-'+mode+'.geojson.gz';
 features.sort((a,b)=>a.id.localeCompare(b.id));
 write(relative,{type:'FeatureCollection',features},true);
 if(!shapeManifest[group])shapeManifest[group]={};
 shapeManifest[group][mode]={file:relative,count:features.length};
}
// Ensure all nodes have original and simplified source geometry in exactly one shard.
for(const e of cat.entities){
 const group=e.geometryShard;
 for(const mode of ['detailed','simplified']){
  const entry=groups.get(group+'|'+mode)||[];
  if(entry.filter(f=>f.id===e.id).length!==1)throw Error('Missing or duplicate geometry for '+e.id+' '+mode+' in '+group);
 }
}
const catalogOut={schema:'atlas-territory-browser-v1',sourceSnapshotDate:'2026-10-05',certificate:'CERTIFIED_CARTOGRAPHIC_SOURCE_WITH_ACCEPTED_EXCEPTIONS',
 entities:cat.entities};
write('catalog.json.gz',catalogOut,true);
const index={
 schema:'atlas-phase4-assets-v1',sourceSnapshotDate:'2026-10-05',legalCertification:false,
 certifiedManifestSha256:sha(fs.readFileSync(path.join(source,'manifest-v3.json'))),
 totals:{entities:cat.entities.length,administrativeRO:3229,administrativeMD:1036,standaloneStatisticalRO:12,standaloneStatisticalMD:6},
 geometry:shapeManifest,artifacts:output
};
write('manifest.json',index);
console.log(JSON.stringify({groups:Object.keys(shapeManifest).length,files:Object.keys(output).length,
 totalBytes:Object.values(output).reduce((x,v)=>x+v.bytes,0),catalogBytes:output['catalog.json.gz'].bytes,
 counts:Object.fromEntries(sourceCount),rootFiles:shapeManifest.roots,
 maxShardBytes:Math.max(...Object.values(output).map(e=>e.bytes))},null,2));
