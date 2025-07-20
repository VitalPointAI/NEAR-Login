import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  optimizeDeps: {
    include: ['near-api-js', 'buffer', 'bitcoinjs-lib'],
  },
  root: '.', // Current directory (examples)
  server: {
    port: 5174,
    open: true
  },
  resolve: {
    alias: {
      // Resolve the src imports to the parent directory
      '@': path.resolve(__dirname, '../src')
    }
  },
  // Explicitly set the build entry point
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html')
    }
  }
})
