from pathlib import Path
from hashlib import sha256
from pypdf import PdfReader
source = Path('work/sim-r6-evidence/doc-5.bin')
assert sha256(source.read_bytes()).hexdigest() == '44470ecb23b464165c94768d34d5f66a6ce80e15c0df37223b2f764ffacf8489'
reader = PdfReader(source)
for page in (2, 4):
    reader.pages[page].images[0].image.save('work/sim-r6-evidence/briceni-page-' + str(page) + '-image-0.png')
