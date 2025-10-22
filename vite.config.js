import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      // Proxy API calls during development to avoid CORS
      '/api': {
        // target: 'http://157.245.112.40:8080', // AWS/remote (comentado para uso local)
        target: 'http://localhost:8080', // Backend local
        changeOrigin: true,
        secure: false,
        // Strip the '/api' prefix when forwarding
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  },
  optimizeDeps: {
    include: ['react-pdf']
  },
  build: {
    commonjsOptions: {
      include: [/react-pdf/, /node_modules/]
    }
  }
})
