# 여행 기록 — Korean Trip Logger

Click regions on a map of Korea. Colors are saved to Supabase. Export as CSV anytime.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create Supabase project
1. Go to https://supabase.com and create a free project
2. Open **SQL Editor** and run the contents of `supabase-schema.sql`
3. Go to **Settings → API** and copy your Project URL and anon key

### 3. Configure environment
```bash
cp .env.example .env.local
# Edit .env.local and fill in your Supabase URL and anon key
```

### 4. Run locally
```bash
npm run dev
# Open http://localhost:3000
```

## Deploying to GitHub Pages

### 1. Add Supabase secrets to GitHub
Go to your repo → **Settings → Secrets and variables → Actions** → add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Enable GitHub Pages
Go to **Settings → Pages → Source** and set it to **GitHub Actions**.

### 3. Push to main
```bash
git add .
git commit -m "initial commit"
git push origin main
```

The workflow in `.github/workflows/deploy.yml` will automatically build and deploy on every push to `main`. Your site will be live at `https://{your-username}.github.io/{repo-name}/`.

## How it works

- Click any region → it gets colored and saved to Supabase
- Click again → cycles to the next color
- Use the level toggle (시도 / 시군구 / 읍면동) to change granularity
- Click × next to a trip to delete it
- Click "CSV 다운로드" to export all trips as a CSV file

## Data source

Boundary data comes from [admdongkor](https://github.com/vuski/admdongkor) —
Korean administrative boundaries from 1975 to present, served as Parquet files
directly from GitHub. No extra backend needed.

## File structure

```
src/
  app/
    page.tsx                      ← root page
    layout.tsx                    ← imports fonts + MapLibre CSS
    globals.css                   ← design tokens + typography
  components/
    layout/
      app-shell.tsx               ← bootstraps data, composes layout
      sidebar.tsx                 ← level toggle, trip list, CSV button
    map/
      map-container.tsx           ← MapLibre + deck.gl GeoJsonLayer
      deck-overlay.tsx            ← MapboxOverlay wrapper
  hooks/
    use-admdongkor-geojson.ts     ← fetches + caches GeoJSON
  stores/
    app-store.ts                  ← Zustand: level, colorMap, trips
  lib/
    supabase.ts                   ← Supabase client
    db.ts                         ← saveTrip, deleteTrip, loadAllTrips
    backup.ts                     ← exportTripsAsCSV
```
