import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',     // ✅ Allow access from any IP
    port: 5173,
    strictPort: true,
    cors: true,          // ✅ Allow cross-origin access
    allowedHosts: ["1400-2401-4900-3683-96cf-bc33-9063-c573-136f.ngrok-free.app"], // ✅ Allow all hosts (for ngrok)
  }
});
