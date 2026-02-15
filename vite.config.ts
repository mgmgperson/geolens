import { defineConfig } from "vite";
import { resolve } from "path";
import { mkdirSync, copyFileSync, rmSync } from "fs";

function copyAssetsPlugin() {
  return {
    name: "copy-assets",
    buildStart() {
      rmSync(resolve(__dirname, "build"), { recursive: true, force: true });
    },
    closeBundle() {
      const outAssetsDir = resolve(__dirname, "build/assets");
      mkdirSync(outAssetsDir, { recursive: true });

      copyFileSync(
        resolve(__dirname, "src/assets/geolens_countries.json"),
        resolve(outAssetsDir, "geolens_countries.json")
      );

      copyFileSync(
        resolve(__dirname, "src/assets/geolens.png"),
        resolve(outAssetsDir, "geolens.png")
      );
    }
  };
}

export default defineConfig({
  build: {
    outDir: "build",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/extension/content.ts")
      },
      output: {
        entryFileNames: "[name].js"
      }
    }
  },
  plugins: [copyAssetsPlugin()]
});
