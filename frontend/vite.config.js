import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true,
    proxy: {
      '/health': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/models': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/notes': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/enhance': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/transcribe': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      '/flashcards': { target: 'http://127.0.0.1:8080', changeOrigin: true },
    }
  }
})
