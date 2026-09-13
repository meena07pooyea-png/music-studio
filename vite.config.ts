import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = env.PORT ? Number(env.PORT) : 5173;
  const apiTarget = env.VITE_API_URL || 'http://localhost:3001';

  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { '@': path.resolve(rootDir, './src') } },
    server: {
      port,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true, secure: false },
      },
    },
  };
});
