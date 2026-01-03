import react from '@vitejs/plugin-react-swc'

import { defineConfig } from 'vite'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
    root: '.',
    resolve: {
        alias: {
            '@': resolve(__dirname, './')
        }
    },
    plugins: [
        react(),
        {
            name: 'remove-crossorigin',
            writeBundle() {
                const htmlPath = resolve(__dirname, 'dist/index.html')
                let html = readFileSync(htmlPath, 'utf-8')
                html = html.replace(/\s+crossorigin/g, '')
                writeFileSync(htmlPath, html)
            }
        }
    ],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                entryFileNames: 'assets/[name].js',
                chunkFileNames: 'assets/[name].js',
                assetFileNames: 'assets/[name].[ext]'
            }
        }
    },
    base: './',
    publicDir: 'public'
})
