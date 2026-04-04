# Project Titan - Modern PWA UI

## Overview
This project implements a modern, responsive PWA (Progressive Web Application) UI for Project Titan.

## Features Implemented

### 1. Core Components
- **Header**: Navigation bar with logo and logout button
- **Footer**: Copyright and branding
- **Navbar**: Responsive navigation for authenticated users
- **Footer**: Footer component for all pages
- **CurrencyToolbar**: Display and manage current currency
- **ProjectCard**: Individual project card component
- **CollaborationModal**: Modal for collaboration features

### 2. State Management
- **TitanContext**: Manages app state including authentication, theme preferences, and notifications

### 3. UI Components
- **AppShell**: Main shell with navigation
- **DashboardLayout**: Layout with sidebar navigation
- **Notifications**: Toast notification system with auto-dismiss
- **OfflineIndicator**: Network status indicator with reconnect button
- **PwaCard**: PWA readiness indicator
- **OfflineStatusBar**: Connection status bar
- **Button**: Modern styled button component
- **Input**: Form input component with error handling
- **Checkbox**: Toggle checkbox component

### 4. Pages
- `/login`: Public login page
- `/register`: Public registration page
- `/dashboard`: Main dashboard
- `/projects`: Projects listing
- `/projects/my`: User's own projects
- `/profile`: User profile page
- `/settings`: Settings page

### 5. Modern CSS
- Responsive design with mobile-first approach
- Dark/light theme support
- Smooth animations and transitions
- Professional gradient backgrounds
- Optimized performance

## Project Structure

```
src/
├── components/
│   ├── atoms/       # Atomic UI components
│   ├── molecules/   # Compound components
│   ├── organisms/   # Complex components
│   ├── components/  # Shared components
│   ├── layouts/     # Layout components
│   ├── index.ts
├── lib/
│   └── utils.ts     # Utility functions
├── state/
│   └── titan-context.ts  # Application state
├── providers/
│   ├── AuthProvider.tsx
│   ├── QueryProvider.tsx
│   └── index.ts
├── app/
│   ├── index.tsx
│   └── ... pages/
├── App.tsx          # Main app component
└── index.ts         # Entry point
```

## Usage

### Basic Imports

```typescript
import { BrowserRouter, Routes } from 'react-router-dom'
import { AppShell, DashboardLayout } from './components'
import { NotFound } from './components/not-found'
import { AppProvider } from './AppProvider'
import { useTitan } from './state/titan-context'

const App = () => {
  const { isAuthenticated } = useTitan()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />} />
        <Route path="/dashboard" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

### Components

```typescript
import { useTitan } from './state/titan-context'
import { Button, Input } from './components'

// Use utilities
import { formatCurrency, formatDate } from './lib/utils'

// Example
<Button>Click Me</Button>
<Input placeholder="Enter email" />
```

## Styling

All styles are in `src/index.css`. The CSS includes:
- CSS Reset
- Modern CSS Variables for theming
- Responsive breakpoints
- Utility classes for consistent styling
- Animations for transitions

## Dark Mode

The app supports dark mode with system preference detection:
```typescript
import { useDarkMode } from './lib/utils'

const { isDark, toggle } = useDarkMode()
```

## PWA Support

The app includes PWA support for:
- Service worker registration
- Offline indicator
- PWA readiness badge
- Offline status bar
- Network type detection

## Security

- Client-side authentication
- Protected routes with `ProtectedRoute` wrapper
- Input validation with error handling
- Sanitized output with `ErrorBoundary`

## Technologies Used

- React 18
- React Router DOM
- Tailwind CSS
- CSS Custom Properties
- TanStack Query for data fetching
- Context API for state management
