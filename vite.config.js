import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  return {
    server: {
      proxy: {
        '/api': {
          target: 'https://trendora-nine.vercel.app',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
        },
      },
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      sourcemap: isDev,
      minify: isDev ? false : 'esbuild',
      cssMinify: !isDev,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router', 'react-router-dom'],
            mui: [
              '@mui/material',
              '@mui/icons-material',
              '@mui/x-data-grid',
              '@mui/x-date-pickers',
              '@mui/x-tree-view',
              '@mui/x-charts',
            ],
            redux: ['@reduxjs/toolkit', 'react-redux'],
          },
        },
      },
      target: 'es2020',
      assetsInlineLimit: 4096,
    },
    esbuild: { jsx: "automatic", jsxImportSource: "react" },
    plugins: [
      react(),
      viteStaticCopy({
        targets: [
          { src: "./assets/*", dest: "assets" },
          {
            src: "./public/assets/{*,}",
            dest: path.join("dist", "public/assets"),
          },
          { src: "./assets/*", dest: path.join("dist", "assets") },
        ],
        silent: true,
      }),
    ],
    resolve: {},
    css: {
      postcss: './postcss.config.js',
    },
  };
});
