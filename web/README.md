# Titan Web Client

This directory contains the Project Titan web application.

## Stack

- React 19
- TypeScript
- Vite 8
- React Router 7
- Vitest + Testing Library
- ESLint

## Core Concepts

- Local-first app state using React Context + reducer
- IndexedDB persistence via backend adapter
- Offline queue scaffolding for eventual sync
- PWA service worker and installable manifest

## Scripts

```bash
# Development
npm run dev

# Build (includes sitemap generation via prebuild)
npm run build

# Lint
npm run lint

# Tests
npm test
npm run test:watch

# Preview production build
npm run preview

# Lighthouse CI
npm run perf:lighthouse
```

## Environment Variables

Create `.env` in this folder when needed:

```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_ENABLE_DEV_AUTH=true
```

- `VITE_GA_MEASUREMENT_ID`: Enables analytics when present
- `VITE_ENABLE_DEV_AUTH`: Dev shortcut for local authentication — defaults to true in development (optional to set). Expected value format: `true`/`false`. In production, set to `false` (or leave unset).

## Directory Highlights

```text
src/
  app/        Route entry screens (login/register + app layout)
  pages/      Feature pages (groups, rent, budget, insights, etc.)
  state/      Titan store, contexts, and hooks
  lib/        Financial utilities, routes, input helpers
  services/   Backend adapters and service modules
  features/   Modular feature slices (currency, offline sync, qr-share, receipt-scan)
```

## Testing

Run one test file:

```bash
npx vitest run src/components/TitanDropdown.test.tsx
```

## Build Output

- Static assets are emitted to `dist/`
- PWA files are served from `public/`
