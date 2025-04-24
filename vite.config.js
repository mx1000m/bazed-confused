import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'buffer': 'buffer'
    }
  },
  define: {
    global: {},
    'process.env': {}
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  server: {
    host: true, // 👈 makes it accessible via local network IP
    port: 5173  // optional, but explicit
  }
})