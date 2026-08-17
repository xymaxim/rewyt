<script lang="ts">
  import { getExplorerContext } from "../explorer.svelte";
  import { ZOOM_LEVELS, type ZoomLevelKey } from "../types";

  interface Props {
    onChange?: () => void;
  }

  const { onChange }: Props = $props();

  const explorer = getExplorerContext();

  const zoomKeys = (Object.keys(ZOOM_LEVELS) as ZoomLevelKey[]).reverse();
  const zoomKey = $derived(
    (Object.entries(ZOOM_LEVELS).find(
      ([, v]) => v === explorer.zoomLevel,
    )?.[0] ?? "1d") as ZoomLevelKey,
  );

  function handleZoomChange(key: ZoomLevelKey) {
    explorer.setZoom(ZOOM_LEVELS[key]);
    onChange?.();
  }
</script>

<div class="relative flex items-center justify-between">
  <div
    class="absolute h-8 w-full bg-neutral-200"
    style="clip-path: polygon(0% 50%, 100% 0%, 100% 100%);"
  />
  <div class="flex gap-3 px-2">
    {#each zoomKeys.toReversed() as key}
      <button
        class="z-20 flex h-7 w-8 items-center justify-center rounded-full text-xs tracking-wider transition-none outline-none"
        class:font-medium={zoomKey !== key}
        class:font-extrabold={zoomKey === key}
        class:text-white={zoomKey === key}
        class:bg-neutral-700={zoomKey === key}
        class:cursor-default!={zoomKey === key}
        class:-rotate-30={zoomKey === key}
        style="margin-left: 0px"
        onclick={() => handleZoomChange(key)}
      >
        {key}
      </button>
    {/each}
  </div>
</div>
