import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This helps with the Buffer polyfill
      'buffer': 'buffer'
    }
  },
  define: {
    // This ensures Buffer is available in the browser
    'global': {},
    'process.env': {}
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      }
    }
  }
})