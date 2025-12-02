import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['all'], // Libera para qualquer IP ou domínio (ideal para dev local)
    host: true, // Libera o acesso externo (0.0.0.0)
    port: 3000, // Mantém a porta 3000 padrão interna
    proxy: {
      '/api': {
        target: 'http://api:8000', 
        changeOrigin: true,
        secure: false,
      },
      '/api-token-auth': {
        target: 'http://api:8000',
        changeOrigin: true,
        secure: false,
      }
    },
  },
});