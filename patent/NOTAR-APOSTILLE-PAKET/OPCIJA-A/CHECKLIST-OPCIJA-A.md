# Checklist: Šta štampati za notara - OPCIJA A

## OPCIJA A - KONZERVATIVNA (4 disclosure-a)

**Karakteristika:** Samo disclosures gde se obe analize slažu da ima potencijal.

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
- [ ] Fajl: `OPCIJA-A/IZJAVA-OPCIJA-A.md`
- [ ] Popuni prazna polja PRVO
- [ ] Štampaj **2 kopije**
- [ ] **NE POTPISUJ** - potpis ide pred notarem!

### 2. Invention Disclosures (4 dokumenta - engleski)

| # | Fajl | Štampano |
|---|------|----------|
| 1 | `patent/01-IP-FOUNDATION/01-invention-disclosure-modular-architecture.md` | [ ] |
| 2 | `patent/01-IP-FOUNDATION/04-invention-disclosure-fleet-logistics.md` | [ ] |
| 3 | `patent/01-IP-FOUNDATION/05-invention-disclosure-coordinated-robots.md` | [ ] |
| 4 | `patent/01-IP-FOUNDATION/10-invention-disclosure-jezgro-ecosystem.md` | [ ] |

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
| Invention Disclosures (4 dokumenta) | [ ] |
| Git log izvod | [ ] |
| GPG screenshot | [ ] |
| Novac (~5,000 RSD - manje strana) | [ ] |

---

## Posle notara - Apostille

| Stavka | ✓ |
|--------|---|
| Overeni dokument od notara | [ ] |
| Lična karta | [ ] |
| Novac (~2,500 RSD taksa) | [ ] |

---

## Procena troškova - OPCIJA A

| Stavka | Procena |
|--------|---------|
| Notarska overa | ~5,000 RSD |
| Apostille | ~2,500 RSD |
| **UKUPNO** | **~7,500 RSD** |

---

## Zašto OPCIJA A?

**Prednosti:**
- Najsigurnija opcija
- Najmanji rizik prior art problema
- Niža cena overe

**Rizici:**
- Možda propuštamo patentabilne izume (02, 03)

**Disclosures uključeni:**
1. **01 - Modular Architecture:** Obe analize pozitivne, 3kW granularnost nova
2. **04 - Fleet Logistics:** HIGHLY NOVEL - obe analize
3. **05 - Coordinated Robots:** Dual-robot koordinacija nova
4. **10 - JEZGRO Ecosystem:** Raft consensus za power electronics

---

*Generisano: 20. januar 2026.*
