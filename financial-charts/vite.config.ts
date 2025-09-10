import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  root: 'examples',
  server: {
    port: 5173,
    open: true
  },
  publicDir: '../public',
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueFinancialCharts',
      fileName: (format) => `vue-financial-charts.${format}.js`
    },
    rollupOptions: {
      external: ['vue', 'd3'],
      output: {
        globals: {
          vue: 'Vue',
          d3: 'd3'
        }
      }
    }
  }
})