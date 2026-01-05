# ROJNO JEZGRO: Core Spec (Draft)

## Informacije o dokumentu

| Polje | Vrednost |
|---|---|
| ID Dokumenta | EK-TECH-027 |
| Verzija | 0.1 |
| Datum | 2026-01-05 |
| Status | DRAFT |
| Autor | Elektrokombinacija Inzenjering |

---

## 1. Svrha

ROJNO JEZGRO je zajednicko jezgro za rojnu koordinaciju kroz celu JEZGRO familiju proizvoda.
Cilj je da svi uredaji (EK3, BAT, ROB, GW, RACK) koriste isti set principa i interfejsa
za lokalne odluke koje vode do globalno stabilnog i optimalnog ponasanja.

---

## 2. Obim (Scope)

ROJNO JEZGRO definise:
- Minimalni skup funkcija za rojnu koordinaciju (discovery, health, koordinacija, raspodela)
- Unificirani model stanja i poruka za JEZGRO servise i CAN-FD mrezu
- Algoritamske principe (kvorum, stigmergija, topoloska koordinacija, povratne sprege)
- Metrike, ogranicenja i kriterijume prihvatljivosti

ROJNO JEZGRO NE definise:
- Konkretnu implementaciju pojedinacnih uredaja (npr. LLC ili BMS logiku)
- Cloud backend i centralizovanu optimizaciju
- Detalje hardvera izvan JEZGRO standarda

---

## 3. Definicije

- Agent: uredaj sa lokalnim stanjem i pravilima ponasanja (JEZGRO servis ROJ_COORD).
- Roj: skup agenata koji razmenjuju minimalne informacije i koordiniraju.
- Kvorum: prag aktivnih glasova koji aktivira odluku bez potpunog konsenzusa.
- Stigmergija: koordinacija preko tragova u okruzenju (tagovi/markeri sa TTL).
- Topoloski susedi: fiksan broj najblizih/poznatih suseda (k-neighbors), nezavisno od distance.
- Politika: skup parametara koji oblikuju ponasanje roja (npr. k, decay, quorum).

---

## 4. Sistemski model

Svaki JEZGRO uredaj pokrece ROJ_COORD servis koji koristi ROJNO JEZGRO biblioteku.
Komunikacija ide preko IPC (lokalno) i CAN-FD (mreza). Roj je decentralizovan.

```
[JEZGRO UREDAJ]
  - ROJ_COORD (uses ROJNO JEZGRO)
  - Device Services (LLC, BMS, Motion, V2G)
  - IPC <-> CAN-FD bridge
```

---

## 5. Osnovni principi

- Lokalna pravila -> globalno ponasanje (emergencija)
- Pozitivna i negativna povratna sprega (amplifikacija + stabilizacija)
- Kvorum za brze odluke uz prihvatljiv kvalitet
- Stigmergija za implicitnu koordinaciju i smanjenje saobracaja
- Topoloska koordinacija za stabilnost pri promeni gustine
- Graceful degradation: sistem radi i pri gubitku vecine agenata

---

## 6. Funkcionalne sposobnosti (MVP)

1) Autodiscovery i identifikacija agenata
2) Periodicno deljenje zdravstvenog stanja (health)
3) Raspodela zadataka i resursa (task allocation)
4) Kvorum odluke (vote + stop signals)
5) Stigmergijski tagovi sa TTL i decay
6) Lokalno uklanjanje anomalija (quarantine/isolation)

---

## 7. Interfejsi

### 7.1 JEZGRO IPC
- Poruke tipa: ROJ_HEARTBEAT, ROJ_STATE, ROJ_TASK, ROJ_VOTE, ROJ_TAG
- IPC payload format: 64B standard JEZGRO poruka

### 7.2 CAN-FD
- CAN-FD poruke mapirane 1:1 na IPC tipove
- Prioritetna poruka: ROJ_ALERT (kvar, izolacija, kvorum odlucen)

### 7.3 Device Services
- LLC/BMS/Motion/V2G servisi iznose lokalne metrike
- ROJNO JEZGRO vraca preporuke: setpoint, raspodela, standby

---

## 8. Minimalni model stanja

```
NodeState:
  - node_id, role, status
  - capabilities (power, thermal, storage, motion)
  - metrics (temp, load, soc, health)
  - trust_score, last_seen

Policy:
  - k_neighbors
  - quorum_min, quorum_ratio
  - decay_half_life_ms
  - gossip_period_ms
  - isolation_threshold

Tag (stigmergy):
  - tag_id, type, value, ttl_ms, origin
```

---

## 9. Algoritamski minimum

- Topoloski izbor suseda: k=6..7 (default)
- Kvorum: max(quorum_min, quorum_ratio * active_nodes)
- Pheromone/Tag decay: exponential decay sa polu-raspadom
- Cross-inhibition: negativni glasovi usporavaju suparnicke odluke
- Exploration noise: mala slucajnost za izbegavanje lokalnih optimuma

---

## 10. Nefunkcionalni zahtevi

- Deterministicko ponasanje u realnom vremenu (hard RT constraints)
- Minimalan CPU/RAM overhead po agentu
- Skaliranje: >= 20 agenata po CAN segmentu bez degradacije
- Bezbednost: autentifikacija poruka, izolacija sumnjivih agenata

---

## 11. Kriterijumi prihvatljivosti

- Roj ostaje operativan nakon gubitka 30% agenata
- Odluka kroz kvorum u < 500ms pri normalnom opterecenju
- Tag/pheromone mehanizam stabilizuje sistem bez centralne komande
- Integracija sa JEZGRO servisima bez menjanja njihovog API-ja
- Jedna konfiguracija politike radi na EK3, BAT i ROB varijanti

---

## 12. Povezani dokumenti

- tehnika/konceptualno/sr/02-roj-intelligence.md
- tehnika/inzenjersko/sr/16-jezgro.md
- tehnika/inzenjersko/sr/21-jezgro-product-family.md
