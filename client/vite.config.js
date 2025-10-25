import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: { port: 5173 },
  optimizeDeps: {
    // Force fresh pre-bundling to avoid stale optimized cache in dev
    force: true,
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'axios'],
  },
})
