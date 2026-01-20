# Checklist: Šta štampati za notara - OPCIJA C

## OPCIJA C - SREDNJA (6 disclosure-a)

**Karakteristika:** Balans - samo najjači kandidati.

---

## Tvoji podaci (popuni pre štampanja)

```
Ime i prezime: _________________________________
JMBG: _________________________________________
Adresa: _______________________________________
GPG Key ID: E09C48462307C204
```

---

## Dokumenta za štampanje

### 1. Izjava o autorstvu
- [ ] Fajl: `OPCIJA-C/IZJAVA-OPCIJA-C.md`
- [ ] Popuni prazna polja PRVO
- [ ] Štampaj **2 kopije**
- [ ] **NE POTPISUJ** - potpis ide pred notarem!

### 2. Invention Disclosures (6 dokumenata - engleski)

| # | Fajl | Štampano |
|---|------|----------|
| 1 | `patent/01-IP-FOUNDATION/01-invention-disclosure-modular-architecture.md` | [ ] |
| 2 | `patent/01-IP-FOUNDATION/02-invention-disclosure-swap-station.md` | [ ] |
| 3 | `patent/01-IP-FOUNDATION/03-invention-disclosure-distributed-sparing.md` | [ ] |
| 4 | `patent/01-IP-FOUNDATION/04-invention-disclosure-fleet-logistics.md` | [ ] |
| 5 | `patent/01-IP-FOUNDATION/05-invention-disclosure-coordinated-robots.md` | [ ] |
| 6 | `patent/01-IP-FOUNDATION/10-invention-disclosure-jezgro-ecosystem.md` | [ ] |

**Napomena:** Štampaj samo engleske verzije (.md), ne srpske (.sr.md)

### 3. Git Log izvod
- [ ] Fajl: `03-GIT-LOG-IZVOD.txt`
- [ ] Štampaj ceo fajl
- [ ] Markerom označi ključni commit:
  ```
  Commit: dd14f6f63aa97a7985efbaad55a5372d9ad3e1fc
  Date: 2026-01-02 23:40:54 +0100
  GPG Key ID: E09C48462307C204
  GPG Status: Good signature
  GitHub Verified: Jan 2, 2026, 11:41 PM
  ```

### 4. GPG verifikacija (screenshot)

**Opcija A - Terminal screenshot:**
```bash
git log --show-signature -1 dd14f6f63aa97a7985efbaad55a5372d9ad3e1fc
```

**Opcija B - GitHub screenshot (PREPORUČENO):**
1. Idi na: https://github.com/orange-dot/autobusi-punjaci/commit/dd14f6f63aa97a7985efbaad55a5372d9ad3e1fc
2. Screenshot "Verified" badge sa GPG Key ID
3. Prikaži "Verified on Jan 2, 2026, 11:41 PM"

- [ ] Screenshot napravljen
- [ ] Screenshot štampan

---

## Šta poneti kod notara

| Stavka | ✓ |
|--------|---|
| Lična karta (original) | [ ] |
| Izjava o autorstvu (2 kopije, nepotpisane) | [ ] |
| Invention Disclosures (6 dokumenata) | [ ] |
| Git log izvod | [ ] |
| GPG screenshot | [ ] |
| Novac (~6,500 RSD) | [ ] |

---

## Posle notara - Apostille

| Stavka | ✓ |
|--------|---|
| Overeni dokument od notara | [ ] |
| Lična karta | [ ] |
| Novac (~2,500 RSD taksa) | [ ] |

---

## Procena troškova - OPCIJA C

| Stavka | Procena |
|--------|---------|
| Notarska overa | ~6,500 RSD |
| Apostille | ~2,500 RSD |
| **UKUPNO** | **~9,000 RSD** |

---

## Zašto OPCIJA C?

**Prednosti:**
- Dobra ravnoteža između zaštite i rizika
- Uključuje "bonus" disclosures (02, 03) koji imaju potencijal
- Razumna cena

**Rizici:**
- Srednji - 02, 03 možda imaju prior art

**Disclosures uključeni:**
1. **01 - Modular Architecture:** Obe pozitivne
2. **02 - Swap Station:** Claude: NOVEL kombinacija
3. **03 - Distributed Sparing:** Claude: Cross-domain novel
4. **04 - Fleet Logistics:** HIGHLY NOVEL - obe
5. **05 - Coordinated Robots:** Obe pozitivne
6. **10 - JEZGRO Ecosystem:** Raft consensus novel

**Isključeni (rizik > korist):**
- **06 - JEZGRO Microkernel:** Prior art
- **07 - V2G Control:** Samo Claude pozitivan
- **08 - V2G AI/ML:** Obe: prior art
- **09 - Multi-Vehicle Swap:** Samo partially novel

---

*Generisano: 20. januar 2026.*
