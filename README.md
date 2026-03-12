# Hotel Schadensmelde-App

PWA zur digitalen Erfassung und Verwaltung von Schäden in Hotelbetrieben (Amanthos Living).

## Quick Start

### Server
```bash
cd server
npm install
npm run seed    # Demo-Daten laden
npm start       # http://localhost:3001
```

### Client
```bash
cd client
npm install
npm run dev     # http://localhost:5173
```

## Demo-Zugänge
| Benutzer | Passwort | Rolle |
|----------|----------|-------|
| admin | admin123 | Admin |
| mitarbeiter1 | pass123 | Mitarbeiter (Reporter) |
| mitarbeiter2 | pass123 | Mitarbeiter (Reporter) |
| handwerker1 | pass123 | Handwerker (Technician) |
| handwerker2 | pass123 | Handwerker (Technician) |

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS (PWA)
- **Backend**: Node.js + Express, REST API, JWT Auth
- **Database**: SQLite (better-sqlite3)

## Hotels
- GBAL — Zurich Airport
- GNBE — Solothurn
- NYAL — Nyon
- HCSI — Chalet Swiss
