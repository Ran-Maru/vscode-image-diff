import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'webview'),
  build: {
    outDir: path.resolve(__dirname, 'dist/webview'),
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'webview/main.tsx'),
      output: {
        entryFileNames: 'main.js',
        assetFileNames: 'main[extname]',
      },
    },
  },
});
