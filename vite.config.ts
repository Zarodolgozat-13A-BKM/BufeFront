import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/external-api': {
        target: 'https://jedlikinfo.jedlik.eu/api/api',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/external-api/, ''),
      },
    },
  },
})