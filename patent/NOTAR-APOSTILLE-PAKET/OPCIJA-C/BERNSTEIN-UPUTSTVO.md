# Bernstein.io - Blockchain IP Zaštita

## Šta je Bernstein?

**Bernstein.io** je servis za blockchain-based zaštitu intelektualne svojine:
- **Bitcoin blockchain** - nepromenljiv dokaz datuma
- **IPFS storage** - decentralizovano skladištenje
- **Pravno priznat** - koristi se kao dokaz u sudskim sporovima

**Website:** https://www.bernstein.io

---

## Zašto Bernstein umesto WIPO PROOF?

| Karakteristika | WIPO PROOF | Bernstein |
|----------------|------------|-----------|
| Status | 503 error (nedostupan) | Aktivan |
| Cena | ~€20 po dokumentu | Besplatno (basic) |
| Blockchain | Ne | Da (Bitcoin) |
| IPFS | Ne | Da |
| Sertifikat | PDF | PDF + Blockchain proof |

---

## Korak po korak uputstvo

### 1. Registracija

1. Idi na https://www.bernstein.io
2. Klikni **"Sign Up"** ili **"Get Started"**
3. Unesi email: `bojan.janjatovic@gmail.com`
4. Potvrdi email

### 2. Upload ZIP paketa

**Fajl za upload:**
```
patent/NOTAR-APOSTILLE-PAKET/OPCIJA-C/EK3-OPCIJA-C-2026-01-20.zip
```

**Veličina:** ~32 KB

**SHA-256 hash (za verifikaciju):**
```
dc7e4bb4176bd531135ef6c933c2db455bd043072974b1b5e4bc3fcbece4efd5
```

**Koraci:**
1. Login na Bernstein dashboard
2. Klikni **"Create New IP"** ili **"Upload"**
3. Izaberi `EK3-OPCIJA-C-2026-01-20.zip`
4. Naziv: "EK3 Modular EV Charging - Option C Disclosures"
5. Opis: "6 invention disclosures for modular EV charging infrastructure"
6. Klikni **"Timestamp"** ili **"Register"**

### 3. Sačekaj potvrdu

- **Inicijalni hash:** Odmah
- **Bitcoin potvrda:** 10-60 minuta (1-6 confirmations)
- **Sertifikat:** Dostupan nakon potvrde

### 4. Preuzmi sertifikat

1. Idi na dashboard
2. Pronađi svoj upload
3. Klikni **"Download Certificate"**
4. Sačuvaj PDF kao: `bernstein-certificate-2026-01-20.pdf`

---

## Šta sadrži Bernstein sertifikat?

```
┌─────────────────────────────────────────────┐
│  BERNSTEIN CERTIFICATE OF EXISTENCE         │
├─────────────────────────────────────────────┤
│  File: EK3-OPCIJA-C-2026-01-20.zip         │
│  SHA-256: [hash fajla]                      │
│  Timestamp: 2026-01-20 XX:XX:XX UTC        │
│  Bitcoin TX: [transaction ID]               │
│  Block: [block number]                      │
│  IPFS CID: [content identifier]             │
└─────────────────────────────────────────────┘
```

---

## Verifikacija kasnije

Bilo ko može verifikovati:

1. **Na Bernstein.io:**
   - Upload isti ZIP fajl
   - Sistem prepoznaje hash i pokazuje originalni timestamp

2. **Na Bitcoin blockchain:**
   - Koristi transaction ID
   - Proveri na https://blockchain.info

3. **Na IPFS:**
   - Koristi CID
   - Proveri na https://ipfs.io/ipfs/[CID]

---

## Pravna vrednost

Bernstein timestamp ima dokaznu vrednost u:
- **Patentnim sporovima** - dokazuje datum prior art
- **Autorskim pravima** - dokazuje datum nastanka
- **Poslovnim sporovima** - dokazuje vlasništvo ideje

**Presedani:** Blockchain timestamps su prihvaćeni kao dokaz u EU i US sudovima.

---

## Checklist

```
[ ] Registruj se na bernstein.io
[ ] Upload EK3-OPCIJA-C-2026-01-20.zip
[ ] Sačekaj Bitcoin potvrdu
[ ] Preuzmi PDF sertifikat
[ ] Sačuvaj sertifikat u:
    patent/NOTAR-APOSTILLE-PAKET/OPCIJA-C/bernstein-certificate-2026-01-20.pdf
[ ] Ažuriraj PRIORITY-PROOF-LOG.md sa Bernstein podacima
```

---

## Sadržaj ZIP paketa (za referencu)

| Fajl | Disclosure |
|------|------------|
| 01-invention-disclosure-modular-architecture.md | Modular Architecture |
| 02-invention-disclosure-swap-station.md | Swap Station |
| 03-invention-disclosure-distributed-sparing.md | Distributed Sparing |
| 04-invention-disclosure-fleet-logistics.md | Fleet Logistics |
| 05-invention-disclosure-coordinated-robots.md | Coordinated Robots |
| 10-invention-disclosure-jezgro-ecosystem.md | JEZGRO Ecosystem |
| MANIFEST.md | Opis paketa |

---

## Alternativni servisi (backup)

Ako Bernstein ne radi:

1. **OpenTimestamps** (besplatno)
   - https://opentimestamps.org
   - Samo Bitcoin, bez IPFS

2. **OriginStamp** (besplatno)
   - https://originstamp.com
   - Bitcoin + Ethereum

3. **Notarize.io**
   - Plaćeni servis
   - Više opcija

---

## Kontakt Bernstein

- Website: https://www.bernstein.io
- Support: support@bernstein.io
- Twitter: @bernaboratory

---

*Uputstvo kreirano: 20. januar 2026.*
