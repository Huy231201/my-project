import react from '@vitejs/plugin-react-swc';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import * as path from 'path';
import svgLoader from '@andylacko/vite-svg-react-loader';
import AutoImport from 'unplugin-auto-import/vite';
import vitePluginRequire from 'vite-plugin-require';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        format: 'es',
        strict: false,
        entryFileNames: '[name].js',
        dir: 'dist/',
      },
      external: [/^node:.*/],
    },
    emptyOutDir: false,
    outDir: 'build',
  },
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    svgLoader(),
    vitePluginRequire({}),
    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      include: [
        /\.[tj]sx?$/, // .js, .jsx
        /\.md$/, // .md
      ],
      imports: [
        {
          axios: [['default', 'http']],
          'react-i18next': ['useTranslation', 'initReactI18next'],
        },
      ],
      dts: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3001,
  },
});
