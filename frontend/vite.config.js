import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Libera o acesso externo (0.0.0.0)
    port: 3000, // Mantém a porta 3000 padrão interna
    proxy: {
      // ATENÇÃO: Redireciona para o nome do serviço 'api' no docker-compose
      '/api': {
        target: 'http://api:8000', 
        changeOrigin: true,
        secure: false,
      },
      // O endpoint de autenticação também deve ser proxy'ado
      '/api-token-auth': {
        target: 'http://api:8000',
        changeOrigin: true,
        secure: false,
      }
    },
  },
});