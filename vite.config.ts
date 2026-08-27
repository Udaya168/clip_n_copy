import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  envDir: ".",
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  build: {
    outDir: ".output/public",
    emptyOutDir: true,
  },
});
