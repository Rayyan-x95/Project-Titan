import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    modulePreload: {
      polyfill: false
    },
    chunkSizeWarningLimit: 900,
    // Workaround for Rolldown / Vite 8 CJS/ESM interop on Vercel packages
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (
            id.includes('react/') ||
            id.includes('react-dom/') ||
            id.includes('react-router-dom/')
          ) {
            return 'react'
          }

          if (
            id.includes('@vercel/analytics') ||
            id.includes('@vercel/speed-insights')
          ) {
            return 'analytics'
          }

          return 'vendor'
        }
      }
    }
  }
})
