import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {

  const isDev = mode === 'development'
  
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      host: true, // Listen on all addresses including LAN
      hmr: {
        // Only enable HMR in development
        overlay: isDev, // Show error overlay in dev
        // For production, HMR should be disabled automatically
        // but you can explicitly set protocol if needed:
        // protocol: 'ws', // or 'wss' for https
        // host: 'localhost',
        // port: 5173,
      },
    },
    build: {
      sourcemap: isDev,
      // Minify in production
      minify: !isDev,
    },
    // Preview server configuration (for testing production builds locally)
    preview: {
      port: 4173,
      host: true,
    }
  }
})