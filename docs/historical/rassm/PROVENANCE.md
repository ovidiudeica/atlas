# Proveniență și recuperare

Pentru fiecare fișier din perimetrul PR-urilor originale, manifestul păstrează calea, commit-ul, amprenta Git și SHA-256. Căile distincte rămân separate când documentează etape sau suportă dependențe, chiar dacă obiectul Git este identic. Git stochează o singură dată obiectele identice.

Un proprietar cu acces la bundle poate restaura toate referințele offline. După verificarea SHA-256, folosește comanda din manifest care citește fișierul la commit-ul original dintr-un depozit restaurat. Copiile Markdown care omit un locator privat au o amprentă separată. Conținutul original se recuperează cu amprenta originalului.
