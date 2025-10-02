import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://https://animaaz.onrender.com', // Change to your backend port if different
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
