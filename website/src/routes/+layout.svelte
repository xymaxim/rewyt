<script lang="ts">
  import { resolve } from "$app/paths";
  import { Grape } from "lucide-svelte";
  import "../app.css";
  import favicon from "$lib/assets/favicon.svg";

  let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<main class="relative mx-auto min-h-dvh max-w-7xl overflow-hidden">
  <header
    class="relative z-10 mt-4 flex w-full max-w-screen-xl justify-between px-4"
  >
    <a href={resolve("/")} class="flex items-center font-bold">Rewyt</a>
    <nav class="flex items-center gap-6 text-sm font-medium">
      <a href={resolve("/picks")} class="flex items-center gap-2"
        ><Grape size={16} class="text-[var(--color-play-600)]" /> Live picks</a
      >
      <a href="https://xymaxim.github.io/rewyt/docs/">Docs</a>
      <a href="https://github.com/xymaxim/rewyt/">Source</a>
    </nav>
  </header>
  {@render children()}
</main>
