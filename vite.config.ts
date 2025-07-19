import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      exclude: ['src/examples/**/*', 'src/**/*.stories.*', 'src/**/*.test.*']
    })
  ],
  build: mode === 'lib' ? {
    lib: {
      entry: './src/index.ts',
      name: 'NEARStakingAuth',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
    },
    rollupOptions: {
      external: [
        'react', 
        'react-dom', 
        'react/jsx-runtime',
        '@near-wallet-selector/core',
        '@near-wallet-selector/my-near-wallet',
        '@near-wallet-selector/meteor-wallet', 
        '@near-wallet-selector/modal-ui',
        'near-api-js',
        'zustand'
      ],
      output: {
        exports: 'named',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime'
        }
      }
    },
    cssCodeSplit: false
  } : undefined
}))
