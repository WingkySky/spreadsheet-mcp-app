/**
 * Vite 配置文件
 * 用于构建 Skybridge Web 前端
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { skybridge } from "skybridge/web";
import { resolve } from "path";

export default defineConfig({
  plugins: [skybridge() as any, react()],
  root: __dirname,
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist/assets",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "src/widgets/spreadsheet.tsx"),
      output: {
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]",
      },
    },
  },
});
