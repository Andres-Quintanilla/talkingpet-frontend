import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import Sitemap from 'vite-plugin-sitemap';

export default defineConfig({
  plugins: [
    react(),
    Sitemap({
      hostname: 'http://localhost:5173',
      changefreq: 'weekly',
      priority: 1.0,
      readable: true,
      gzip: true,
      routes: [
        '/', '/productos', '/servicios', '/agendar',
        '/cursos', '/carrito', '/checkout', '/login', '/registro'
      ]
    }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'TalkingPet',
        short_name: 'TalkingPet',
        description: 'Tienda y servicios para tu mascota en Bolivia',
        theme_color: '#dc2268',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  server: { port: 5173, open: true },
  build: { sourcemap: true, chunkSizeWarningLimit: 900 },
});
