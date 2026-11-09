import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gunzipSync,gzipSync} from 'node:zlib';
import {root,sha} from './network.mjs';
const catalogBytes=await readFile(new URL('public/data/phase4/catalog.json.gz',root));
const catalog=JSON.parse(gunzipSync(catalogBytes));
const registry=JSON.parse(gunzipSync(await readFile(new URL('public/data/symbols/registry.json.gz',root)))).entities;
if(catalog.entities.length!==4283||new Set(catalog.entities.map(e=>e.id)).size!==4283)throw Error('Certified inventory invalid');
const byId=new Map(catalog.entities.map(e=>[e.id,e]));
const priorities=new Set(['osm-r90689','osm-r58974','osm-r65335','osm-r377733','osm-r2248660','osm-r2260187','osm-r59002','osm-r1699033','osm-r1699032','osm-r1748490','osm-r1691801','osm-r2607033']);
const entities={};const images=[];
for(const n of catalog.entities){
 const r=registry[n.id];if(!r||r.osmRelationId!==n.osmRelationId)throw Error('Registry identity drift '+n.id);
 const row=entities[n.id]={atlasId:n.id,country:n.country,officialName:n.officialName,entityType:n.entityType,adminLevel:n.adminLevel,
  parentId:n.administrativeParentId,treeParentId:n.treeParentId,registryCode:n.registry?.code||null,
  wikidata:r.wikidata,roles:n.roles,statisticalRoles:n.statisticalRoles,symbols:{}};
 for(const kind of ['coat','flag']){
  const asset=r[kind];const candidates=r.candidates.filter(c=>c.symbolType===kind&&(asset?.file&&asset.file===c.file||asset?.url&&asset.url===c.url));
  const item=row.symbols[kind]={atlasId:n.id,kind,existingImage:asset||null,originalStatus:r.status[kind],
   discovery:candidates.map(c=>({source:c.source,sourceType:c.sourceType,sourceLanguage:c.sourceLanguage,wikidata:c.wikidata,statementId:c.statementId,identityEvidence:c.identityEvidence,discoveredIn:c.discoveredIn||[],article:c.article||null})),
   ambiguities:[...r.reviewNotes,...candidates.flatMap(c=>c.reviewNotes||[])],
   priority:priorities.has(n.id)||n.adminLevel<=4?'HIGH':asset&&!candidates[0]?.attribution?.LicenseShortName?'HIGH':'NORMAL',
   investigation:{state:asset?'NOT_STARTED':'NO_ASSIGNED_IMAGE',stages:{}},
   verdict:asset?null:'MISSING',authenticity:asset?'NOT_YET_EXAMINED':'MISSING',graphicVersion:asset?'NOT_YET_EXAMINED':'MISSING',
   rights:{verdict:asset?'NOT_YET_EXAMINED':'NOT_APPLICABLE'},evidence:[],contradictions:[],recommendedImage:asset||null,
   changes:[],limitations:[],manualReviewRequired:Boolean(asset)};
  if(asset)images.push({atlasId:n.id,kind,image:asset,priority:item.priority});
 }
}
const counts={entities:Object.keys(entities).length,slots:catalog.entities.length*2,existingImages:images.length,
 coat:images.filter(i=>i.kind==='coat').length,flag:images.filter(i=>i.kind==='flag').length,
 both:Object.values(registry).filter(r=>r.coat&&r.flag).length,withoutImages:Object.values(registry).filter(r=>!r.coat&&!r.flag).length,
 candidate:Object.values(registry).reduce((sum,r)=>sum+['coat','flag'].filter(k=>r[k]&&r.status[k]==='CANDIDATE').length,0)};
const audit={schema:'atlas-sim-r5-audit-v1',baseCommit:'7288b44f2b0e355b4c4b585ee5b87e6574fae60b',
 catalogSHA256:sha(catalogBytes),counts,entities};
await mkdir(new URL('public/data/symbols/',root),{recursive:true});
await mkdir(new URL('docs/audits/sim-r5/',root),{recursive:true});
await writeFile(new URL('public/data/symbols/audit-initial.json.gz',root),gzipSync(JSON.stringify(audit)));
await writeFile(new URL('docs/audits/sim-r5/initial-inventory.json',root),JSON.stringify({schema:audit.schema,baseCommit:audit.baseCommit,catalogSHA256:audit.catalogSHA256,counts,
 priorityImages:images.filter(i=>i.priority==='HIGH'),allExistingAssignments:images},null,2)+'\n');
console.log(counts);
