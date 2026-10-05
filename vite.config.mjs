import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const root = import.meta.dirname;

// Rutas relativas para el deploy en Vercel (base: './').
// Registramos las 3 páginas del sitio como entradas del build.
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        index: resolve(root, 'index.html'),
        aviso: resolve(root, 'aviso-de-privacidad.html'),
        terminos: resolve(root, 'terminos-y-condiciones.html'),
      },
    },
  },
});
