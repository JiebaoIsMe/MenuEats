import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000, // Default port for Customer frontend
    host: true, // Allow external connections
  },
  // Multi-interface support:
  // Customer: npm run dev:customer (port 3000)
  // Business: npm run dev:business (port 3001) 
  // Rider: npm run dev:rider (port 3002)
})
