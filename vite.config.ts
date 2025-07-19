import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default defineConfig(({ mode }: any) => ({
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (react as any)(),
  ],
  build: mode === 'lib' ? ({
    lib: {
      entry: './src/index.ts',
      name: 'NEARStakingAuth',
      formats: ['es', 'cjs'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fileName: (format: any) => `index.${format === 'es' ? 'js' : 'cjs'}`
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any) : undefined
}))
