import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['all', 'jadewallet.com.br', 'localhost'], 
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://store_api:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api-token-auth': {
        target: 'http://store_api:8000',
        changeOrigin: true,
        secure: false,
      }
    },
  },
});