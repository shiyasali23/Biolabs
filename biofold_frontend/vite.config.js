import { defineConfig, loadEnv } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const basePath = env.VITE_BASE_PATH
    ? `/${env.VITE_BASE_PATH.replace(/^\/+|\/+$/g, '')}/`
    : '/'
  const proxyTarget = env.BACKEND_PROXY_TARGET || 'http://127.0.0.1:8005'
  const port = Number(env.PORT) || 3001

  return {
    base: basePath,
    plugins: [solid()],
    server: {
      port,
      proxy: {
        '/agent': { target: proxyTarget, changeOrigin: true },
        '/healthz': { target: proxyTarget, changeOrigin: true },
      },
    },
    preview: { port },
  }
})
