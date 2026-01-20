# Checklist: Šta štampati za notara

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
- [ ] Fajl: `01-IZJAVA-O-AUTORSTVU.md`
- [ ] Popuni prazna polja PRVO
- [ ] Štampaj **2 kopije**
- [ ] **NE POTPISUJ** - potpis ide pred notarem!

### 2. Invention Disclosures (10 dokumenata - engleski)

| # | Fajl | Štampano |
|---|------|----------|
| 1 | `patent/01-IP-FOUNDATION/01-invention-disclosure-modular-architecture.md` | [ ] |
| 2 | `patent/01-IP-FOUNDATION/02-invention-disclosure-swap-station.md` | [ ] |
| 3 | `patent/01-IP-FOUNDATION/03-invention-disclosure-distributed-sparing.md` | [ ] |
| 4 | `patent/01-IP-FOUNDATION/04-invention-disclosure-fleet-logistics.md` | [ ] |
| 5 | `patent/01-IP-FOUNDATION/05-invention-disclosure-coordinated-robots.md` | [ ] |
| 6 | `patent/01-IP-FOUNDATION/06-invention-disclosure-jezgro.md` | [ ] |
| 7 | `patent/01-IP-FOUNDATION/07-invention-disclosure-v2g-control.md` | [ ] |
| 8 | `patent/01-IP-FOUNDATION/08-invention-disclosure-v2g-ai-ml.md` | [ ] |
| 9 | `patent/01-IP-FOUNDATION/09-invention-disclosure-multi-vehicle-swap.md` | [ ] |
| 10 | `patent/01-IP-FOUNDATION/10-invention-disclosure-jezgro-ecosystem.md` | [ ] |

**Napomena:** Štampaj samo engleske verzije (.md), ne srpske (.sr.md)

### 3. Git Log izvod
- [ ] Fajl: `03-GIT-LOG-IZVOD.txt`
- [ ] Štampaj ceo fajl
- [ ] Markerom označi ključni commit:
  ```
  Commit: dd14f6f63aa97a7985efbaad55a5372d9ad3e1fc
  Date: 2026-01-02 23:40:54 +0100
  GPG Status: G
  ```

### 4. GPG verifikacija (screenshot)

Pokreni ovu komandu i napravi screenshot:

```bash
git log --show-signature -1 dd14f6f63aa97a7985efbaad55a5372d9ad3e1fc
```

- [ ] Screenshot napravljen
- [ ] Screenshot štampan

---

## Šta poneti kod notara

| Stavka | ✓ |
|--------|---|
| Lična karta (original) | [ ] |
| Izjava o autorstvu (2 kopije, nepotpisane) | [ ] |
| Invention Disclosures (10 dokumenata) | [ ] |
| Git log izvod | [ ] |
| GPG screenshot | [ ] |
| Novac (~7,000-10,000 RSD - više strana) | [ ] |

---

## Posle notara - Apostille

| Stavka | ✓ |
|--------|---|
| Overeni dokument od notara | [ ] |
| Lična karta | [ ] |
| Novac (~2,500 RSD taksa) | [ ] |

---

## Ključni datumi za izjavu

| Događaj | Datum | Commit |
|---------|-------|--------|
| **Priority date** | 02.01.2026 | dd14f6f6... |
| Prvi patent commit | 02.01.2026 | 0ef3b1c8... |
| GPG potpisan | 02.01.2026 | dd14f6f6... |

---

## Napomena

Svi commit-i od **02.01.2026** pa nadalje su GPG potpisani (GPG Status: G).
Raniji commit-i istog dana (N status) nemaju GPG potpis ali imaju isti datum.

Ključni dokaz je commit `dd14f6f6` sa GPG potpisom i datumom 02.01.2026.

---

*Generisano: 20. januar 2026.*
