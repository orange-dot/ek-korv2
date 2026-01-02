# Azure Static Web Apps - Setup Guide

## Pregled

```
elektrokombinacija.com
         │
         ▼ (DNS redirect)
Azure Static Web Apps
         │
         ▼ (CI/CD on merge to main)
GitHub Repo (autobusi-punjaci)
```

---

## Korak 1: Kreiraj Azure Static Web App

1. Idi na [Azure Portal](https://portal.azure.com)

2. Klikni **"Create a resource"** → traži **"Static Web App"**

3. Popuni:
   - **Subscription**: Tvoj subscription
   - **Resource Group**: Kreiraj novi ili koristi postojeći
   - **Name**: `elektrokombinacija` (ili šta hoćeš)
   - **Plan type**: `Free` (besplatno!)
   - **Region**: `West Europe` (najbliže Srbiji)

4. **Deployment details**:
   - **Source**: `GitHub`
   - **GitHub Account**: Poveži svoj nalog
   - **Organization**: `orange-dot`
   - **Repository**: `autobusi-punjaci`
   - **Branch**: `main`

5. **Build details**:
   - **Build Presets**: `Custom`
   - **App location**: `web/dist`
   - **Api location**: (ostavi prazno)
   - **Output location**: (ostavi prazno)

6. Klikni **"Review + create"** → **"Create"**

---

## Korak 2: Uzmi Deployment Token

Azure će automatski kreirati GitHub Actions workflow, ALI mi već imamo svoj.

1. U Azure portalu, otvori tvoj Static Web App

2. Idi na **"Settings"** → **"Manage deployment token"**

3. Klikni **"Copy"** da kopiraš token

---

## Korak 3: Dodaj Token u GitHub Secrets

1. Idi na GitHub repo: `https://github.com/orange-dot/autobusi-punjaci`

2. **Settings** → **Secrets and variables** → **Actions**

3. Klikni **"New repository secret"**

4. Popuni:
   - **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - **Secret**: (paste token iz koraka 2)

5. Klikni **"Add secret"**

---

## Korak 4: Obriši Azure-generisan Workflow (ako postoji)

Azure možda kreira svoj workflow fajl. Ako vidiš dupli workflow:

1. Proveri `.github/workflows/` folder
2. Obriši sve osim `azure-static-web-apps.yml` koji smo mi kreirali

---

## Korak 5: Testiraj Deploy

1. Push bilo koju promenu na `main`:
   ```bash
   git add .
   git commit -m "Test CI/CD deployment"
   git push
   ```

2. Idi na **GitHub → Actions** tab da vidiš build progress

3. Kad završi, sajt je live na Azure URL-u (npr. `happy-tree-12345.azurestaticapps.net`)

---

## Korak 6: Poveži Custom Domain (elektrokombinacija.com)

### Opcija A: Redirect (jednostavnije)

Kod tvog domain registra (gde si kupio domen), postavi:

```
Type: URL Redirect / Forwarding
From: elektrokombinacija.com
To: https://happy-tree-12345.azurestaticapps.net
Type: Permanent (301)
```

### Opcija B: Custom Domain na Azure (profesionalnije)

1. U Azure portalu → tvoj Static Web App → **"Custom domains"**

2. Klikni **"+ Add"**

3. Za **root domain** (elektrokombinacija.com):
   - Dodaj **A record** kod registra:
     ```
     Type: A
     Name: @
     Value: (IP adresa koju Azure prikaže)
     ```
   - Dodaj **TXT record** za verifikaciju:
     ```
     Type: TXT
     Name: @
     Value: (vrednost koju Azure prikaže)
     ```

4. Za **www subdomain** (www.elektrokombinacija.com):
   - Dodaj **CNAME record**:
     ```
     Type: CNAME
     Name: www
     Value: happy-tree-12345.azurestaticapps.net
     ```

5. Sačekaj DNS propagaciju (do 48h, obično 15-30 min)

6. Azure automatski generiše **FREE SSL certificate**!

---

## Struktura Fajlova

```
autobusi-punjaci/
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml  ← CI/CD workflow
├── web/
│   ├── src/
│   ├── dist/                          ← Build output (gitignored)
│   ├── staticwebapp.config.json       ← Azure routing config
│   ├── package.json
│   └── vite.config.js
└── patent/
```

---

## CI/CD Flow

```
Developer pushes to main
         │
         ▼
GitHub Actions triggered
         │
         ▼
npm ci && npm run build
         │
         ▼
Upload dist/ to Azure
         │
         ▼
Site live in ~2 minutes!
```

---

## Troubleshooting

### Build fails
- Proveri da `npm run build` radi lokalno
- Proveri GitHub Actions logs

### 404 errors na refresh
- `staticwebapp.config.json` rešava ovo sa `navigationFallback`

### Domain ne radi
- DNS propagacija može trajati do 48h
- Proveri DNS records sa: `dig elektrokombinacija.com`

### SSL certificate error
- Azure automatski generiše, ali treba ~15 min
- Ako ne radi posle sat vremena, proveri domain verification

---

## Korisni Linkovi

- [Azure Static Web Apps Docs](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Custom Domain Setup](https://docs.microsoft.com/en-us/azure/static-web-apps/custom-domain)
- [GitHub Actions for Azure](https://github.com/Azure/static-web-apps-deploy)

---

## Cena

| Tier | Cena | Uključeno |
|------|------|-----------|
| **Free** | $0/mesec | 100 GB bandwidth, 2 custom domains, SSL |
| Standard | $9/mesec | 100 GB + više features |

Free tier je sasvim dovoljan za prezentacioni sajt!

---

*Setup guide kreiran: 2026-01-02*
