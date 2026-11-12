# HIST-0.4n — Biblioteca Parlamentului Ungariei și controlul independent al sitului Kővár

**Data:** 12 noiembrie 2026 · **Bază:** `main@3b37ce3bc756509dda661ee7deb7b8310576ce4f` (PR #105/HIST-0.4m). **Intervenție:** exclusiv audit de surse, fără frontiere istorice noi.

## 1. Actele parlamentare din 1877: canalul instituțional este identificat și pregătit

Patru tipărituri sunt localizate exact, dar numai prin indexul Hungaricana: *Képviselőházi irományok* 1875 XIV nr.503 p.4 (viewer index 13) și nr.529 p.150 (index 159); *Főrendiházi irományok* 1875 IV nr.204 p.271 (index 282) și nr.231 p.364 (index 375). Indicii OCR conțin grafia `Szt Kápolnok`, în timp ce legea 1877:I §2 păstrează `Szt.-Kápolnok`. **0/4 facsimile parlamentare au fost citite direct**: imaginile originalelor nu au fost accesibile prin vizualizatorul Hungaricana. Acordul OCR între documente înrudite nu este suficient pentru a demonstra sensul `Szt.` sau o rectificare.

Am confirmat adresa publică **konyvtar@parlament.hu** din [site-ul oficial al Országgyűlési Könyvtár](https://konyvtar.parlament.hu/en/home), apoi am pregătit în Gmail **un draft în limba maghiară, neexpediat**, care solicită numai un URL public gratuit sau îndrumare bibliografică/paleografică, fără comandă, copiere contra cost ori abonament. Nu a fost inițiată o cerere în numele utilizatorului la bibliotecă; datele private ale contului și identificatorul draftului **nu** sunt publicate în repository. Matricea este în `szt-parliamentary-institutional-access.json`.

**Verdict juridic:** identificarea bibliografică este calificată; `Szt.-Kápolnok` rămâne grafia legii; `Szurdok-Kápolnok/Copalnic` rămâne candidatul istoric independent, **fără corecție oficială demonstrată sau identitate juridică de comună certificată**.

## 2. Noua dovadă contemporană: Pesty Frigyes, Berkeszpataka 1865

Am confruntat trei surse distincte privind ruinele Cetății Chioarului:

1. [Kővári László, *Erdély régiségei* (1852), §105, p.169](https://mek.oszk.hu/21900/21944/21944.pdf) descrie cetatea ca ruină, pe malul stâng al Lăpușului, și o atribuie descriptiv hotarului satului **Butyásza**; menționează două componente ale cetății, nu un singur punct.
2. [Pesty Frigyes, *Kéziratos helynévtára 1864 – Kővár vidéke* (ediția critică 2023), pp.11–12](https://mnhp.unideb.hu/kiadvanyok/pesty/pesty_kovar-kraszna.pdf) reproduce răspunsul local din **Berkeszpataka, 7 aprilie 1865** (manuscris OSZK **Fol. Hung. 1114/23**). În inventarul toponimelor localității apare **„Lá Kővár”**, descris ca veche cetate deja ruinată, cu Lăpușul curgând la est de dealul ei. Aceasta este o **transcriere editorială a mărturiei locale**, nu facsimilul manuscrisului original, și nu poate certifica geometria hotarului.
3. [Borovszky, monografia comitatului Szatmár, intrarea *Berkeszpataka*](https://www.mek.oszk.hu/09500/09536/html/0020/7.html) localizează ruinele pe dealul **Vurfu Corniciului** și le asociază teritoriului Berkeszpataka.

**Nu trebuie armonizate artificial** atribuirea la Butyásza în 1852 cu descrierile Berkeszpataka în 1865 și la începutul secolului XX: ele pot reflecta altă perspectivă asupra hotarelor, apartenenței, uzului toponimic sau diferențe cronologice. Nu există sursă cadastrală aici care să decidă problema.

În controlul contemporan, [RAN 108525.01](https://ran.cimec.ro/sel.asp?Lang=EN&codran=108525.01) identifică monumentul la circa **3 km sud de Berchezoaia**, pe o culme stâncoasă de pe **malul stâng** al Lăpușului; [Primăria Remetea Chioarului](https://remeteachioarului.ro/2023/10/18/cetatea-chioarului/) descrie două dealuri și construcții pe aproximativ **600 m**. Această întindere exclude echivalarea centrului generic al sitului cu o ruină punctuală precisă.

## 3. Hartă independentă efectiv inspectată: „Gaura und Galgó”

Am recuperat gratuit o previzualizare **3.840 px** (SHA-256 `4bb09db2c0fcf2f8e774d44dc2f409df8ceb0b9320875bf8796d885c207ca0bf`) din exemplarul [New York Public Library / Wikimedia Commons, *Gaura und Galgo. NYPL1226642.tiff*](https://commons.wikimedia.org/wiki/File:Gaura_und_Galgo._NYPL1226642.tiff). Originalul listat are **4.496 × 5.419 px**, scara **1:75.000**; fișa Wikimedia consemnează statutul public-domain/CC0. Am rotit și examinat local previzualizarea, inclusiv zona **Berkeszpataka–Butyásza, Lăpuș**.

**Corecție de proveniență:** pe exemplarul NYPL se citesc referințe la reambularea **1893/1894** și la **„Nach Zeichenschlüssel 1904”**. Exemplarul nu trebuie numit „harta 1886”. O [ediție distinctă din 1886, aceeași denumire și scară](https://igrek.amzp.pl/11860629), este **identificată numai în catalogul MAPSTER/LoC** și nu a fost confundată cu rasterul NYPL inspectat. Nici exemplarul târziu, nici metadatele MAPSTER nu confirmă automat un simbol unic de cetate.

Relația dintre harta 1904 și harta MNL (stare 1859, fotografie 1861) este **comparație topografică între epoci**, nu transformare GIS admisă. Fișierul `mapster-1886-vs-nypl-revised-map-source-gate.json` păstrează distinct fiecare exemplar, linkurile, drepturile, anul de probă, hashul previzualizării și statutul GCP.

## 4. GCP și hotare — păstrarea porților închise

Cetatea Chioarului a devenit un **reper documentar fizic bine localizat la nivel de relief**, nu un punct geodezic demonstrat. În MNL fotografia 2 nu a fost identificat fără echivoc un simbol punctual al aceleiași ruine; trei coordonate moderne apropiate ale sitului rămân puncte **publicate**, nu măsurători independente de vârf/bastion. Meandrul Lăpușului și culmea cetății nu sunt de la sine puncte fixe cu coordonate exacte.

- **0 perechi verificate** `pixel original MNL → obiect fizic univoc → punct geodezic independent`.
- **0 GCP-uri admise**, **0 RMS nou** (nedefinit, nu zero), **0/14 fotografii georeferențiate certificate**.
- **0/82** segmente Landesgrenzen Transilvania, **0/15** segmente Chioar și **0/37** relații OHM admise.
- **0 modificări** ale aplicației, arborelui ISTORIC sau ACTUAL, OSMB, OHM, `src/`, `public/`; **0 plăți/comenzi**; **0 materiale MNL/NYPL/KMZ private republicate**.

## 5. Poarta următoare, HIST-0.4o

Pentru sursa juridică: acces la **exact cele patru foi tipărite** și, dacă există, rectificarea din *Budapesti Közlöny*, cu citire vizuală, dată și proveniență. Draftul instituțional poate fi expediat doar după autorizarea explicită de trimitere; nu este o comandă de digitalizare.

Pentru georeferențiere: recuperarea cartografiei topografice detaliate a ruinelor, ideal foile originale I/II ridicare militară sau cadastre contemporane, compararea unui **vârf stâncos/bastion/intersecții de ape unic** în cele două epoci, coordonate geodezice în teren sau ortofotoplan verificat, apoi minimum patru puncte distribuite pentru ajustare și puncte independente holdout. Numai o sursă legală separată poate certifica hotarul.
