import {readFile,writeFile} from 'node:fs/promises';
import {root} from './network.mjs';
const r=JSON.parse(await readFile(new URL('docs/audits/SIM-R5-RESULTS.json',root)));
const manual=JSON.parse(await readFile(new URL('docs/audits/sim-r5/manual-decisions.json',root)));
const cell=s=>String(s??'—').replaceAll('|','\\|').replaceAll('\n',' ');
const table=(headers,rows)=>'| '+headers.join(' | ')+' |\n| '+headers.map(()=>'---').join(' | ')+' |\n'+rows.map(row=>'| '+row.map(cell).join(' | ')+' |').join('\n');
const result=r.results;
let text=`# SIM-R5 — auditul stemelor și drapelelor

Inventar exhaustiv, cercetare disponibilă și corecții conservatoare. Acest raport nu declară toate imaginile autentificate și nu echivalează o căutare sau o asociere Wikidata cu certificarea juridică.

## Bază și integritate

Pornire de la main verificat: \`${r.baseCommit}\`. Catalogul are ${r.baseline.entities} de identități exacte și ${result.slots} de înregistrări distincte stemă/drapel. SHA256 al catalogului certificat: \`${r.catalogSHA256}\`. Geometriile, codurile, clasificările și relațiile părinte–copil nu au fost modificate. Cele 84 de fișiere protejate din manifest sunt confruntate cu bloburile Git ale bazei, inclusiv toate imaginile locale SIM-R2a.

SIM-R4 rămâne snapshot imuabil: ${r.baseline.coat} steme, ${r.baseline.flag} drapele, ${r.baseline.both} entități cu ambele, ${r.baseline.withoutImages} fără imagini și ${r.baseline.candidate} atribuiri CANDIDATE. Snapshotul corectat are ${r.currentCoverage.coat} steme, ${r.currentCoverage.flag} drapele, ${r.currentCoverage.both} entități cu ambele și ${r.currentCoverage.withoutImages} fără imagini.

## Rezultate

Au fost examinate ${result.examined} atribuiri existente, prin verificări per-ID ale metadatelor, identităților, surselor și căutărilor documentare. Comparațiile grafice aprofundate sunt un subset documentat: ${r.visualReview.sourcePairs} perechi de surse și ${r.visualReview.documentedSymbolDecisions} decizii per simbol, inclusiv verificarea geometrică a drapelului României. Pentru celelalte reprezentări fidelitatea față de o anexă actuală rămâne explicit neconfirmată.

${table(['Verdict asupra imaginii inițiale','Număr'],Object.entries(result.verdicts))}

Au fost eliminate ${result.removed} atribuiri și înlocuite ${result.replaced} imagini. După corecții există ${r.currentVerified.coat} steme și ${r.currentVerified.flag} drapele cu reprezentarea curentă confirmată prin probele descrise. ${result.currentUnconfirmed} imagini păstrate nu au certificare completă. ${result.rightsUnclear} reproduceri inițiale au drepturi neclarificate; acest verdict este separat de autenticitate. ${result.needsFurtherReview} cazuri necesită o verificare suplimentară de identitate, versiune, drepturi sau alternativă pentru atribuirea eliminată.

Verdictul inițial OUTDATED_VERSION/HISTORICAL_ONLY rămâne în audit chiar după înlocuire; verdictul și drepturile imaginii recomandate sunt câmpuri separate. MISSING numără sloturile inițial nule, nu șterge istoricul corecției.

${table(['Verdict în snapshotul curent','Număr'],Object.entries(r.currentVerdicts))}

## Jurisdicții și titulari

${table(['Grup din catalog','Atribuiri examinate','Steme curente','Drapele curente','Steme confirmate','Drapele confirmate','Înlocuite','Eliminate'],Object.entries(r.byScope).map(([name,s])=>[name,s.examined,s.currentCoats,s.currentFlags,s.currentVerifiedCoats,s.currentVerifiedFlags,s.replaced,s.removed]))}

Clasificarea de raportare urmează părinții administrativi certificați. Nistrenia de facto are aici ${r.byScope.Nistrenia_de_facto.slots/2} identități distincte, inclusiv cele șapte ADM5; simbolurile orașelor nu au fost propagate automat acestor unități. Separat, grupul recunoscut CUATM din stânga Nistrului are ${r.recognizedLeftBank.slots/2} identități, ${r.recognizedLeftBank.currentCoats} steme și ${r.recognizedLeftBank.currentFlags} drapele curente, incluse în Moldova. Acesta nu este reclasificat drept administrație de facto. Bender rămâne în propria identitate certificată; sursele de facto sunt marcate ca atare în decizia sa.

Găgăuzia este subset al Moldovei: ${r.gagauzia.slots/2} identități, ${r.gagauzia.examined} atribuiri examinate, ${r.gagauzia.currentCoats} steme și ${r.gagauzia.currentFlags} drapele curente; ${r.gagauzia.currentVerifiedCoats} stemă și ${r.gagauzia.currentVerifiedFlags} drapele confirmate. Stema UTA este coroborată cu legea și imaginea actuală a autorității; nuanțele drapelului diferă între SVG și GIF-ul instituțional și nu au fost inventate corecții de culoare.

## Corecții documentate

${table(['Atlas ID','Simbol','Acțiune','Verdict inițial','Verdict imagine recomandată'],manual.decisions.filter(d=>d.action!=='KEEP').map(d=>[d.atlasId,d.kind,d.action,d.verdict,d.replacementVerdict||'null — substitut neutru']))}

- Făurei, Neamț (SIRUTA 122613): fișierul descrie explicit Făurei, Brăila. Atribuirea a fost eliminată, cu imaginea veche și contradicția păstrate în audit.
- Hunedoara: stema istorică cu un singur câmp și corb străpuns de săgeată a fost înlocuită cu reproducerea compoziției din HG 685/1998. Documentul municipal folosit pentru comparație este intitulat proiect de statut; nu este prezentat drept act adoptat. Noua imagine are SOURCE_CORROBORATED, fără certificarea integrală a anexei naționale.
- Copanca și Vălcineț: reproducerile inițiale omiteau talpa albă de un sfert prevăzută și desenată în anexele prezidențiale. Noile PNG-uri sunt decupaje literale ale anexelor, redimensionate tehnic, cu coordonate și hashuri în replacement-provenance.json. Nu s-au redesenat simbolurile și nu s-au recolorat scanările.
- Jilava este păstrată: tokenul IL din numele fișierului nu prevalează asupra descrierii Ilfov și HG 1338/2022. Exemplul protejează împotriva eliminării automate după abrevieri.
- Câmpulung: PNG-ul, SVG-ul alternativ și descrierea municipală diferă asupra culorii și acvilei superioare; verdict DISPUTED, fără înlocuire inventată. Creditarea unor părți din logoul Lions Club impune separat RIGHTS_UNCLEAR pentru PNG.
- Drapelul Tălmaciu: descrierea înainte de 1918 contrazice indicii din reprezentarea încărcată în 2013 și utilizarea contemporană în articol. DISPUTED, păstrat; nu este eliminat doar din cauza titlului.
- Bender: autoritatea de facto documentează readoptarea unui desen istoric în 2003. Originea istorică nu este singură dovadă de utilizare exclusiv istorică. Versiunea și aplicabilitatea pentru identitatea recunoscută rămân neconfirmate.

## Cazuri prioritare și limite documentare

${table(['Atlas ID','Act / referință','Concluzie'],r.priorityFindings.map(p=>[p.atlasId,p.act||'Vezi sursele per-ID',p.finding]))}

Taraclia: decretul 241-IX/22.11.2021 și anexele au fost recuperate. Stema are aceeași compoziție cu reproducerea districtului; proporția leului din drapel diferă între JPEG și anexă, astfel că drapelul rămâne SOURCE_CORROBORATED. Licențierea JPEG-urilor instituționale este evaluată separat.

Chișinău și sectoare: indexul Monitorului Oficial reconfirmă decretul 1475-VIII/2020; JPEG-ul CNH și planșa sursă au aceleași hashuri ca în SIM-R2a. Decodările independente ale JPEG-ului pot diferi cu până la 3/255 pe canal, deci nu sunt declarate identice pixel cu pixel. Anexa originală integrală a decretului rămâne necesară pentru certificarea completă. Un act pentru satul reședință nu este extins automat comunei: cazurile Gangura și Scumpia au această rezervă explicită. Cojușna este identificată în catalog drept sat, nu este reclasificată drept comună.

## Cele 18 entități exclusiv statistice

${table(['Atlas ID','Denumire certificată','Căutare','Stemă','Drapel','Rezultat'],r.statisticalRegions.map(s=>[s.atlasId,s.name,s.search,s.coat,s.flag,s.finding]))}

Nu a fost stabilit un simbol propriu pentru niciuna. Aceasta este limita cercetării, nu dovada inexistenței juridice. Nu au fost atribuite simboluri istorice, naționale, ale județelor componente sau ale instituțiilor statistice.

## Acoperire pe tip și nivel

${table(['Tip certificat','Atribuiri examinate','Steme curente','Drapele curente','Confirmate curente','Revizuire suplimentară'],Object.entries(r.byAdministrativeType).map(([type,s])=>[type,s.examined,s.currentCoats,s.currentFlags,s.currentVerifiedCoats+s.currentVerifiedFlags,s.needsFurtherReview]))}

${table(['Nivel administrativ','Atribuiri examinate','Steme curente','Drapele curente','Revizuire suplimentară'],Object.entries(r.byAdministrativeLevel).map(([level,s])=>[level,s.examined,s.currentCoats,s.currentFlags,s.needsFurtherReview]))}

## Surse și acces

${table(['Operațiune / probă','Număr'],Object.entries(r.sources))}

Cele ${r.institutionalAccess.cases} erori instituționale SIM-R4 sunt cazuri titular+URL, pentru ${r.institutionalAccess.holders} de titulari distincți: ${r.institutionalAccess.recovered} adrese recuperate, ${r.institutionalAccess.stillInaccessible} încă inaccesibile. Variantele de protocol/gazdă, URL-urile actuale Wikidata și paginile secundare sunt în registrul separat. Serviciul de disponibilitate Wayback a răspuns 429; nu sunt pretinse cercetări de arhivă care nu au avut loc.

Istorice de articole: ${JSON.stringify(r.articleHistory.states)}. Sunt cel mult cinci revizii ale unui articol legat exact și care folosește fișierul selectat, nu o certificare a întregului istoric sau examinarea fiecărui diff. Stările fără articol corespunzător, rate-limited și deferred rămân distincte. Hashurile Commons sunt raportate de sursă pentru original; SHA256 independente există numai pentru descărcările reușite. Restricțiile HTTP nu sunt dovezi de atribuire greșită.

## Registre și verificare tehnică

- Registru inițial complet: public/data/symbols/audit-initial.json.gz.
- Registru final per-ID și per simbol, cu contradicții, drepturi, hashuri, imagini vechi/recomandate și limite: public/data/symbols/audit.json.gz.
- Snapshot corectat: public/data/symbols/registry-current.json.gz; snapshotul SIM-R4 nu este suprascris.
- Export tabelar complet: docs/audits/sim-r5/per-symbol-verdicts.csv; rezultate calculate: SIM-R5-RESULTS.json.
- Sursele și deciziile documentate: docs/audits/sim-r5/; reluare/reproducere: scripts/audit/sim-r5/README.md.

Testele obligatorii sunt npm test, npm run build și suita Chromium completă scripts/ci/browser-smoke.mjs. Acestea verifică inventarul, nulurile, sursele, lipsa certificărilor automate, conservarea, corecțiile, aceeași stemă în arbore și antet, lipsa substituirii cu drapel, scalarea desktop/mobil, accesibilitatea, fallbackul și încărcarea progresivă. Verificarea CI a SHA-ului exact și publicarea se consultă în [workflow-ul repository-ului](https://github.com/ovidiudeica/atlas/actions/workflows/website.yml). Integrarea folosește exclusiv branch-ul sim-r5-authenticity și protecțiile main.

Concluzia rămâne limitată la probele efectiv documentate. Cazurile CANDIDATE_UNVERIFIED, DISPUTED și RIGHTS_UNCLEAR sunt păstrate pentru cercetare suplimentară, fără certificări inventate.
`;
await writeFile(new URL('docs/audits/SIM-R5-AUTHENTICITY.md',root),text);
console.log('Report generated from audit results');
