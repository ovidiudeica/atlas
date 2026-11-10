import {useEffect,useState} from 'react';
import {mayRequestSymbolImage} from '../data/symbolImageLoading.mjs';
const decodedSources=new Set<string>();

interface Props {
  src:string|null|undefined;
  alt:string;
  className:string;
  loading?:'lazy'|'eager';
  tree?:boolean;
  selected?:boolean;
}
/** A missing or broken remote image cannot replace an exact-ID symbol with a guessed one. */
export function TerritorialSymbolImage({src,alt,className,loading='lazy',tree=false,selected=false}:Props){
  const [failed,setFailed]=useState(false);
  useEffect(()=>setFailed(false),[src]);
  const deferred=!!src&&!mayRequestSymbolImage({src,tree,selected,decodedSources});
  if(!src||failed||deferred)return <span className={className+' territorial-symbol-fallback'}
    data-symbol-state={deferred?'deferred':failed?'unavailable':'missing'}
    role={alt?'img':undefined} aria-label={alt||undefined}
    aria-hidden={alt?undefined:true}>◇</span>;
  return <img className={className} src={src} alt={alt}
    loading={loading} decoding="async" onLoad={()=>{if(src)decodedSources.add(src);}} onError={()=>setFailed(true)} />;
}
