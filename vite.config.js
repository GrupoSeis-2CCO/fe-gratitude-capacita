import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['GratitudeLogo.svg', 'default-course-icon.svg'],
      manifest: {
        name: 'Gratitude Capacita',
        short_name: 'Capacita',
        description: 'Plataforma de E-Learning para capacitação e desenvolvimento profissional',
        theme_color: '#1e2939',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 dias
              }
            }
          },
          {
            urlPattern: /^https?:\/\/.*\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 1 dia
              },
              networkTimeoutSeconds: 10
            }
          }
        ]
      }
    })
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
