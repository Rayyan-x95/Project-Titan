/**
 * Sitemap Generation Script (JavaScript version)
 * Run during build to generate sitemap.xml from routes
 * 
 * Usage: node scripts/generate-sitemap.js
 * Or add to package.json as prebuild: "node scripts/generate-sitemap.js"
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const ROUTES = [
  {
    path: '/',
    priority: 1.0,
    changefreq: 'daily'
  },
  {
    path: '/expense-tracker-india',
    priority: 0.9,
    changefreq: 'weekly'
  },
  {
    path: '/budget-app-for-students',
    priority: 0.9,
    changefreq: 'weekly'
  },
  {
    path: '/split-expense-app-india',
    priority: 0.9,
    changefreq: 'weekly'
  },
  {
    path: '/history',
    priority: 0.7,
    changefreq: 'weekly'
  },
  {
    path: '/insights',
    priority: 0.8,
    changefreq: 'weekly'
  },
  {
    path: '/groups',
    priority: 0.8,
    changefreq: 'weekly'
  }
]

const BASE_URL = 'https://titanapp.qzz.io'
const PUBLIC_DIR = path.join(__dirname, '../public')

function generateSitemap() {
  const currentDate = new Date().toISOString().split('T')[0]

  const urlEntries = ROUTES.map(route => {
    const url = `${BASE_URL}${route.path}`
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`
}

try {
  const sitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml')
  const sitemapContent = generateSitemap()

  fs.writeFileSync(sitemapPath, sitemapContent, 'utf-8')
  console.log(`✅ Sitemap generated: ${sitemapPath}`)
  console.log(`📊 Total routes: ${ROUTES.length}`)
  console.log(`📅 Last updated: ${new Date().toISOString().split('T')[0]}`)
} catch (error) {
  console.error('❌ Failed to generate sitemap:', error)
  process.exit(1)
}
