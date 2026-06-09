import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import wails from "@wailsio/runtime/plugins/vite";
import path from "path";

export default defineConfig({
  plugins: [svelte(), tailwindcss(), wails("./bindings")],
  resolve: {
    alias: {
      $lib: path.resolve("./src/lib"),
    },
  },
  server: {
    proxy: {
      "/info": "http://localhost:8080",
      "/mpd": "http://localhost:8080",
      "/segments": "http://localhost:8080",
    },
    host: "127.0.0.1",
    port: 9245,
    strictPort: true,
  },
});
