import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api/pucho': {
                target: 'https://studio.pucho.ai',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/pucho/, '')
            }
        }
    }
})
