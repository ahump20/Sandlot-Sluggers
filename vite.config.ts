import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2020",
    sourcemap: true
  },
  server: {
    port: 5173,
    open: true
  },
  preview: {
    port: 4173
  },
  optimizeDeps: {
    include: ["@babylonjs/core", "@babylonjs/materials"]
  }
});
