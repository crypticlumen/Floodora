# Floodora — Smart Drain & Flood Monitoring

**Smarter Drains, Safer Cities.** A frontend-only municipal command-center prototype using illustrative simulated data. It does not connect to real sensors or provide validated flood predictions.

## Requirements
- Node.js 20+ recommended
- npm

## Start
```bash
npm install
npm run dev
```
Open the local URL Vite prints (usually http://localhost:5173).

## Production build
```bash
npm run build
npm run preview
```

## Included
- Responsive overview dashboard and navigation
- 128 illustrative drain records and explainable risk scores
- Interactive OpenStreetMap / Leaflet map
- Simulated sensor updates with pause/resume and reset
- Search, risk filters, alert acknowledgement/resolution
- Maintenance task creation, assignment, status updates and notes
- Analytics charts using Recharts
- Local storage persistence for drains, alerts, tasks, and preferences

## Demo limitations
- All readings and map points are illustrative demonstration data.
- Risk scoring is a configurable heuristic, not a validated flood model.
- No login, backend, emergency dispatch, or real notification service is included.
- OpenStreetMap map tiles require an internet connection; the rest of the interface works without map tiles.

## Troubleshooting
If dependencies or scripts appear missing, run commands from the directory containing this `package.json`:
```bash
npm install
npm run dev
```
