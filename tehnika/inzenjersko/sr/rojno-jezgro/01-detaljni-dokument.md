# ROJNO JEZGRO: Detaljni dokument (za dalju razradu)

## Informacije o dokumentu

| Polje | Vrednost |
|---|---|
| ID Dokumenta | EK-TECH-028 |
| Verzija | 0.1 |
| Datum | 2026-01-05 |
| Status | DRAFT |
| Autor | Elektrokombinacija Inzenjering |

---

## 1. Kontekst i ciljevi

ROJNO JEZGRO je zajednicka implementacija rojnih principa za JEZGRO familiju.
Ovaj dokument razradjuje arhitekturu, podatke, protokole i algoritme potrebne
za robusnu koordinaciju bez centralne kontrole.

Kljucevi ciljevi:
- Jedan model koordinacije za EK3, BAT, ROB, GW i RACK
- Minimalan saobracaj uz maksimalnu stabilnost
- Predvidljivo ponasanje u RT okruzenju
- Izolacija gresaka i bezbednost na nivou roja

---

## 2. Arhitektura sistema

### 2.1 Slojevi

```
+-----------------------------------------------------+
| ROJNO JEZGRO (shared library + ROJ_COORD service)   |
|  - Policy Engine                                   |
|  - Quorum Engine                                   |
|  - Stigmergy Store                                 |
|  - Task Allocator                                  |
|  - Health/Trust                                    |
+-------------------- IPC / CAN-FD ------------------+
| JEZGRO Kernel + Device Services (LLC/BMS/Motion)    |
+-----------------------------------------------------+
```

### 2.2 Komponente

- Policy Engine: drzi parametre i bira mod ponasanja (explore/exploit)
- Quorum Engine: vodi kvorum odluke i cross-inhibition
- Stigmergy Store: lokalna mapa tagova sa TTL i decay
- Task Allocator: raspodela zadataka/resursa
- Health/Trust: detekcija anomalija i izolacija
- IO Adapter: mapiranje IPC <-> CAN-FD

---

## 3. Model podataka

### 3.1 NodeState

```
struct roj_node_state {
  uint16_t node_id;
  uint8_t  role;           // LEADER/FOLLOWER/STANDBY
  uint8_t  status;         // ACTIVE/DEGRADED/ISOLATED
  uint16_t capability_flags;
  int16_t  temp_c_x10;
  uint16_t load_pct;
  uint16_t soc_pct;
  uint16_t health_pct;
  uint16_t trust_pct;
  uint32_t last_seen_ms;
};
```

### 3.2 Policy

```
struct roj_policy {
  uint8_t  k_neighbors;
  uint8_t  quorum_min;
  uint8_t  quorum_ratio_pct;
  uint16_t gossip_period_ms;
  uint16_t heartbeat_period_ms;
  uint16_t tag_ttl_ms;
  uint16_t decay_half_life_ms;
  uint8_t  isolation_threshold_pct;
  uint8_t  exploration_noise_pct;
};
```

### 3.3 Stigmergy Tag

```
struct roj_tag {
  uint16_t tag_id;
  uint8_t  type;          // RESOURCE, ROUTE, ALERT, TASK
  int32_t  value;
  uint32_t ttl_ms;
  uint16_t origin_id;
};
```

---

## 4. Protokoli i poruke

### 4.1 Poruke (kategorije)

- ROJ_HEARTBEAT: prisustvo + osnovni metrics
- ROJ_STATE: prosireni state snapshot
- ROJ_TASK_CLAIM: zahtev/claim za zadatak
- ROJ_VOTE: glas za odluku (kvorum)
- ROJ_TAG: stigmergijski tag
- ROJ_ALERT: kriticna obavestenja

### 4.2 Predlog CAN-FD mapiranja

| Tip | ID range | Period | Payload |
|---|---|---|---|
| ROJ_HEARTBEAT | 0x510 + node_id | 1-2 Hz | status, temp, load, health |
| ROJ_STATE | 0x520 + node_id | 0.5 Hz | capabilities, soc, trust |
| ROJ_TASK_CLAIM | 0x540 | on-demand | task_id, node_id, score |
| ROJ_VOTE | 0x550 | on-demand | decision_id, vote, weight |
| ROJ_TAG | 0x560 | 1-5 Hz | tag_id, type, value, ttl |
| ROJ_ALERT | 0x5FF | event | code, node_id, data |

NAPOMENA: IPC poruke mapiraju iste tipove (JEZGRO 64B payload).

---

## 5. Algoritmi

### 5.1 Topoloska koordinacija

- Svaki agent drzi listu k suseda (default k=6..7)
- Lista se osvezava prema kvalitetu linka i svezi aktualnog stanja
- Ako k suseda nije dostupno, popunjava se slucajnim izborom

### 5.2 Kvorum odluke

- Minimalni prag: quorum_min
- Dinamicki prag: quorum_ratio * active_nodes
- Cross-inhibition: suprotni glasovi smanjuju tezinu odluke

Pseudologika:
```
if votes_yes >= Q and votes_yes > votes_no:
  decision = ACCEPT
elif timeout and votes_yes < Q:
  decision = REJECT
```

### 5.3 Stigmergija (tag + decay)

- Tagovi se dele periodicki i cuvaju lokalno
- Decay: tag.value(t+dt) = tag.value(t) * exp(-dt / tau)
- TTL istek: tag se uklanja

### 5.4 Raspodela zadataka

- Score = f(health, load, temp, soc, proximity)
- Task claim se salje samo ako je score ispod praga
- Ako vise agenata claim-uje, kvorum bira pobednika

### 5.5 Lokalna stabilnost

- Pozitivna sprega: tagovi i uspeh pojacavaju sledece odluke
- Negativna sprega: decay i timeouts sprecavaju zakucavanje
- Exploration noise: niska slucajnost (1-3%) za izlaz iz lokalnog optimuma

---

## 6. Masine stanja

### 6.1 Stanje noda

```
BOOT -> JOINING -> SYNC -> ACTIVE -> DEGRADED -> RECOVERY
                  |                 |
                  +----> ISOLATED <-+
```

- JOINING: discovery i preuzimanje policy parametara
- SYNC: sinhronizacija vremena i osnova stanja
- ACTIVE: normalna roj koordinacija
- DEGRADED: smanjene funkcije, ali ucestvuje u roju
- ISOLATED: privremeno uklonjen zbog anomalije
- RECOVERY: povratak u aktivno stanje

### 6.2 Task zivotni ciklus

```
PROPOSE -> CLAIM -> VOTE -> ASSIGN -> EXECUTE -> COMPLETE
```

---

## 7. Konfiguracija i profili

### 7.1 Osnovni profil (default)

```
Policy:
  k_neighbors = 6
  quorum_min = 3
  quorum_ratio_pct = 60
  heartbeat_period_ms = 1000
  gossip_period_ms = 500
  tag_ttl_ms = 5000
  decay_half_life_ms = 2000
  isolation_threshold_pct = 30
  exploration_noise_pct = 2
```

### 7.2 Varijanta profili (primer)

- JEZGRO-EK3: fokus na load/thermal
- JEZGRO-BAT: fokus na SOC/SOH i V2G ucesce
- JEZGRO-ROB: fokus na koordinaciju pokreta i sigurnosne zone
- JEZGRO-GW: fokus na grid signale i prioritete

---

## 8. Bezbednost i integritet

- Autentifikacija poruka (CMAC/HMAC) na CAN-FD sloju
- Trust score po node-u, gubi se pri anomalijama
- Quarantine: izolacija nodova sa sumnjivim ponasanjem
- Rate limiting na kriticnim porukama

---

## 9. Observabilnost

- Event log: JOIN, LEAVE, QUORUM_DECISION, ISOLATED
- Metrics: convergence_time, message_rate, stability_score
- Export: preko CAN-FD ili dijagnostickog gateway-a

---

## 10. Testiranje i simulacija

- Unit test: policy, quorum, decay
- Integration test: 5-20 agenata, fault injection
- HIL: JEZGRO + CAN-FD u laboratoriji
- Simulation: sintetske mreze (gustoce 5-100)

Metrike za validaciju:
- time_to_quorum
- load_balance_error
- recovery_time
- false_isolation_rate

---

## 11. Faze implementacije

1) Phase A: Core data model + IPC poruke
2) Phase B: Quorum + task claim
3) Phase C: Stigmergija + decay
4) Phase D: Trust/isolation
5) Phase E: Profilisanje po varijantama

---

## 12. Otvorena pitanja

- Koji minimalni skup metrika je dovoljan za sve varijante?
- Kako mapirati trust/isolation na safety sertifikaciju?
- Da li treba dual-bus (CAN-A/CAN-B) u svim varijantama?

---

## 13. Povezani dokumenti

- tehnika/konceptualno/sr/02-roj-intelligence.md
- tehnika/inzenjersko/sr/16-jezgro.md
- tehnika/inzenjersko/sr/21-jezgro-product-family.md
