import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    env.NEXT_PUBLIC_API_URL ||
    env.VITE_API_URL ||
    'http://localhost:6001';

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    define: {
      'process.env.NEXT_PUBLIC_API_URL': JSON.stringify(apiUrl),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || mode || 'development'),
    },
    server: {
      port: 6003,
    },
    preview: {
      port: 6003,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});


