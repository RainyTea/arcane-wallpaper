import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Wallpaper Engine loads dist/index.html from disk, so all asset URLs must be relative.
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
})
