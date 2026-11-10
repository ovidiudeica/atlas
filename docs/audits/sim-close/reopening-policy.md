# Politica permanentă de redeschidere — SIM-CLOSE

Seria SIM-R1–SIM-R8 este închisă administrativ. Închiderea nu certifică juridic imaginile neconfirmate și nu constituie o permisiune de redistribuire. Nu se deschide automat o etapă SIM-R9 sau o nouă campanie exhaustivă.

Un dosar se redeschide individual numai pe baza unei probe noi relevante sau a unei metode concrete, verificabile, care nu repetă cercetarea eșuată. Trecerea timpului, un HTTP200, un domeniu instituțional, un infobox sau o nouă încercare la același URL în aceleași condiții nu sunt suficiente.

## Cele zece informații obligatorii

1. ID-ul permanent al dosarului, ID-ul Atlas exact și tipul stemă/drapel.
2. Tipul probei noi și temeiul redeschiderii.
3. Instituția emitentă ori autorul sursei.
4. URL-ul public exact sau referința arhivistică.
5. Data și versiunea documentului.
6. SHA256 când poate fi obținut; altfel motivul explicit al indisponibilității.
7. Diferența față de probele anterioare, cu trimiteri la acestea.
8. Concluzia precisă care poate fi revizuită.
9. Testele și verificările necesare.
10. Impactul posibil asupra reprezentării publicate.

O metodă nouă indică suplimentar identificatorul său, impedimentul vizat, minimum doi pași verificabili și documentul sau artefactul recuperabil așteptat. Un dosar poate folosi aceeași sursă numai dacă metoda nouă are o justificare concretă; simpla reîncercare este respinsă.

## Traseul de revizuire

`validateReopeningRequest` din scripts/audit/sim-close/reopening-policy.mjs verifică eligibilitatea formală pentru revizuire, nu veridicitatea probei și nu autorizează publicarea. Revizorul verifică emitentul, actul și anexa, titularul exact, jurisdicția, versiunea și drepturile reproducerii. Un simbol oficial și un desen reutilizabil sunt concluzii separate.

Orice propunere de imagine trece în continuare politica semantică SIM-R7/SIM-R8: identitate exactă, declarație teritorială explicită, aprobare editorială per-ID/per-tip legată de hash, sursă și verificări grafice. Licențierea unui icon lingvistic nu îl transformă în drapel local. Carantina și invalidările nu sunt ridicate global. Se păstrează imaginea anterioară, hashurile, verdictul și proveniența; nu se rescriu snapshoturile istorice.

Schimbările justificate au un lot și un PR individual, cu teste proporționale, CI pe SHA exact, integrare protejată și verificare post-publicare. Niciun câmp lipsă și niciun verdict incert nu devine automat autorizare. Cazurile excluse rămân excluse până la demonstrarea separată a identității teritoriale și a reutilizării.

## Dezvoltarea continuă

Problemele funcționale sau vizuale intră în WEB-AUDIT și în fluxul normal de dezvoltare. Ele nu redeschid cercetarea heraldică. Numărătorile SIM-CLOSE certifică exclusiv snapshotul be7b1a033d7482e419a0aba0ed9cc8765b83ee87; nu sunt limite globale pentru viitoare adăugări individuale legitime. În afara unui dosar redeschis pe probe noi, imaginile și marcajele de incertitudine se conservă.
