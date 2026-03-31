import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const normalizeBasePath = (value?: string): string => {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) {
    return '/';
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
};

export default defineConfig(() => {
  const base = normalizeBasePath(process.env.VITE_BASE_PATH);

  return {
    base,
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    build: {
      rollupOptions: {
        input: {
          home: path.resolve(__dirname, 'index.html'),
          gallery: path.resolve(__dirname, 'gallery/index.html'),
          about: path.resolve(__dirname, 'about/index.html'),
          visionsOfLight: path.resolve(__dirname, 'gallery/visions-of-light/index.html'),
          neonDystopia: path.resolve(__dirname, 'gallery/neon-dystopia/index.html'),
          silentMonoliths: path.resolve(__dirname, 'gallery/silent-monoliths/index.html'),
          artOfWar: path.resolve(__dirname, 'gallery/art-of-war/index.html'),
          artOfAnime: path.resolve(__dirname, 'gallery/art-of-anime/index.html')
        }
      }
    },
    plugins: [tailwindcss(), react()],
  };
});
