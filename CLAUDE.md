# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

```bash
# Install dependencies
npm --prefix web install

# Run development server
npm --prefix web run dev

# Build for production (runs sitemap generation, then tsc + vite build)
npm --prefix web run build

# Run all tests
npm --prefix web test

# Run tests in watch mode
npm --prefix web run test:watch

# Run a single test file
npx --prefix web vitest run src/components/TitanDropdown.test.tsx

# Lint
npm --prefix web run lint

# Preview production build
npm --prefix web run preview

# Lighthouse CI performance audit
npm --prefix web run perf:lighthouse
```

Environment variables (in `web/.env`):

- `VITE_GA_MEASUREMENT_ID` — Google Analytics; analytics disabled if missing
- `VITE_ENABLE_DEV_AUTH` — Defaults to enabled in dev; skips backend login and derives username from email prefix

## Architecture Overview

### Monorepo Layout

The entire app lives under `web/`. The root holds `vercel.json` (deployment) and this file. All source is in `web/src/`.

### Local-First State Management

Titan uses React Context + `useReducer` with IndexedDB persistence. No external state library.

**State flow:**

```
User Action → dispatch() → reducer() → State Update → titanBackend.saveState() (debounced 250ms)
```

Three separate React contexts enable fine-grained subscriptions (avoid unnecessary re-renders):

- `TitanStateContext` — full `TitanState` object
- `TitanActionsContext` — memoized `TitanActions` dispatch wrapper
- `TitanCurrentUserContext` — `string | null`

**Key files:**

- `src/state/TitanStore.tsx` — TitanProvider + reducer (~1070 lines), 21 action types, normalization logic
- `src/state/titan-context.ts` — context definitions + legacy `useTitan` hook (reshapes notifications/user for login page)
- `src/state/useTitan.ts` — direct `useTitanState` / `useTitanActions` hooks (used by most pages)

**Two `useTitan` hooks exist.** The one in `titan-context.ts` is a legacy compatibility layer (used by login page). The one in `useTitan.ts` is the primary hook for feature pages. Import from `useTitan.ts` for new code.

**Key normalization functions:**

- `finalizeSplit()` — sanitizes participants, creates share map, normalizes settlements, recalculates `settledAmountPaise` / `isSettled`
- `normalizeState()` — runs on hydration; ensures arrays default to `[]`, clamps budgets, normalizes groups and splits

**Provider lifecycle:**

1. Mounts with `emptyState`, hydrates from IndexedDB via `titanBackend.loadState()`
2. Dispatches `HYDRATE_STATE` + `RUN_DUE_RENT_SCHEDULES` inside `startTransition`
3. On every state change (post-hydration), calls `titanBackend.saveState(state)` (debounced 250ms, serialized in-flight writes)
4. Polls `RUN_DUE_RENT_SCHEDULES` every 60 seconds
5. Budget alert effect dispatches notifications for WARNING/OVER states (deduped by `lastAlertKey`)

**Offline integration:** Every mutative action in `TitanActions` also calls `enqueueOfflineOperation()` before dispatching. Local state applies immediately; the queue exists for eventual server sync.

### Monetary Conventions (Important)

Two different conventions coexist — **do not mix them:**

- **Splits and rent schedules:** amounts in **paise** (integer). Use `formatPaise()` / `formatRupees()` from `finance.ts`
- **Cash entries, EMIs, transactions:** amounts in **rupees** (float). Use `formatRupees()`

All IDs use `createId()` prefix helpers: `split-`, `group-`, `tx-`, `cash-`, `emi-`, `rent-`.

### Backend & Offline

- `src/services/titan-backend.ts` — `TitanBackend` interface, currently IndexedDB-only via `TitanDB` class. In-memory cache + debounced writes + in-flight serialization. Ready for Supabase/Firebase swap.
- `src/features/offline-sync/services/offlineQueue.ts` — localStorage-backed queue (`titan-offline-queue`), last-write-wins dedup by entityKey+type. **`flushOfflineQueue()` is currently a no-op** (`await Promise.resolve()` then clears queue). The architecture is ready for a backend sync step.
- Login page (`src/app/login/page.tsx`) calls `fetch('/api/auth/login', ...)` but has a dev-mode shortcut that bypasses it entirely. Look for `TITAN-AUTH-101` and `TITAN-AUTH-102` TODOs.

### Feature Modules

Features in `src/features/` follow a consistent 4-layer structure:

```
feature-name/
  components/    (React UI)
  hooks/         (custom React hooks)
  services/      (business logic / API / storage)
  utils/         (pure functions, types)
```

| Feature | Purpose | Notes |
|---------|---------|-------|
| `currency` | Multi-currency display | Fetches rates from `open.er-api.com`, 12hr localStorage cache, 7 supported currencies |
| `offline-sync` | Operation queuing | Monitors `navigator.onLine`, SW `SYNC_QUEUE` messages, 4s polling |
| `qr-share` | QR sharing | **Visual-only** — `qr.ts` generates a deterministic SVG pattern, not a scannable QR code |
| `receipt-scan` | OCR receipt scanning | Fully client-side via Tesseract.js (lazy CDN load), regex-based parsing |
| `share-links` | Deep link sharing | base64url + djb2 integrity hash, 14-day TTL, not encrypted |

### Routing (`src/App.tsx`)

Provider nesting: `ErrorBoundary` > `TitanProvider` > `CurrencyProvider` > `BrowserRouter`

Protected routes (guarded by `ProtectedRoute` checking `state.currentUser`): `/`, `/expense/new`, `/history`, `/groups`, `/people/:personId`, `/cash`, `/emis`, `/rent`, `/sms`, `/insights/*`, `/budget`, `/settlements/:splitId`

Unprotected: `/login`, `/register`, SEO landing pages (`/expense-tracker-india`, `/budget-app-for-students`, `/split-expense-app-india`)

`/dashboard` redirects to `/`.

Route config in `src/lib/routes.ts` drives sitemap generation with `isIndexed` and `priority` flags.

### Finance Utilities (`src/lib/finance.ts`)

Pure functions for all financial calculations:

- **Formatters:** `formatPaise()`, `formatRupees()` — `en-IN` locale
- **Participant math:** `sanitizeParticipantList()`, `createParticipantShareMap()` (equal split + remainder), `getParticipantOutstandingPaise()`
- **Aggregation:** `getPersonBalances()`, `getTotalOwedPaise()`, `getTotalOwePaise()`, `getSummaryInsights()`
- **Group settlement:** `simplifyGroupSettlement()` — greedy debtor/creditor matching to minimize transactions
- **Insights:** `getHealthScore()` (85 base, -20/-10/-10 deductions), `getSpendingTriggers()`, `getSpendTrends()`
- **Budget:** `getBudgetSummary()`, `getCurrentMonthTrackedSpendRupees()`, `getCashBalance()`

## Design System — "The Ethereal Vault"

Dark mode neon-editorial aesthetic. Full spec in `web/design.md`.

**Styling approach:** Vanilla CSS only (no Tailwind, no CSS modules, no CSS-in-JS). Single global `src/index.css`. BEM-lite class naming (`.button-primary`, `.glass-panel`, `.list-row`).

**Color tokens:**

- Background: `#0a0e19`
- Primary: `#afa2ff` (Electric Purple)
- Secondary: `#00cffc` (Neon Blue)
- Tertiary: `#58ffd7` (Aqua Teal)

**Surface hierarchy (no 1px borders — use surface tiers for separation):**

- Level 0: `#0a0e19` (base)
- Level 1: `#0f131f` (sectioning)
- Level 2: `#141927` (cards)
- Level 3: `#262c3d` (interactive/floating)

**Key rules:**

- Glassmorphism with 20–40px backdrop blur on floating elements
- Gradient buttons: primary to primary-dim (`#7459f7`) at 135deg
- No standard drop shadows — only neon-tinted soft light leaks
- No dividers or horizontal rules — negative space separates content
- No 100% white text — use `on-surface-variant` to reduce eye strain
- Minimum roundedness: `md` (0.75rem)
- Typography: Plus Jakarta Sans (display), Manrope (body)

**Note:** `index.css` contains some legacy light-theme remnants. The active app shell uses the dark theme.

## Testing

Vitest + Testing Library + jsdom. Config: `web/vitest.config.ts`.

**Setup:** `src/test/setup.ts` — mocks `window.matchMedia`, imports `@testing-library/jest-dom/vitest`.

**Patterns:**

- Use `vi.hoisted()` + `vi.mock()` for module mocking
- `renderHook` for hooks, `userEvent.setup()` for realistic interactions
- `vi.spyOn` for browser APIs (clipboard, matchMedia)

**Run a single test:**

```bash
npx --prefix web vitest run src/features/qr-share/components/QRShareModal.test.tsx
```

**Lighthouse CI:** `web/lighthouserc.json` — asserts performance >= 0.9, accessibility >= 0.9, SEO >= 0.95, LCP <= 2500ms, CLS <= 0.1.

## PWA & Service Worker

- `web/public/manifest.webmanifest` — standalone, dark theme, 3 shortcuts
- `web/public/sw.js` — 4-cache strategy (shell, runtime, navigation, API), stale-while-revalidate for assets, network-first for API, navigation preload, Background Sync for `titan-sync-queue`

## Key Conventions

- Notifications push on state changes (max 20, auto-slice)
- Rent schedules auto-generate splits every 30 days
- Participant lists sanitized via `sanitizeParticipantList()` (dedupe, exclude payer)
- `normalizeState()` runs on every hydration for data integrity
- `startTransition` wraps all dispatch calls and hydration
- All state updates go through the central reducer — never mutate state directly
