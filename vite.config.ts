import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  envDir: ".",
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [react(), tailwindcss()],
  build: {
    outDir: ".output/public",
    emptyOutDir: true,
  },
});
