import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'remove-crossorigin',
      writeBundle() {
        const htmlPath = resolve(__dirname, 'dist/index.html')
        let html = readFileSync(htmlPath, 'utf-8')
        html = html.replace(/\s+crossorigin/g, '')
        writeFileSync(htmlPath, html)
      },
    },
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  base: './',
  publicDir: 'public',
})
