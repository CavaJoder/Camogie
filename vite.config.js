import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // Absolute path for SPA
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [], // Let globPatterns handle everything in public/dist
      manifest: {
        name: 'Performance Analysis Tracker',
        short_name: 'Perf Tracker',
        description: 'Track and analyze match performance statistics',
        theme_color: '#bb86fc',
        background_color: '#121212',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  build: {
    assetsDir: '', // Flatten directory structure
    rollupOptions: {
      output: {
        entryFileNames: 'app.js', // Fixed name in ROOT
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]' // e.g. index.css in ROOT
      }
    }
  }
})
