import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
const filename=new URL('../public/data/phase4/catalog.json.gz',import.meta.url);
const catalog=JSON.parse(gunzipSync(readFileSync(filename)).toString('utf8'));
const short=(node,lang)=>{
  if(node.id==='osm-r90689')return lang==='en'?'Romania':'România';
  if(node.id==='osm-r58974')return 'Moldova';
  const o={MD11:['Vest','West'],MD12:['Est','East'],MD111:['Nord','North'],MD112:['Centru','Centre'],MD113:['Sud','South'],MD120:['Stânga Nistrului','Left Bank']};
  const stat=node.statisticalRoles?.[0]?.code;
  if(stat&&o[stat])return o[stat][lang==='ro'?0:1];
  if(node.roles.includes('statistical')&&node.sourceTags?.short_name)return node.sourceTags.short_name;
  return node.shortName?.[lang]||node.name;
};
const indicators=[
  'district','municip','commune','community','county','city of','town of',
  'rayon','raion','județ','judet','comuna ','comună','orașul','orasul',
  'unităț','unitat','teritorial','region of','regiunea','oblast','satul',
  'sectorul','villag','prăf','prefect','municipalitate','muncip'
];
test('audit all 4283 certified tree display names in both locales',()=>{
  assert.equal(catalog.entities.length,4283);
  const hits=[],lengthy=[],samples=[],terms={};const all=[];
  for(const node of catalog.entities){
    for(const lang of ['en','ro']){
      const value=short(node,lang),lower=value.toLowerCase();
      const matched=indicators.filter(word=>lower.includes(word));
      const entry={id:node.id,lang,country:node.country,admin:node.adminLevel,
        roles:node.roles.join('/'),stat:node.statisticalRoles.map(x=>x.code).join('/'),
        value,srcShort:node.shortName?.[lang],native:node.name,official:node.officialName};
      if(matched.length){
        hits.push(entry);
        for(const key of matched)terms[key]=(terms[key]||0)+1;
      }
      if(value.length>45)lengthy.push(entry);
      all.push({lang,value,node});
    }
    if(node.statisticalRoles.some(x=>x.code==='MD120'))
      samples.push({id:node.id,name:node.name,official:node.officialName,
        short:node.shortName,roles:node.statisticalRoles,
        en:short(node,'en'),ro:short(node,'ro')});
  }
  const byCountry={};for(const entry of hits){
    const key=entry.country+'/'+entry.lang+'/'+entry.roles;
    byCountry[key]=(byCountry[key]||0)+1;
  }
  console.log('TREE-CATALOG-FORENSICS '+JSON.stringify({total:catalog.entities.length,
    indicators:terms,byCountry,longCount:lengthy.length,keywordCount:hits.length,
    longExamples:lengthy.slice(0,45),
    keywordExamples:hits.slice(0,125),
    md120:samples
  }));
});