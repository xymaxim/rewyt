<script lang="ts">
  import { resolve } from "$app/paths";
  import { ArrowUpRight } from "lucide-svelte";
  import "../app.css";
  import favicon from "$lib/assets/favicon.svg";
  import logo from "$lib/assets/logo.svg";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href="/favicon.ico" sizes="32x32" />
  <link rel="icon" href={favicon} type="image/svg+xml" />
</svelte:head>

<main class="relative mx-auto min-h-dvh max-w-6xl overflow-hidden">
  <header
    class="relative z-10 mt-4 flex w-full max-w-screen-xl flex-col gap-2 px-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <a href={resolve("/")} class="flex items-center gap-2 text-lg font-extrabold"
      ><img src={logo} alt="" class="h-10 w-auto" />rewyt</a
    >
    <nav class="flex items-center gap-4 font-medium">
      <a href={resolve("/picks")} class="flex items-center"
        >Live picks</a
      >
      <a href="https://xymaxim.github.io/rewyt/docs/" class="flex items-center gap-1"
        ><ArrowUpRight size={16} />Docs</a
      >
      <a href="https://github.com/xymaxim/rewyt/" class="flex items-center gap-1"
        ><ArrowUpRight size={16} />Source</a
      >
    </nav>
  </header>
  {@render children()}
</main>
