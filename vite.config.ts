import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@vietmap/vietmap-gl-js']
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@vietmap/vietmap-gl-js': '@vietmap/vietmap-gl-js/dist/vietmap-gl.js'
    }
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  server: {
    fs: {
      allow: ['..']
    }
  }
})
