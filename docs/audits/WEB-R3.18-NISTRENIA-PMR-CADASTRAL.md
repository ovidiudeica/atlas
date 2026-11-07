# WEB-R3.18 — Nistrenia: ordine cadastrală și coduri în fișele ADM5

**Data:** 2026-11-07. **Repo:** `ovidiudeica/atlas`. **Bază:** `main` `845ef2f49fcc07e8670217a1b8ce6dbae83a871a`.

## Sursă oficială a clasificării

Ordinul Ministerului Agriculturii și Resurselor Naturale al PMR **nr. 361 din 25 decembrie 2015** (înregistrat la 3 martie 2016, nr. 7368), **anexa nr. 2**, intitulată „Кадастровые коды административно-территориальных единиц и номера кадастровых зон”.

Document: https://ulpmr.ru/ul/show/15qmcSyGNzdrq4CHg3YTYT7pZL4prutaleyY%3D

Aceste coduri sunt **coduri de unități cadastrale asociate reședințelor**, utilizate în structura numerelor cadastrale ale terenurilor. Ele **NU sunt coduri CUATM** (clasificator al Republicii Moldova), **NU sunt identificatori KLADR PMR** (clasificatorul de adrese) și **NU echivalează** cu dovada identității geometrice a unui raion/consiliu ADM5 OSMB cu o unitate cadastrală. De exemplu, anexa distinge Tiraspol `33` de Dnestrovsc `79`, deși Atlasul are un consiliu ADM5 Tiraspol; asocierea `33` se face **prin localitatea-reședință**, nu prin extinderea codului peste întregul consiliu.

## Corespondență explicită și ordine numerică

| Poziție | ID Atlas (relație OSM) | Copil ADM5 | Cod PMR cadastral (al reședinței) | Anexa nr. 2 |
|---|---|---|---|---|
| 1 | `osm-r944727` | Bender | **32** | Бендеры |
| 2 | `osm-r1702219` | Tiraspol | **33** | Тирасполь |
| 3 | `osm-r1702214` | Grigoriopol | **40** | г. Григориополь |
| 4 | `osm-r1702215` | Dubăsari | **45** | г. Дубоссары |
| 5 | `osm-r1702217` | Rîbnița | **55** | г. Рыбница |
| 6 | `osm-r1702218` | Slobozia | **57** | г. Слободзея |
| 7 | `osm-r1702216` | Camenca | **66** | г. Каменка |

**Nu introducem cod cadastral pentru Nistrenia însăși**: nu este documentat unul în anexa consultată. Valorile se afișează numai în cardurile celor **șapte copii direcți ADM5**.

## Implementare

- `src/data/pmrCadastral.mjs`: registru de **prezentare**, 7 asocieri prin ID Atlas, metadate ale actului și URL de sursă. Sursă unica pentru sortare și card; fără date inventate.
- `src/data/treeOrder.mjs`: doar `parentId==='osm-r65335'`, vederi `all` / `administrative`. Ordine 32–66, independentă RO/EN; ID-urile neprevăzute fără cod revin la sortarea stabilă existentă. Regula generală Moldova NTS → CUATM rămâne neatinsă.
- `src/App.tsx`: în `metadata`, rubrica bilingvă **„Cod cadastral PMR” / „PMR cadastral code”** arată codul și **sursa ca link**; text explicativ obligatoriu avertizează că nu este un ID KLADR/CUATM sau o dovadă de identitate geometrică. **Nu** se adaugă rubrica „KLADR PMR” până când codurile KLADR reale nu sunt extrase și verificate. Cele două sisteme au contracte distincte.
- Catalogul certificat 4.283 de entități, `registry` CUATM/SIRUTA, hashurile geometriei, parentajele `treeParentId` și `administrativeParentId`, codurile și datele exportate rămân **identice**.

## Separarea KLADR

Clasificatorul `КЛАДР ПМР` are identificatori unici proprii, administrați de GUP „РРИЦ”, și o ierarhie a obiectelor de adresă. Descrierea operatorului: https://www.rric.org/List/KladrMain.aspx . Nu s-a stabilit în acest PR o corespondență per-ID între OSMB și identificatorii KLADR. Când este verificată, recomand rubrica **separată** „KLADR PMR” în card, cu referință, proveniență și tratament explicit al cazurilor neechivalente.

## Verificări

1. Exact 7/7 ID-uri, coduri, sursă documentată, lipsa codurilor pe noduri neasociate și lipsa CUATM fabricate.
2. Comparație în vederi administrative și mixte, atât RO cât și EN; regresii asupra Moldovei și României.
3. Chromium desktop/mobil: ordinea vizibilă; toate cele șapte fișe afișează codul, linkul oficial și avertizarea.
4. Integrare PR pe SHA exact numai după CI complet reușit, apoi CI `main` și GitHub Pages.

**Limitare:** această etapă nu completează încă localitățile din raioanele Nistreniei. Va urma proiecția administrativă paralelă, într-un proiect separat.
