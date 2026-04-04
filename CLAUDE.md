# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

```bash
# Install dependencies
npm --prefix web install

# Run development server
npm --prefix web run dev

# Build for production
npm --prefix web run build

# Run tests
npm --prefix web test

# Run tests in watch mode
npm --prefix web run test:watch

# Lint
npm --prefix web run lint

# Preview production build
npm --prefix web run preview
```

## Architecture Overview

### Local-First State Management

Titan uses a **local-first architecture** with React Context + useReducer for state management. All data persists to IndexedDB via `src/lib/indexeddb.ts` (TitanDB class). The state lives in `src/state/TitanStore.tsx` (TitanProvider) and is consumed via context hooks in `src/state/titan-context.ts`.

**State flow:**
```
User Action → dispatch() → reducer() → State Update → IndexedDB persistence
```

Key patterns:
- All state updates go through a central reducer with typed actions
- `finalizeSplit()` normalizes splits with participant shares/settlements
- `normalizeState()` ensures data integrity on hydration
- Offline operations queue in `src/features/offline-sync/services/offlineQueue.ts` for later sync

### Core Domain Types (`src/types.ts`)

- **Split**: Expense splits with participant shares and settlements
- **Group**: Member collections for shared expenses
- **Transaction**: Merchant transactions with approval workflow (SMS ingestion)
- **CashEntry**: Manual cash IN/OUT tracking
- **Emi**: Recurring payment obligations
- **RentSchedule**: Automated rent split generation

### Finance Utilities (`src/lib/finance.ts`)

Pure functions for financial calculations:
- `formatPaise()` / `formatRupees()` - INR formatting (amounts stored in paise)
- `getParticipantOutstandingPaise()` - Calculate what someone owes
- `simplifyGroupSettlement()` - Optimize group payment paths
- `getHealthScore()` - Financial health metric (85 base, -20/-10/-10 for EMI/pending debt)
- `getSpendingTriggers()` - Behavioral spending analysis

### Feature Modules

Features live in `src/features/` with consistent structure:
- `currency/` - Multi-currency support with exchange rates
- `offline-sync/` - Offline operation queuing
- `qr-share/` - QR code sharing for splits
- `share-links/` - Shareable deep links to splits
- `receipt-scan/` - OCR receipt scanning

### Routing (`src/App.tsx`)

React Router with lazy-loaded pages:
- `/` - Dashboard (HomePage)
- `/expense/new` - New expense form
- `/history` - Transaction list
- `/people/:personId` - Person detail view
- `/groups` - Group management
- `/sms` - SMS ingestion interface
- `/cash`, `/emis`, `/rent` - Specialized trackers
- `/insights/*` - Financial insights

### Design System (`design.md`)

**"The Ethereal Vault"** - Dark mode neon-editorial aesthetic:
- Background: `#0a0e19`, Primary: `#0afa2ff`, Secondary: `#00cffc`, Tertiary: `#58ffd7`
- No 1px borders - use surface tier backgrounds for separation
- Typography: Plus Jakarta Sans (display), Manrope (body)
- Glassmorphism with backdrop blur on floating elements
- Gradient buttons (primary to primary-dim at 135deg)

## Testing

Vitest + Testing Library. Tests co-locate with features:
- `src/components/*.test.tsx`
- `src/features/*/components/*.test.tsx`

Test setup in `src/test/setup.ts` mocks `window.matchMedia`.

## Backend Integration

`src/services/titan-backend.ts` abstracts persistence. Currently IndexedDB-only, with placeholder for Supabase/Firebase sync. Offline operations queue for eventual consistency.

## Key Conventions

- Amounts stored in **paise** (integer), displayed in rupees
- All IDs use `createId()` prefix helper (`split-`, `group-`, `tx-`, etc.)
- Participant lists sanitized via `sanitizeParticipantList()` (dedupe, exclude payer)
- Notifications push on state changes (max 20, auto-slice)
- Rent schedules auto-generate splits every 30 days
