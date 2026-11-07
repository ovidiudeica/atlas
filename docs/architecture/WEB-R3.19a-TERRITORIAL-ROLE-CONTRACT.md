# WEB-R3.19a — contractul de roluri teritoriale

Referință: catalog ACTUAL certificat, 4.283 entități (RO 3.241; MD 1.042), OSMB 2026-10-05. Implementarea este **exclusiv de prezentare**: `resolveTerritorialRoles()` nu schimbă și nu rescrie nicio înregistrare.

## Domenii diferite, fără inferențe între ele

1. **Statistic**: `statisticalRoles[]` → clasificare NUTS/NTS, versiune, nivel, cod și `parentCode`. Părintele statistic nu este în mod automat un superior administrativ.
2. **Administrativ**: statutul/rolul administrativ ține de clasificatorul relevant, de `registry.system/code/record`, de nivel și de părintele administrativ **documentat**. `administrativeParentId` reprezintă relația existentă în catalog; nu substituie demonstrarea juridică externă. Rolurile de registru suplimentare sunt anotări, nu entități.
3. **Cartografic**: `osmRelationId`, nivel OSM efectiv `adminLevel`, `geometryShard`, sursă OSMB și data instantaneului. Relațiile de includere, contiguitate și partiționare sunt spațiale, nu probe suficiente ale subordonării juridice.

Nu deducem un nivel OSM din rolul SIRUTA, nu deducem un părinte juridic din geometrie și nu deduplicăm identitățile înregistrate în catalog. Un nod poate avea mai multe roluri, dar nu primește o a doua geometrie prin acest fapt. Filtrele de geometrie folosesc **numai** `adminLevel` OSM original.

## Excepții explicite

**București**: relația OSM `377733` este ADM4, NUTS3 RO321, SIRUTA de nivel județean `403`. Înregistrarea SIRUTA municipală `179132` are părinte de clasificator `403` și se prezintă ca rol administrativ municipal de nivel echivalent ADM8. Este **rol național de prezentare**, nu relație OSM ADM8, nu geometrie și nu nod suplimentar. Cele șase sectoare ADM9 rămân identități autentice; la ordonare folosesc SIRUTA.

**Chișinău**: municipiul ADM4 `osm-r1691801` și orașul ADM8 `osm-r1748490` sunt două entități și geometrii preexistente distincte. Indentarea grafică a celor cinci sectoare sub oraș este doar o alegere de prezentare. Părintele administrativ din sursă rămâne municipiul; vizualizarea nu poate redefini această relație. Accesul direct la oraș și la geometria sa se păstrează.

**Nistrenia**: delimităm rolurile legale în clasificatorul Republicii Moldova de cele folosite de administrația de facto. Codurile cadastrale PMR 32–66 se referă la reședințele unităților și **nu** sunt coduri CUATM sau identificatori KLADR PMR. Geometriile nu demonstrează echivalență jurisdicțională. Nu creăm încă roluri KLADR și nu modificăm structura celor șapte ADM5.

## Aserțiuni / gate

- 4.283 identități, 3.241 RO și 1.042 MD; rezolvarea rolurilor este pură și nemutantă.
- Pentru fiecare entitate, rolurile statistice reflectă codul, clasificarea, versiunea, nivelul și părintele original; datele cartografice oglindesc exclusiv proprietățile OSMB.
- București este un singur nod: două roluri administrative prezentabile, **un singur** nivel OSM ADM4, fără geometrii ADM8 sintetice.
- Chișinău ADM4 ≠ oraș Chișinău ADM8; ID-urile și geometriile nu se unifică.
- Ordonarea se aplică numai fraților de prezentare; nu editează parentajele canonice.
- Orice promovare cere verificarea integrală a workflow-ului, inclusiv Chromium desktop/mobil și dovezile publicării Pages.

**Trasabilitate**: codurile București `403` / `179132` sunt separate explicit în contractul SIRUTA, fără a pretinde că `179132` există drept relație OSM. Când va fi importată sursa registrului municipal complet, se va păstra distinct proveniența ei fără a rescrie catalogul ACTUAL.
