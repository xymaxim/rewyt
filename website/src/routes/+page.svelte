<script lang="ts">
  import { ArrowRight, Rewind, Play } from "lucide-svelte";
  import LandingPane from "/src/lib/components/LandingPane.svelte";

  let playing = $state(false);
  let rewinding = $state(false);
</script>

<div class="relative mt-8 flex justify-center">
  <LandingPane bind:playing bind:rewinding />
  <div
    class="pointer-events-none absolute inset-x-0 top-[-40px] bottom-0 flex flex-col items-center justify-center gap-0 transition sm:gap-2"
    class:opacity-0={rewinding || playing}
    class:scale-50={rewinding || playing}
  >
    <h1 class="mb-4 text-center text-3xl font-normal sm:text-5xl">
      <p>Rewind and play</p>
      <p>YouTube live streams</p>
    </h1>
    <p class="text-normal px-6 text-center">
      Rewyt is a desktop app for rewatching live streams beyond YouTube's limits
    </p>
  </div>
</div>

<div class="mt-12 flex flex-col items-center gap-4">
  <div class="flex items-center gap-4">
    <a
      href="https://xymaxim.github.io/rewyt/docs/guides/install/desktop.html"
      class="flex cursor-pointer items-center gap-1 rounded-2xl bg-neutral-200 px-4 py-2.5 text-sm font-semibold transition hover:scale-105 active:scale-95"
    >
      Download <ArrowRight />
    </a>
    <a
      href="https://xymaxim.github.io/rewyt/docs/quickstart.html"
      class="cursor-pointer rounded-2xl px-4 py-3 text-sm font-semibold transition hover:scale-105 active:scale-95"
      >Get Started</a
    >
  </div>
  <div class="flex flex-col items-center gap-2">
    <p class="text-sm">Available for Linux, macOS, and Windows</p>
    <p class="text-muted-foreground text-xs">
      Read <a
        href="https://xymaxim.github.io/rewyt/docs/disclaimer.html"
        class="text-foreground cursor-pointer font-medium">this</a
      > before using
    </p>
  </div>
</div>
