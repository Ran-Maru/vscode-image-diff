import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const csp =
  "default-src 'self'; img-src 'self' blob: data:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'none'; object-src 'none'; base-uri 'self'";

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/vscode-image-diff/' : '/',
  plugins: [
    react(),
    {
      name: 'production-csp',
      transformIndexHtml(html, ctx) {
        if (ctx.server) {
          return html;
        }
        return html.replace(
          '<head>',
          `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`,
        );
      },
    },
  ],
});
