# Checklist: Šta štampati za notara - OPCIJA B

## OPCIJA B - AGRESIVNA (8 disclosure-a)

**Karakteristika:** Sve osim onih gde se obe analize slažu da ima prior art.

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
- [ ] Fajl: `OPCIJA-B/IZJAVA-OPCIJA-B.md`
- [ ] Popuni prazna polja PRVO
- [ ] Štampaj **2 kopije**
- [ ] **NE POTPISUJ** - potpis ide pred notarem!

### 2. Invention Disclosures (8 dokumenata - engleski)

| # | Fajl | Štampano |
|---|------|----------|
| 1 | `patent/01-IP-FOUNDATION/01-invention-disclosure-modular-architecture.md` | [ ] |
| 2 | `patent/01-IP-FOUNDATION/02-invention-disclosure-swap-station.md` | [ ] |
| 3 | `patent/01-IP-FOUNDATION/03-invention-disclosure-distributed-sparing.md` | [ ] |
| 4 | `patent/01-IP-FOUNDATION/04-invention-disclosure-fleet-logistics.md` | [ ] |
| 5 | `patent/01-IP-FOUNDATION/05-invention-disclosure-coordinated-robots.md` | [ ] |
| 6 | `patent/01-IP-FOUNDATION/07-invention-disclosure-v2g-control.md` | [ ] |
| 7 | `patent/01-IP-FOUNDATION/09-invention-disclosure-multi-vehicle-swap.md` | [ ] |
| 8 | `patent/01-IP-FOUNDATION/10-invention-disclosure-jezgro-ecosystem.md` | [ ] |

**ISKLJUČENI (prior art po obe analize):**
- ~~06-invention-disclosure-jezgro.md~~ (Claude: prior art)
- ~~08-invention-disclosure-v2g-ai-ml.md~~ (Obe: prior art)

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
| Invention Disclosures (8 dokumenata) | [ ] |
| Git log izvod | [ ] |
| GPG screenshot | [ ] |
| Novac (~8,000 RSD - više strana) | [ ] |

---

## Posle notara - Apostille

| Stavka | ✓ |
|--------|---|
| Overeni dokument od notara | [ ] |
| Lična karta | [ ] |
| Novac (~2,500 RSD taksa) | [ ] |

---

## Procena troškova - OPCIJA B

| Stavka | Procena |
|--------|---------|
| Notarska overa | ~8,000 RSD |
| Apostille | ~2,500 RSD |
| **UKUPNO** | **~10,500 RSD** |

---

## Zašto OPCIJA B?

**Prednosti:**
- Maksimalna zaštita
- Sve potencijalno novo overeno
- Ako bilo koji izum bude patentabilan, imaš dokaz

**Rizici:**
- Neke od ovih možda imaju prior art
- Viša cena overe

**Disclosures uključeni:**
1. **01 - Modular Architecture:** Obe pozitivne
2. **02 - Swap Station:** Claude: NOVEL kombinacija
3. **03 - Distributed Sparing:** Claude: Cross-domain novel
4. **04 - Fleet Logistics:** HIGHLY NOVEL - obe
5. **05 - Coordinated Robots:** Obe pozitivne
6. **07 - V2G Control:** Claude: hot-swap novel
7. **09 - Multi-Vehicle Swap:** Claude: partially novel
8. **10 - JEZGRO Ecosystem:** Raft consensus novel

**Isključeni:**
- **06 - JEZGRO Microkernel:** Claude: prior art
- **08 - V2G AI/ML:** Obe: prior art

---

*Generisano: 20. januar 2026.*
