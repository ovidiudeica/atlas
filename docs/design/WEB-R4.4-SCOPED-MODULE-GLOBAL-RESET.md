# WEB-R4.4 — resetare globală și resetare locală pe modul

**Propunere aprobată și implementată la cererea utilizatorului:** un singur buton global sub comenzile zoom/Home, plus câte un buton local lângă **X** în antetul fiecărui modul. Aceasta înlocuiește controlul lung `Restore initial geometry display` din partea de jos a arborelui Administrativ.

**Bază protejată:** `main` la `fc553c765366958ea374f08aa912fc57b8b26c23` (WEB-R4.3a). **Domeniu:** interfață și stare de prezentare, fără modificarea datelor ACTUAL.

## Contract de funcționare

| Acțiune | Poziție | Domeniu |
|---|---|---|
| `+` / `−` | Grupul de zoom | Numai cameră, fără selecții |
| `Acasă` / `Home` | Grupul de zoom | Numai încadrare, fără selecții |
| `↺` resetare **globală** | Sub grupul zoom/Home, separat vizual (desktop și mobil) | Golește selecțiile tuturor modulelor, filtrele Administrative/NUTS/NTS și selecția fișei; revine la **România + Republica Moldova** și încadrarea inițială; închide panourile. Păstrează limba, fundalul cartografic și simplificarea |
| `↺` resetare **locală** | Lângă `X` în antetul fiecărui modul, desktop și drawer mobil | Înlătură **numai** geometriile/selecțiile modulului respectiv; resetul Administrativ reface contururile implicit afișate RO+MD și curăță propriile filtre. Nu atinge selecțiile altui modul, camera, căutarea, arborele, setările vizuale sau starea de deschidere a modulului |
| `X` | Imediat lângă `↺` local | Închide panoul fără resetare |

### Izolarea modulelor

`src/data/moduleReset.mjs` implementează registrul de geometrii **separat pe șase module**. Harta folosește reuniunea deduplicată a selecțiilor tuturor modulelor și a filtrelor Administrative. Două module pot afișa aceeași geometrie fără duplicarea conturului; resetarea unuia păstrează geometria cât timp alt modul o selectează.

**Situație reală actuală:** doar modulul **Administrativ** are conținut și selecții funcționale; celelalte cinci module sunt planificate și au deocamdată selecții goale. Butoanele lor locale sunt afișate, dar inactive până când există selecții proprii. Nu inventăm funcții istorice, etnografice ori de reformă încă inexistente.

Selectarea unei fișe păstrează proprietarul `selectedModule`: resetul local închide numai fișa deținută de acel modul și elimină numai parametrul `entity` din URL, nu camera. La dezactivarea unui buton local după resetare, focusul se mută pe vecinul său `X`. Resetul global este disponibil permanent, inclusiv când utilizatorul dorește doar revenirea la încadrarea implicită.

## Teste și limite

- `tests/web-r44-scoped-resets.test.mjs`: izolare la modul (inclusiv geometrii suprapuse), deduplicare, condiții de activare, reset global, poziționarea butoanelor, checksum ACTUAL.
- `scripts/ci/browser-smoke.mjs`: verificarea iconurilor și a țintelor tactile de minimum 44px, desktop 1440, mobil 360, local activ/inactiv, păstrarea panoului local, transfer de focus, reset global și capturi vizuale, plus suitele existente.
- `tests/web-r34-tools.test.mjs`: contractul vechi care impunea resetarea la baza arborelui este actualizat pentru noile amplasări.
- Nicio schimbare `data/`, `public/data/`, niciun ID artificial, nicio intervenție asupra arborelui canonic sau asupra geometriei. Catalog ACTUAL: 4.283 entități, SHA-256 gzip `1f930079194c92dc0e02d6e675165dddec6f49db0a62357bcc61be0705125482`.

**Poartă de publicare:** teste statice, TypeScript/Vite, Chromium și capturi inspectate pe SHA exact, PR integrat protejat, CI post-merge și Pages `pages_build_version` egal SHA-ului final. Nu se curăță branchurile.
