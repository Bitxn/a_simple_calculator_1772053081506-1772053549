import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    port: 5174,
    strictPort: false,
    // ✅ ADD PROXY - Frontend can call /api/* and it routes to 8056
    proxy: {
      '/api': {
        target: 'http://localhost:8056',  // ← Backend port
        changeOrigin: true,
        secure: false,
      }
    }
  }
})