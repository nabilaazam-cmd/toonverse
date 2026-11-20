import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Vite settings for the Toonverse frontend.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Always use port 5173. If it is busy, stop with an error instead of picking another port.
    port: 5173,
    strictPort: true,
    // Development only: forward every /api request to the backend on port 5000,
    // so the browser sees one address (no CORS problems, and the login cookie just works).
    // The path is kept as it is, because every backend route also starts with /api.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
