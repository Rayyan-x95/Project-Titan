/**
 * Centralized routes configuration for Titan
 * This is the single source of truth for all app routes
 * Used for: Navigation, Sitemap generation, Analytics tracking
 * 
 * When adding new routes:
 * 1. Add entry here
 * 2. Sitemap will auto-generate with next build
 * 3. robots.txt points to dynamic sitemap
 */

export interface AppRoute {
  path: string
  name: string
  priority: number
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  isIndexed: boolean
  description?: string
}

/**
 * All indexed routes for Titan
 * Sorted by priority (highest first)
 */
export const ROUTES: AppRoute[] = [
  {
    path: '/',
    name: 'Home',
    priority: 1.0,
    changefreq: 'daily',
    isIndexed: true,
    description: 'Main dashboard with overview'
  },
  {
    path: '/expense-tracker-india',
    name: 'Expense Tracker India',
    priority: 0.9,
    changefreq: 'weekly',
    isIndexed: true,
    description: 'Expense tracking for India'
  },
  {
    path: '/budget-app-for-students',
    name: 'Budget App for Students',
    priority: 0.9,
    changefreq: 'weekly',
    isIndexed: true,
    description: 'Budget management for students'
  },
  {
    path: '/split-expense-app-india',
    name: 'Split Expense App India',
    priority: 0.9,
    changefreq: 'weekly',
    isIndexed: true,
    description: 'Expense splitting app for India'
  },
  {
    path: '/history',
    name: 'Transaction History',
    priority: 0.7,
    changefreq: 'weekly',
    isIndexed: true,
    description: 'View transaction history'
  },
  {
    path: '/insights',
    name: 'Financial Insights',
    priority: 0.8,
    changefreq: 'weekly',
    isIndexed: true,
    description: 'Analytics and insights'
  },
  {
    path: '/groups',
    name: 'Groups',
    priority: 0.8,
    changefreq: 'weekly',
    isIndexed: true,
    description: 'Manage groups and settlements'
  },
  {
    path: '/budget',
    name: 'Budget Planner',
    priority: 0.3,
    changefreq: 'weekly',
    isIndexed: false,
    description: 'Private monthly budget planner'
  },
  {
    path: '/notifications',
    name: 'Notifications',
    priority: 0.2,
    changefreq: 'daily',
    isIndexed: false,
    description: 'Private notification center'
  },
  {
    path: '/profile',
    name: 'Profile',
    priority: 0.2,
    changefreq: 'monthly',
    isIndexed: false,
    description: 'Private profile and defaults'
  }
  // Add new routes here in future
  // They will automatically appear in sitemap on next build
]

/**
 * Get indexed routes for sitemap generation
 */
export function getIndexedRoutes(): AppRoute[] {
  return ROUTES.filter(route => route.isIndexed)
}

/**
 * Generate sitemap XML
 */
export function generateSitemap(baseUrl: string): string {
  const routes = getIndexedRoutes()
  const currentDate = new Date().toISOString().split('T')[0]

  const urlEntries = routes
    .map(route => {
      const url = `${baseUrl}${route.path}`
      return `
  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`
}

/**
 * Get route by path (for navigation/matching)
 */
export function getRouteByPath(path: string): AppRoute | undefined {
  return ROUTES.find(route => {
    // Normalize paths for comparison
    const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path
    const normalizedRoutePath = route.path.endsWith('/') ? route.path.slice(0, -1) : route.path
    return normalizedPath === normalizedRoutePath
  })
}

/**
 * Get all routes for navigation
 */
export function getNavigationRoutes(): AppRoute[] {
  return ROUTES
}
