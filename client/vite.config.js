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
  },
});
