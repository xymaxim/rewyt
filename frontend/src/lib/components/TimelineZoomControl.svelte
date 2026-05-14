<script lang="ts">
  import { getExplorerContext } from "../explorer.svelte";
  import { ZOOM_LEVELS, type ZoomLevelKey } from "../types";

  const explorer = getExplorerContext();

  const zoomKeys = (Object.keys(ZOOM_LEVELS) as ZoomLevelKey[]).reverse();
  const zoomKey = $derived(
    (Object.entries(ZOOM_LEVELS).find(
      ([, v]) => v === explorer.zoomLevel,
    )?.[0] ?? "1d") as ZoomLevelKey,
  );
</script>

<div class="relative flex items-center justify-between">
  <div
    class="absolute h-6 w-full bg-neutral-200"
    style="clip-path: polygon(2% 50%, 98% 0%, 98% 100%);"
  />
  {#each zoomKeys.toReversed() as key}
    <button
      class="z-20 flex w-8 items-center justify-center rounded-full text-xs tracking-wider transition-all outline-none hover:scale-110"
      class:font-medium={zoomKey !== key}
      class:font-extrabold={zoomKey === key}
      class:text-foreground={zoomKey === key}
      class:cursor-default!={zoomKey === key}
      class:scale-110={zoomKey === key}
      style="margin-left: {ZOOM_LEVELS[key] / 1000000 / 5}px"
      onclick={() => explorer.setZoom(ZOOM_LEVELS[key])}
    >
      {key}
    </button>
  {/each}
</div>
