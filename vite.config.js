import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api/icl': {
        target: 'https://api.dolarito.ar',
        changeOrigin: true,
        rewrite: (path) => '/api/frontend/indices/icl',
        headers: {
          'auth-client': 'f7d471ab0a4ff2b7947759d985ed1db0',
          'referer': 'https://www.dolarito.ar/indices/indice-icl'
        }
      },
      '/api/ipc': {
        target: 'https://api.argentinadatos.com',
        changeOrigin: true,
        rewrite: (path) => '/v1/finanzas/indices/inflacion'
      }
    }
  }
})
