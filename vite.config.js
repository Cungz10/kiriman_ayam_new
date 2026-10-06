import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import express from 'express'
import cors from 'cors'
import { apiRouter } from './server/api.js'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'api-server',
      configureServer(server) {
        const app = express()
        app.use(cors())
        app.use(express.json())
        app.use('/api', apiRouter)
        server.middlewares.use(app)
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
