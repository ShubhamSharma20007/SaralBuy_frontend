import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: '0.0.0.0', // Listen on all network interfaces
      port: 5173,
      strictPort: false,
      hmr: {
        // Let Vite auto-detect the correct host
        // This fixes the [::1] vs localhost issue
        clientPort: 5173,
      },
      watch: {
        usePolling: false, // Set to true if on WSL2 or Docker
      }
    },
    build: {
      sourcemap: isDev,
      minify: !isDev,
      rollupOptions: {
        output: {
          manualChunks: undefined, // Disable code splitting if causing issues
        }
      }
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      strictPort: false,
    }
  }
})