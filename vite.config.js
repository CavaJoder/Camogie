import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // Absolute path for SPA
  plugins: [
    react()
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
