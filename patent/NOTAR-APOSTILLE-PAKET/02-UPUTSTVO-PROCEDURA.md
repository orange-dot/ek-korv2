# Uputstvo: Notar + Haški Apostille

## Pregled procedure

```
KORAK 1          KORAK 2              KORAK 3
Priprema    →    Javni beležnik   →   Apostille
(kod kuće)       (notar)              (Viši sud)
```

**Ukupno vreme:** 1-3 dana
**Ukupna cena:** ~7,000-10,000 RSD (~60-85 EUR)

---

## KORAK 1: Priprema (kod kuće)

### A. Štampaj dokumente

1. **Izjava o autorstvu** (`01-IZJAVA-O-AUTORSTVU.md`)
   - Popuni prazna polja (ime, adresa, JMBG)
   - Štampaj 2 kopije

2. **Invention Disclosures** (svih 5)
   - Štampaj svaki dokument
   - Lokacija: `patent/01-IP-FOUNDATION/`

3. **Git log izvod** (`03-GIT-LOG-IZVOD.txt`)
   - Generiši komandom ispod
   - Štampaj

4. **GPG verifikacija** (screenshot)
   - Štampaj

### B. Generiši Git log

Pokreni u terminalu:

```bash
cd D:\work\autobusi-punjaci

# Generiši log sa GPG statusom
git log --show-signature --format="%H %ai %s" -- patent/ > patent/NOTAR-APOSTILLE-PAKET/03-GIT-LOG-IZVOD.txt

# Ili detaljniji format
git log --pretty=format:"Commit: %H%nDate: %ai%nAuthor: %an <%ae>%nGPG: %G? %GK%nMessage: %s%n---" -- patent/ > patent/NOTAR-APOSTILLE-PAKET/03-GIT-LOG-IZVOD.txt
```

### C. Checklist pre odlaska

- [ ] Lična karta (original)
- [ ] Izjava o autorstvu (2 kopije, popunjena, NEPOTPISANA)
- [ ] Invention Disclosures (štampani, 5 dokumenata)
- [ ] Git log izvod (štampan)
- [ ] GPG verifikacija screenshot (štampan)
- [ ] Novac (~5,000 RSD za notara)

---

## KORAK 2: Javni beležnik (Notar)

### Šta tražiti

Reci notaru:

> "Želim solemnizaciju izjave o autorstvu sa overom priložene tehničke dokumentacije. Potreban mi je Apostille za inostranstvo."

### Procedura kod notara

1. Notar čita izjavu
2. Potvrđuješ da je sve tačno
3. **Potpisuješ pred notarem** (ne pre!)
4. Notar stavlja pečat i potpis
5. Dokumenta se povezuju (jemstvenikom ili pečatom)

### Cena

| Usluga | Cena (okvirno) |
|--------|----------------|
| Solemnizacija izjave | 3,000-4,000 RSD |
| Overa priloga (po strani) | 200-500 RSD |
| **Ukupno** | **~5,000 RSD** |

### Važno

- Notar MORA da poveže izjavu i priloge (invention disclosures)
- Traži **jedan dokument** sa svim stranama povezanim
- Pitaj: "Da li je ovo spremno za Apostille?"

---

## KORAK 3: Apostille (Viši sud)

### Gde

**Viši sud u tvom gradu** - Overa odeljenje

Beograd: Viši sud u Beogradu, Savska 17a

### Šta poneti

- Overeni dokument od notara (original)
- Lična karta
- ~2,000-3,000 RSD taksa

### Procedura

1. Odeš na šalter za overu
2. Predaš dokument
3. Platiš taksu
4. Čekaš (obično isti dan, nekad 1-2 dana)
5. Dobijaš dokument sa Apostille pečatom

### Apostille izgleda ovako

```
┌─────────────────────────────────────┐
│            APOSTILLE                │
│    (Convention de La Haye du        │
│     5 octobre 1961)                 │
│                                     │
│ 1. Country: REPUBLIC OF SERBIA      │
│ 2. Signed by: [Notar]               │
│ 3. Acting in capacity of: Notary    │
│ 4. Bears seal of: [Notar seal]      │
│ ...                                 │
│ 10. Seal/stamp:     [PEČAT]         │
└─────────────────────────────────────┘
```

---

## Posle Apostille-a

### Čuvanje

1. **Original** - čuvaj na sigurnom (sef, banka)
2. **Skenirana kopija** - upload u cloud (encrypted)
3. **Fotografija** - backup na telefonu

### Gde važi Apostille

125+ zemalja, uključujući:
- 🇳🇱 Holandija
- 🇩🇪 Nemačka
- 🇫🇷 Francuska
- 🇺🇸 SAD
- 🇬🇧 UK
- Sve EU zemlje

### Rok trajanja

Apostille **nema rok trajanja**. Važi trajno kao dokaz da je dokument overen na određeni datum.

---

## Česta pitanja

**P: Mora li notar da razume tehničku dokumentaciju?**
O: Ne. Notar samo potvrđuje da si TI potpisao izjavu i da dokumenti postoje. Ne ocenjuje sadržaj.

**P: Na kom jeziku?**
O: Izjava na srpskom. Invention disclosures mogu biti na engleskom - Apostille pokriva sve.

**P: Koliko traje ceo proces?**
O: Notar: 30 min. Apostille: 1-3 sata (ili dan ako ima gužva).

**P: Može li neko drugi da ode umesto mene?**
O: Za notara - NE, moraš lično da potpišeš. Za Apostille - DA, može neko sa tvojim ovlašćenjem.

---

## Kontakti (Beograd)

### Javni beležnici
- Spisak: [beleznik.org](https://beleznik.org)
- Bilo koji notar može da uradi overu

### Viši sud Beograd (Apostille)
- Adresa: Savska 17a
- Radno vreme: 07:30-15:30
- Telefon: 011/360-4600

---

*Dokument pripremljen: 20. januar 2026.*
