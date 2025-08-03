import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@heroicons/react', '@headlessui/react'],
          utils: ['axios', 'clsx', 'dayjs']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
}); 