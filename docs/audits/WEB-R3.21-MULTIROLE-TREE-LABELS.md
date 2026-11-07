# WEB-R3.21 — etichete multirole statistice → administrative

`territorialRoleLabels(entity)` rezolvă semnificațiile din modelul WEB-R3.19a, independent de numele, poziția în arbore sau ID-ul OSM. Output-ul este ordonat: **NUTS/NTS înainte de ADM**, fără repetarea aceleiași etichete. Acesta este un rezumat de roluri, nu o listă de geometrii.

- București `osm-r377733`: **NUTS 3 · ADM 4 · ADM 8**. ADM4 este `admin_level` OSM real; ADM8 este numai rolul municipal SIRUTA `179132`. Un tooltip bilingv explică diferența.
- Municipiul Chișinău `osm-r1691801`: **NTS 3 · ADM 4**, potrivit rolurilor statistice MD115 și nivelului administrativ OSM real. Orașul Chișinău `osm-r1748490`: **ADM 8**; eticheta orașului nu se adaugă automat municipiului.
- Nistrenia: nivelurile OSM reale ale celor șapte ADM5, cu codul cadastral PMR prezentat separat în card. Codurile PMR nu sunt niveluri și nu sunt KLADR.
- **Filtrele OSM** folosesc în continuare numai `Territory.adminLevel`; nu li se adaugă un filtru ADM8 pentru București.

Nu se schimbă datele canonice, parentajul, ID-urile, geometriile, exporturile și permalinkurile. Funcția de generare este reutilizabilă de toate cele 4.283 de entități.

## Acceptare

`tests/web-r321-multirole-labels.test.mjs` verifică integral inventarul, ordinea, neduplicarea și non-mutația, plus București, Chișinău și Nistrenia. Chromium desktop/mobil verifică afișarea noii etichete în arbore, explicarea SIRUTA și funcționarea ordonării/indentării deja acceptate. Gate: CI integral pe SHA exact, capturi examinate, merge protejat, CI `main` și publicare Pages.
