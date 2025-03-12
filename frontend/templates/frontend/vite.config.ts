import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/AstroTerra/" : "/", // Set base for GitHub Pages
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
}));
