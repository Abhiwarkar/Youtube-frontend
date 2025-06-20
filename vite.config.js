import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({
    include: "**/*.{jsx,js,tsx,ts}"
  })],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'build'
  },
  css: {
    postcss: './postcss.config.cjs'
  },
  esbuild: {
    loader: "jsx",
    include: /src\/.*\.(js|ts)$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx',
      },
    },
  },
})