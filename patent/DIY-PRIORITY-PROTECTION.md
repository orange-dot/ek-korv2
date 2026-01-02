# DIY Patent Priority Protection Plan

## TL;DR - Šta Uraditi DANAS

```
═══════════════════════════════════════════════════════════════
CILJ: Dokazati da si PRVI imao ideju, bez plaćanja advokata
═══════════════════════════════════════════════════════════════

3 KORAKA DANAS:

1. WIPO PROOF (€20 po dokumentu)
   → Zvanični UN timestamp za tvoje dokumente

2. Git commit sa GPG potpisom
   → Besplatno, kriptografski dokaz datuma

3. Email sebi sa PDF-ovima
   → Backup, besplatno

REZULTAT: Imaš 3 nezavisna dokaza datuma za svaki koncept
```

---

## Zašto Ovo Radi

```
PATENT SISTEM 101:
═══════════════════════════════════════════════════════════════

PRE 2013 (USA): "First to Invent"
• Ko je PRVI ZAMISLIO ideju, taj ima pravo
• Trebalo dokazivati lab notebooks, svedoke

POSLE 2013 (USA) & ODUVEK (EU): "First to File"
• Ko PRVI PODNESE prijavu, taj ima pravo
• ALI: Ako možeš dokazati "prior art", rušiš tuđi patent

KAKO TI OVO POMAŽE:
═══════════════════════════════════════════════════════════════

SCENARIO A: Ti podneseš patent
• Imaš dokaze da si imao ideju od datuma X
• Niko ne može tvrditi da su bili pre tebe

SCENARIO B: Neko drugi podnese sličan patent
• Ti pokažeš WIPO PROOF/git od datuma X
• Oni su podneli posle datuma X
• Njihov patent se može osporiti kao "not novel"

SCENARIO C: Kreneš u marketing pre patenta
• Normalno bi to uništilo tvoju patentabilnost
• ALI: Imaš 12 meseci "grace period" od prvog objavljivanja
• Dokaz datuma ti daje fleksibilnost
```

---

## Metod 1: WIPO PROOF (Preporučeno)

### Šta je WIPO PROOF?

```
World Intellectual Property Organization (UN agencija)
Servis: WIPO PROOF
Web: https://wipoproof.wipo.int

ŠTA RADI:
• Uploaduješ digitalni fajl (PDF, ZIP, bilo šta)
• WIPO generiše kriptografski "token"
• Token dokazuje da je fajl postojao u tom trenutku
• Token je validan zauvek, priznat globalno

CENA: ~€20 po tokenu (jedan token po dokumentu)
VREME: 5 minuta
VALIDNOST: Neograničena
PRIZNAVANJE: UN agencija = priznato svuda
```

### Kako Koristiti

```
KORAK 1: Napravi PDF sa svim disclosure dokumentima
─────────────────────────────────────────────────────────────
• Kombiniraj sve invention disclosure u jedan PDF
• Dodaj datum, svoje ime, potpis (digitalni OK)
• Dodaj sve tehničke skice i dijagrame

KORAK 2: Kreiraj nalog na wipoproof.wipo.int
─────────────────────────────────────────────────────────────
• Registracija besplatna
• Treba email i basic info

KORAK 3: Upload PDF
─────────────────────────────────────────────────────────────
• Drag & drop
• WIPO izračunava hash (SHA-256)
• Ne čuvaju tvoj fajl - samo hash!
• Tvoj sadržaj ostaje tajan

KORAK 4: Plati i preuzmi token
─────────────────────────────────────────────────────────────
• ~€20 karticom
• Dobiješ PDF "WIPO PROOF Token"
• Čuvaj na sigurnom mestu (cloud + offline)

KORAK 5: Ponovi za svaki update
─────────────────────────────────────────────────────────────
• Kada dodaš nove feature, novi PROOF
• Gradi "paper trail" razvoja
```

---

## Metod 2: Git sa GPG Potpisom (Besplatno)

### Zašto Git?

```
GIT COMMIT = KRIPTOGRAFSKI DOKAZ:
═══════════════════════════════════════════════════════════════

Svaki commit ima:
• SHA-1 hash (jedinstven identifikator)
• Timestamp
• Author info
• Parent commit hash

SA GPG POTPISOM:
• Commit je digitalno potpisan TVOJIM ključem
• Nemoguće falsifikovati datum retroaktivno
• GitHub/GitLab čuvaju kao backup

PLUS: Možeš koristiti GitHub kao "witness"
• GitHub beleži kad je commit push-ovan
• Server-side timestamp kao dodatni dokaz
```

### Setup (jednom)

```bash
# 1. Generiši GPG ključ (ako nemaš)
gpg --full-generate-key
# Izaberi: RSA, 4096 bits, tvoj email

# 2. Dodaj ključ u Git
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true

# 3. Exportuj public key (za verifikaciju)
gpg --armor --export your@email.com > public-key.asc

# 4. Upload public key na GitHub
# Settings → SSH and GPG keys → New GPG key
```

### Workflow za Priority Protection

```bash
# Za svaki invention disclosure:

# 1. Stavi dokumente u git repo
cp invention-disclosure-*.md /path/to/repo/patent/

# 2. Commit sa potpisom
git add .
git commit -S -m "Invention disclosure: Unified Modular Architecture - CONFIDENTIAL - Priority date establishment"

# 3. Push na privatni repo
git push origin main

# 4. Tag za lakše pronalaženje
git tag -s "priority-2026-01-02" -m "Priority date marker for patent purposes"
git push origin --tags

# 5. Verifikuj potpis
git log --show-signature -1
```

### GitHub kao Witness

```
DODATNA ZAŠTITA:
═══════════════════════════════════════════════════════════════

1. Kreiraj PRIVATNI repo (sadržaj ostaje tajan)
2. Push sve dokumente
3. GitHub beleži:
   • Push timestamp (server-side)
   • Commit hashes
   • GPG signature verification

4. U slučaju spora:
   • GitHub može izdati "certificate of authenticity"
   • Pokazuje kada su commits napravljeni
   • Enterprise plan ima audit logs
```

---

## Metod 3: Self-Email (Backup)

```
"POOR MAN'S COPYRIGHT" - slabo ali bolje od ništa:
═══════════════════════════════════════════════════════════════

1. Napravi ZIP sa svim dokumentima
2. Pošalji email SEBI sa attachment-om
3. NE OTVAPAJ email (ostavi nepročitan)
4. Email header ima server timestamp

JAČINA: ⭐⭐☆☆☆
• Lako osporivo (mogao si menjati datum)
• Ali bolje nego ništa
• Koristiti kao DODATAK, ne primarno

GMAIL TRIK:
• Gmail čuva originalni header sa server timestamp
• Ako neko ospori, Google može potvrditi
```

---

## Metod 4: Notarizacija (Jače ali skuplje)

```
NOTAR U SRBIJI:
═══════════════════════════════════════════════════════════════

1. Štampaj sve dokumente
2. Idi kod notara
3. Notar stavlja pečat sa datumom
4. "Overa potpisa i datuma"
5. Čuvaj original

CENA: ~2,000-5,000 RSD
JAČINA: ⭐⭐⭐⭐☆
• Zvanični pravni dokument
• Teško osporiv
• Prepoznat u većini jurisdikcija

KADA KORISTITI:
• Za finalne verzije pre marketing launcha
• Ako planiraš tražiti investitore
• Pre bilo kakvog javnog objavljivanja
```

---

## Master Checklist - Uradi Danas

```
ODMAH (30 minuta):
═══════════════════════════════════════════════════════════════

□ Kreiraj finalni PDF sa svim disclosure dokumentima
  Ime fajla: ELEKTROKOMBINACIJA-Invention-Disclosure-2026-01-02.pdf

□ Dodaj na prvu stranu:
  "CONFIDENTIAL - TRADE SECRET
   Invention Disclosure Document
   Author: [Tvoje ime]
   Date: [Današnji datum]
   This document establishes priority for patent purposes."

□ Git commit sa GPG potpisom (ako imaš setup)

□ Email sebi PDF (backup)


OVAJ TEDEN (1 sat):
═══════════════════════════════════════════════════════════════

□ Registruj se na WIPO PROOF
  https://wipoproof.wipo.int

□ Upload PDF i plati token (~€20)

□ Sačuvaj token na 3 mesta:
  - Cloud (Google Drive, OneDrive)
  - Lokalno (encrypted USB)
  - Email sebi

□ Setup GPG key ako nemaš

□ Push sve na privatni GitHub repo


OPCIONO (ako imaš budžet):
═══════════════════════════════════════════════════════════════

□ Notar overa (~€30)

□ Blockchain timestamp (besplatno):
  - https://originstamp.com
  - https://opentimestamps.org
```

---

## Šta Slati Kome (Inicijalni Kontakt)

### Ako Neko Kopira

```
CEASE & DESIST TEMPLATE:
═══════════════════════════════════════════════════════════════

Subject: Notice of Prior Art - [Naziv njihovog proizvoda]

Dear [Ime],

We have become aware of your [product/patent application]
relating to [opis].

Please be advised that we have documented prior art
establishing conception of this technology as of [datum],
as evidenced by:

1. WIPO PROOF token dated [datum]
2. Notarized disclosure document dated [datum]
3. Git repository with signed commits from [datum]

We request that you:
- Cease claims of novelty for overlapping subject matter
- Acknowledge our prior art in any patent proceedings
- Contact us to discuss licensing arrangements

Failure to respond within 30 days may result in formal
opposition to any patent applications.

Sincerely,
[Tvoje ime]

Attachments:
- WIPO PROOF token (PDF)
- Summary of prior art
```

### Za Investitore/Partnere

```
DISCLOSURE COVER LETTER:
═══════════════════════════════════════════════════════════════

CONFIDENTIAL - UNDER NDA

Subject: Technical Innovation Disclosure - ELEKTROKOMBINACIJA

Dear [Investor],

Please find attached our invention disclosure documents
for the ELEKTROKOMBINACIJA modular EV charging system.

PRIORITY STATUS:
These innovations are documented and timestamped via:
□ WIPO PROOF (token attached)
□ Git repository with cryptographic signatures
□ Notarized documents

This establishes our priority position for potential
patent protection. Formal patent applications are
planned for [quarter/year].

CONFIDENTIALITY:
These documents contain trade secrets. By receiving
this disclosure, you agree to maintain confidentiality
per our NDA dated [datum].

KEY INNOVATIONS:
1. Unified modular architecture (3kW to 3MW)
2. Robotic swap station integration
3. Distributed power sparing
4. Fleet-integrated logistics

We look forward to discussing partnership opportunities.

Sincerely,
[Tvoje ime]
```

---

## Timeline: Kada Šta

```
DANAS:
═══════════════════════════════════════════════════════════════
✓ WIPO PROOF za sve disclosure dokumente
✓ Git commit sa GPG potpisom
✓ Email backup

1 MESEC:
═══════════════════════════════════════════════════════════════
• Update dokumentaciju ako ima novih ideja
• Novi WIPO PROOF za updates
• Počni prior art search (Google Patents)

3 MESECA:
═══════════════════════════════════════════════════════════════
• Ako se spremaš za marketing launch:
  - Notar overa finalne verzije
  - Razmisli o provisional patent (~€500 sa DIY filing)

6 MESECI:
═══════════════════════════════════════════════════════════════
• Ako imaš budget za pravi patent:
  - Sada imaš svu dokumentaciju spremnu
  - Prior art search završen
  - Možeš brzo angažovati advokata

12 MESECI (KRITIČNO):
═══════════════════════════════════════════════════════════════
• Ako si objavio BILO ŠTA javno:
  - Imaš 12 meseci za patent filing (grace period)
  - Posle toga gubiš pravo na patent
  - WIPO PROOF dokazuje datum objave
```

---

## FAQ

```
P: Da li WIPO PROOF zamenjuje patent?
O: NE. Dokazuje samo datum, ne daje monopolska prava.
   Ali sprečava druge da tvrde da su bili prvi.

P: Da li mogu koristiti ovo na sudu?
O: WIPO PROOF je dizajniran baš za to. Git commits su
   prihvaćeni u mnogim jurisdikcijama. Notar je najjači.

P: Šta ako neko već ima patent za slično?
O: Tvoji dokazi mogu poslužiti kao osnov za osporavanje
   njihovog patenta (invalidity challenge).

P: Mogu li početi marketing sa ovim?
O: Tehnički da, ali:
   - Objava pokreće 12-mesečni sat
   - Pre objave uradi WIPO PROOF
   - Razmisli o provisional patent pre launcha

P: Koliko košta provisional patent DIY?
O: Srbija: ~€150 takse + tvoje vreme
   PCT: ~€1,500 takse + tvoje vreme
   ALI: Rizično bez advokata, loše claims mogu štetiti

P: Zašto ne samo full patent odmah?
O: Full patent: €5,000-15,000 + 2-3 godine do granta
   WIPO PROOF: €20 + 5 minuta + odmah validan
   Počni sa PROOF, upgrade kad imaš pare
```

---

## Fajlovi za Kreiranje Danas

```
□ ELEKTROKOMBINACIJA-Master-Disclosure-2026-01-02.pdf
  (kombinacija svih 4 disclosure dokumenta)

□ COVER-PAGE.pdf
  (confidentiality notice, author, date)

□ TECHNICAL-APPENDIX.pdf
  (dijagrami, skice, specifikacije iz tehnički-koncept/)

□ PRIOR-ART-NOTES.pdf
  (šta znaš o konkurenciji i postojećim rešenjima)
```

---

## Kontakt za WIPO PROOF

```
WIPO PROOF Portal:
https://wipoproof.wipo.int

Support:
wipo.proof@wipo.int

FAQ:
https://www.wipo.int/wipoproof/en/faq.html

NAPOMENA: WIPO PROOF je self-service, ne treba ti advokat!
```

---

Kreirano: Januar 2026
Poslednji update: ___________
Status: URADITI DANAS!
