import { fileURLToPath } from "node:url";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

const frontendLib = fileURLToPath(
  new URL("../frontend/src/lib", import.meta.url),
);
const websiteLib = fileURLToPath(new URL("src/lib", import.meta.url));

function redirect(id: string): string | null {
  const normalizedId = id.replace(/\\/g, "/");
  const normalizedWebsiteLib = websiteLib.replace(/\\/g, "/");

  if (
    normalizedId === normalizedWebsiteLib ||
    normalizedId.startsWith(normalizedWebsiteLib + "/")
  ) {
    return frontendLib + normalizedId.slice(normalizedWebsiteLib.length);
  }
  if (id === "$lib") return frontendLib;
  if (id.startsWith("$lib/")) return path.join(frontendLib, id.slice(5));
  return null;
}

export default defineConfig({
  plugins: [
    {
      name: "rewyt-frontend-lib-redirect",
      enforce: "pre",
      resolveId(id, importer) {
        if (!importer) return;
        if (!importer.replace(/\\/g, "/").includes("/frontend/src/")) return;

        const mapped = redirect(id);
        if (!mapped) return;

        return this.resolve(mapped, importer, { skipSelf: true });
      },
    },
    tailwindcss(),
    sveltekit(),
  ],
  resolve: {
    dedupe: ["svelte", "bits-ui", "lucide-svelte"],
  },
  optimizeDeps: {
    include: ["lucide-svelte"],
  },
  ssr: {
    noExternal: ["lucide-svelte"],
  },
});
