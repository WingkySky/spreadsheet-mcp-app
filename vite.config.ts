/**
 * Vite 配置文件
 * 用于打包 UI 前端资源
 */

import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist/ui",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "ui/editor.html"),
      output: {
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
});
