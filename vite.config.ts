import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import ViteSitemap from 'vite-plugin-sitemap'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ViteSitemap({
      hostname: 'https://gakenye-ndiritu.co.ke',
      dynamicRoutes: [
        '/projects',
        '/tech',
        '/services',
        '/contact',
      ],
    }),
  ],
})