import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative asset paths, so the build works under any URL path (GitHub Pages serves it at /assassin-forge/).
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
} as never);
