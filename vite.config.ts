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

      // requests to /external-api/... will be forwarded to
      // https://jedlikinfo.jedlik.eu/api/api/...
      '/external-api': {
        target: 'https://jedlikinfo.jedlik.eu/api/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/external-api/, ''),
      },
    },
  },
})