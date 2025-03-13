import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "./", // Using relative paths
  server: {
    host: "0.0.0.0", // Allows access from local network
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" ? componentTagger() : null, 
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"), // Your actual root file
      },
    },
  },
}));