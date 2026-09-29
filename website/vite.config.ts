import { fileURLToPath } from "node:url";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, type Plugin } from "vite";

const REPO = "xymaxim/rewyt";

const SUFFIXES = {
  linux: "linux_x64",
  macos: "macos_universal",
  windows: "windows_x64",
} as const;

type GitHubRelease = {
  tag_name: string;
  published_at: string;
};

async function latestRelease(): Promise<GitHubRelease | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/releases/latest`,
      { headers },
    );
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as GitHubRelease;
  } catch (e) {
    if (process.env.CI) throw e;
    return null;
  }
}

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

const frontendLibRedirect: Plugin = {
  name: "rewyt-frontend-lib-redirect",
  enforce: "pre",
  resolveId(id, importer) {
    if (!importer) return;
    if (!importer.replace(/\\/g, "/").includes("/frontend/src/")) return;

    const mapped = redirect(id);
    if (!mapped) return;

    return this.resolve(mapped, importer, { skipSelf: true });
  },
};

export default defineConfig(async () => {
  const release = await latestRelease();
  const version = release ? release.tag_name.replace(/^v/, "") : "dev";
  const releaseDate = release
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(release.published_at))
    : "";

  const downloads = Object.fromEntries(
    Object.entries(SUFFIXES).map(([os, suffix]) => [
      os,
      release
        ? `https://github.com/${REPO}/releases/download/${release.tag_name}/Rewyt-${version}-${suffix}.zip`
        : `https://github.com/${REPO}/releases/latest`,
    ]),
  ) as Record<keyof typeof SUFFIXES, string>;

  return {
    define: {
      __REWYT_VERSION__: JSON.stringify(version),
      __REWYT_RELEASE_DATE__: JSON.stringify(releaseDate),
      __REWYT_DOWNLOADS__: JSON.stringify(downloads),
    },
    plugins: [frontendLibRedirect, tailwindcss(), sveltekit()],
    resolve: {
      dedupe: ["svelte", "bits-ui", "lucide-svelte"],
    },
    optimizeDeps: {
      include: ["lucide-svelte"],
    },
    ssr: {
      noExternal: ["lucide-svelte"],
    },
  };
});
