# Deployment & Services

## Production Website

- **URL**: https://elektrokombinacija.com
- **Hosting**: cPanel (static site)
- **Deploy method**: FTP upload via `web/deploy-ftp.ps1`

### FTP Access
- **Server**: ftp://ftp.elektrokombinacija.com
- **Username**: bojan@elektrokombinacija.com
- **Password**: *(stored in deploy-ftp.ps1)*

## Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/simulation` | Bus fleet simulation (Belgrade) |
| `/la-delivery` | US Autonomous Delivery Network demo |
| `/la-demo` | Alias for LA delivery |
| `/gv-demo` | Alias for LA delivery |
| `/patent` | Patent information |
| `/patent-portfolio` | Patent portfolio page |
| `/pitch` | Investor pitch |
| `/strategy` | Strategy page |

## Build & Deploy

```powershell
# Build production
cd web
npm run build

# Deploy to FTP
powershell -ExecutionPolicy Bypass -File "deploy-ftp.ps1"
```

## Local Development

```bash
cd web
npm install
npm run dev    # http://localhost:5173
```

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Maps**: Leaflet + react-leaflet
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Known Issues & Fixes

### Leaflet Icon Fix (Production)
The Leaflet default icon fix must be wrapped in try-catch for production:
```javascript
try {
  if (L?.Icon?.Default?.prototype?._getIconUrl) {
    delete L.Icon.Default.prototype._getIconUrl;
  }
  // mergeOptions...
} catch (e) {
  console.warn('Leaflet icon fix failed:', e);
}
```

### SPA Routing (Apache/.htaccess)
The `.htaccess` file in `dist/` enables client-side routing on cPanel.

---

## Full URLs

### Production
- https://elektrokombinacija.com/
- https://elektrokombinacija.com/simulation
- https://elektrokombinacija.com/la-delivery
- https://elektrokombinacija.com/la-demo
- https://elektrokombinacija.com/gv-demo
- https://elektrokombinacija.com/patent
- https://elektrokombinacija.com/patent-portfolio
- https://elektrokombinacija.com/pitch
- https://elektrokombinacija.com/strategy

### FTP
- ftp://ftp.elektrokombinacija.com

### Local Development
- http://localhost:5173/
- http://localhost:5173/simulation
- http://localhost:5173/la-delivery
