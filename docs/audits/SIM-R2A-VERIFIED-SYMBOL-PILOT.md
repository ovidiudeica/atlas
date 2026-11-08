# SIM-R2a — primul lot de simboluri teritoriale oficiale

**Stare:** implementare exclusiv de prezentare. Catalogul certificat RO/MD din 5 octombrie 2026 şi geometriile rămân nemodificate. Sursa integrală a auditului: [SIM-R1](SIM-R1-OFFICIAL-TERRITORIAL-SYMBOLS-20261108.md) (PR #64, draft, neintegrat).

## Simboluri introduse numai cu ID exact

| Atlas ID | Posesor teritorial | Simboluri | Act şi imagine |
|---|---|---|---|
| `osm-r1699032` | UTA Găgăuzia | Stemă + drapel | Legile locale nr. 2-IV/I din 31.10.1995 şi 13-X/I din 28.06.1996; imagini guvern/Commons |
| `osm-r1748490` | Municipiul Chișinău (ADM8) | Stema mare | Decizia CMC nr. 5/2 din 19.12.2019 şi Decretul nr. 1475-VIII din 02.03.2020; Comisia Naţională de Heraldică |
| `osm-r1813306` | Sectorul Botanica | Stemă | Aceleaşi acte; planşa CNH |
| `osm-r1813297` | Sectorul Buiucani | Stemă | Aceleaşi acte; planşa CNH |
| `osm-r58512` | Sectorul Centru | Stemă | Aceleaşi acte; planşa CNH |
| `osm-r1813315` | Sectorul Ciocana | Stemă | Actele şi [site-ul Preturii Ciocana](https://ciocana.md/simbolurile-sectorului); planşa CNH |
| `osm-r1813316` | Sectorul Rîșcani | Stemă | Aceleaşi acte; planşa CNH |

**Atenţie:** `osm-r1691801` (municipiul Chișinău la ADM4) şi `osm-r1748490` (oraşul/municipiul de rang ADM8) au identităţi cartografice diferite în atlas. Lotul atribuie simbolul **numai** ID-ului ADM8, fără propagare automată la părintele ADM4. Aceasta nu afirmă o diferenţă a titularului juridic, ci evită confundarea geometriilor.

## Proveniență, utilizare şi licenţe

- [Portalul oficial al Găgăuziei](https://www.gagauzia.md/ato-gagauziya/simvolika.html) reproduce atât actul drapelului (1995), cât şi actul stemei (1996). Stema grafică a fost preluată de pe portalul oficial, redusă tehnic la 360px lăţime fără redesenare.
- [Drapelul Găgăuziei, Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Flag_of_Gagauzia.svg) este asociat explicit cu legea regională şi disponibil sub declaraţia de domeniu public pentru simboluri oficiale.
- [Comisia Naţională de Heraldică](https://cnh.prm.md/) expune stema municipiului Chișinău şi cele cinci steme de sector. Originalele sunt `Stema-Chisinau.jpg` şi `Sectoare.jpg`. Am păstrat originalul planşei drept probă şi **decupat fără redesenare** cinci segmente de câte 208px (ordine stânga–dreapta: Botanica, Buiucani, Centru, Ciocana, Rîșcani). Elementele heraldice nu au fost modificate.
- [Pretura Ciocana](https://ciocana.md/simbolurile-sectorului) confirmă identificarea sectorului Ciocana prin câmpul negru cu ciocane încrucişate şi soare; reproduce art. 12(3) din Legea privind simbolurile publice: folosirea ilustrativă/informativă nu necesită acord, **dar trebuie indicat deţinătorul**.
- [Regulile municipale Chișinău](https://dgect.chisinau.md/simbolica-locala/procedura-de-obtinere-a-dreptului-de-utilizare-a-toponimicului-chisinau/) disting utilizarea în sigla/brandul unei persoane juridice (supusă aprobării) de ilustrarea informativă. Atlasul identifică explicit posesori şi nu revendică simbolurile drept marcă proprie.
- Fișierul [SIM-R2A-EVIDENCE.json](SIM-R2A-EVIDENCE.json) include SHA-256 al fiecărui simbol şi raportarea la sursa oficială / decupaj.
 
## Cazuri excluse expres din această etapă

**Bucureşti:** Hotărârea CGMB nr. 47 din **31.01.2024** modifică şi înlocuieşte anexa grafică a HCGMB nr. 76/1993: schimbarea reprezentării sfântului militar cu Sfântul Dimitrie cel Nou. Vechea stemă din HG nr. 685/1998, întâlnită în Commons, **nu trebuie introdusă ca stemă actuală** până la verificarea anexei grafice curente: https://doc.pmb.ro/legis/acteinterne/2024/45550/h047_24.pdf

**Nu moştenesc simboluri:** entităţile statistice NUTS/NTS, UATSN/ATULBD, copiii Găgăuziei, geometriile diferite ale Chișinăului şi comunele omonime. Niciun ID nelistat nu primeşte o stemă pe baza denumirii, a vecinătăţii sau a unui fişier Wikidata.

## Plan sistematic ulterior

1. Reconciliere heraldică a judeţelor RO și raioanelor MD cu autoritatea de aprobare, anexa şi versiunea grafică actuală; audit per-ID înainte de UI.
2. Municipii / oraşe: steme, apoi drapele locale numai când sunt aprobate şi identificate.
3. Comune / sate: lucrări pe judeţe/raioane în registre, cu cazurile fără simbol oficial păstrate explicit ca *neconfirmate*; nu se inventează embleme.
4. Fiecare import trebuie să aibă ID Atlas, titular, act, sursă grafică, hash, statut al drepturilor şi test desktop/mobil.
