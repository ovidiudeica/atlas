import {useEffect,useState} from 'react';

interface Props {
  src:string|null|undefined;
  alt:string;
  className:string;
  loading?:'lazy'|'eager';
}
/** A missing or broken remote image cannot replace an exact-ID symbol with a guessed one. */
export function TerritorialSymbolImage({src,alt,className,loading='lazy'}:Props){
  const [failed,setFailed]=useState(false);
  useEffect(()=>setFailed(false),[src]);
  if(!src||failed)return <span className={className+' territorial-symbol-fallback'}
    role={alt?'img':undefined} aria-label={alt||undefined}
    aria-hidden={alt?undefined:true}>◇</span>;
  return <img className={className} src={src} alt={alt}
    loading={loading} decoding="async" onError={()=>setFailed(true)} />;
}
