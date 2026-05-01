import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";

// Read SEO JSON to inject into HTML
const seoData = JSON.parse(fs.readFileSync('./src/constants/seo.json', 'utf-8'));

const htmlPlugin = () => {
  return {
    name: 'html-transform',
    transformIndexHtml(html: string) {
      return html.replace(/%BASE_URL%/g, seoData.global.baseUrl);
    },
  };
};

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    hmr: {
      overlay: true,
      protocol: "ws",
      host: "localhost",
      timeout: 5000,
      clientPort: 3000,
    },
    force: true,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    strictPort: true,
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  },
  plugins: [react(), htmlPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["firebase"],
  },
  build: {
    sourcemap: true,
    cache: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
      external: ["firebase"],
    },
  },
  optimizeDeps: {
    force: true,
    include: [
      "react", 
      "react-dom", 
      "vaul",
      "@radix-ui/react-dialog",
      "framer-motion",
      "zustand",
      "react-router-dom"
    ],
    exclude: ["@vite/client", "@vite/env", "firebase"],
  },
  css: {
    devSourcemap: true,
  },
}));
