import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Polyfill Node.js globals (global, Buffer, process, etc.)
      // This is needed for Stellar Wallet Kit and its dependencies
      globals: {
        global: true,
        Buffer: true,
        process: true,
      },
      // Polyfill Node.js protocol imports (node:fs, node:path, etc.)
      protocolImports: true,
    }),
  ],
  server: {
    port: 5173,
    host: true, // Allow external connections
    open: true, // Auto open browser
  },
})


