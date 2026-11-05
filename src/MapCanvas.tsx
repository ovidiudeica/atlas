import { useEffect, useRef, useState } from 'react';
import maplibregl, { GeoJSONSource, Map } from 'maplibre-gl';
import type { FeatureCollection } from 'geojson';
import type { Locale } from './catalog';

export type BasemapMode = 'standard' | 'grayscale' | 'dark' | 'none';
export type MapController = { home: () => void; zoomIn: () => void; zoomOut: () => void };

type Props = {
  locale:Locale;
  basemap:BasemapMode;
  simplified:boolean;
  visible:string[];
  selected:string|null;
  onSelect:(id:string)=>void;
  onController:(controller:MapController|null)=>void;
};
const initialBounds:[[number,number],[number,number]]=[[20.0,43.4],[30.55,48.64]];
const empty:FeatureCollection={type:'FeatureCollection',features:[]};
const asset = (path:string) => `${import.meta.env.BASE_URL}data/${path}`;

const osmAttribution='© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>';
const cartoAttribution=`${osmAttribution} · © <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>`;

/** Stable map style with two independently switchable raster sources. */
const style:maplibregl.StyleSpecification={
  version:8,
  sources:{
    osm:{type:'raster',tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],tileSize:256,maxzoom:19,attribution:osmAttribution},
    carto:{type:'raster',tiles:['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],tileSize:256,maxzoom:19,attribution:cartoAttribution},
  },
  layers:[
    {id:'background',type:'background',paint:{'background-color':'#eff5f0'}},
    {id:'osm-raster',type:'raster',source:'osm',paint:{'raster-saturation':0}},
    {id:'dark-raster',type:'raster',source:'carto',layout:{visibility:'none'}},
  ],
};

export default function MapCanvas({locale,basemap,simplified,visible,selected,onSelect,onController}:Props) {
  const container=useRef<HTMLDivElement>(null);
  const mapRef=useRef<Map|null>(null);
  const onSelectRef=useRef(onSelect);
  const cached=useRef<{original:FeatureCollection;simplified:FeatureCollection}|null>(null);
  const controllerRef=useRef(onController);
  const [mapError,setMapError]=useState<string|null>(null);
  onSelectRef.current=onSelect;
  controllerRef.current=onController;

  useEffect(()=>{
    if(!container.current || mapRef.current)return;
    const map=new maplibregl.Map({container:container.current,style,center:[25.2,46.2],zoom:5.15,
      minZoom:2,maxZoom:15,attributionControl:false,dragRotate:false,pitchWithRotate:false,
      touchPitch:false,renderWorldCopies:false});
    mapRef.current=map;
    map.addControl(new maplibregl.AttributionControl({compact:true}),'bottom-right');
    const controller:MapController={
      home:()=>map.fitBounds(initialBounds,{padding:40,duration:650}),
      zoomIn:()=>map.zoomIn({duration:250}),
      zoomOut:()=>map.zoomOut({duration:250}),
    };
    controllerRef.current(controller);
    const observer=new ResizeObserver(()=>map.resize());
    observer.observe(container.current);
    let disposed=false;
    map.on('load',async()=>{
      if(disposed)return;
      map.addSource('countries',{type:'geojson',data:empty});
      map.addLayer({id:'country-fill',type:'fill',source:'countries',paint:{'fill-color':'#d9e9e0','fill-opacity':0.28}});
      map.addLayer({id:'country-border',type:'line',source:'countries',paint:{'line-color':'#174c3c','line-width':2,'line-opacity':.92}});
      map.addLayer({id:'country-selected',type:'line',source:'countries',filter:['==',['get','id'],'__none__'],paint:{'line-color':'#d18f2c','line-width':3.3}});
      map.on('click','country-fill',(event)=>{
        const id=event.features?.[0]?.properties?.id;
        if(typeof id==='string')onSelectRef.current(id);
      });
      map.on('mouseenter','country-fill',()=>{map.getCanvas().style.cursor='pointer';});
      map.on('mouseleave','country-fill',()=>{map.getCanvas().style.cursor='';});
      try {
        const [originalResponse,simplifiedResponse]=await Promise.all([
          fetch(asset('countries-original.geojson')),fetch(asset('countries-simplified.geojson')),
        ]);
        if(!originalResponse.ok||!simplifiedResponse.ok)throw new Error(`HTTP ${originalResponse.status}/${simplifiedResponse.status}`);
        const [original,simple]=await Promise.all([originalResponse.json(),simplifiedResponse.json()]) as [FeatureCollection,FeatureCollection];
        if(disposed)return;
        cached.current={original,simplified:simple};
        const mode=container.current?.dataset.simplified==='true';
        (map.getSource('countries') as GeoJSONSource).setData(mode?simple:original);
        map.fitBounds(initialBounds,{padding:Math.min(window.innerWidth<700?30:64,64),duration:0});
      } catch(error) {
        if(!disposed)setMapError(`Boundary data could not be loaded: ${String(error)}`);
      }
    });
    return ()=>{disposed=true;observer.disconnect();controllerRef.current(null);map.remove();mapRef.current=null;};
  },[]);

  useEffect(()=>{
    if(container.current)container.current.dataset.simplified=String(simplified);
    const map=mapRef.current;
    const data=cached.current;
    if(map?.isStyleLoaded()&&data&&map.getSource('countries')){
      (map.getSource('countries') as GeoJSONSource).setData(simplified?data.simplified:data.original);
    }
  },[simplified]);

  useEffect(()=>{
    const map=mapRef.current;
    if(!map)return;
    const update=()=>{
      if(!map.getLayer('osm-raster'))return;
      map.setLayoutProperty('osm-raster','visibility',basemap==='standard'||basemap==='grayscale'?'visible':'none');
      map.setLayoutProperty('dark-raster','visibility',basemap==='dark'?'visible':'none');
      map.setPaintProperty('osm-raster','raster-saturation',basemap==='grayscale'?-1:0);
      map.setPaintProperty('background','background-color',basemap==='dark'?'#152b25':'#eff5f0');
      if(map.getLayer('country-fill'))map.setPaintProperty('country-fill','fill-color',basemap==='dark'?'#90b9a4':'#d9e9e0');
      if(map.getLayer('country-border'))map.setPaintProperty('country-border','line-color',basemap==='dark'?'#c7e1d2':'#174c3c');
    };
    if(map.isStyleLoaded())update();
    map.on('load',update);
    return ()=>{map.off('load',update);};
  },[basemap]);

  useEffect(()=>{
    const map=mapRef.current;
    const update=()=>{
      if(!map.getLayer('country-border'))return;
      const filter:['in',['get','id'],['literal',string[]]]=['in',['get','id'],['literal',visible]];
      map.setFilter('country-fill',filter);
      map.setFilter('country-border',filter);
      map.setFilter('country-selected',['all',filter,['==',['get','id'],selected??'__none__']]);
    };
    if(map?.isStyleLoaded())update();
    map?.on('load',update);
    return ()=>{map?.off('load',update);};
  },[visible,selected]);

  return <div className="map-shell" aria-label={locale==='en'?'Interactive country boundary map':'Hartă interactivă cu frontierele naționale'}>
    <div className="map-canvas" ref={container}/>
    {mapError&&<div role="alert" className="map-error">{mapError}</div>}
  </div>;
}