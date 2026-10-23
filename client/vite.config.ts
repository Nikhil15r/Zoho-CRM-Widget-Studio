import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@zoho-studio/shared': path.resolve(__dirname, '../shared/src/index.ts')
    }
  },
  server: {
    port: 3000,
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      },
      '/preview': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      },
      '/sdk': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
