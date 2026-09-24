<script lang="ts">
  import { onMount } from "svelte";
  import {
    createExplorer,
    setExplorerContext,
    type Explorer,
    type ExplorerCell,
  } from "@rewyt-frontend/lib/explorer.svelte";
  import { MS_PER_DAY } from "@rewyt-frontend/lib/utils/dateUtils";
  import IntervalSlider from "@rewyt-frontend/lib/components/sliders/IntervalSlider.svelte";

  const depthDays = 7;

  const cell = { current: null } as unknown as ExplorerCell;
  setExplorerContext(cell);

  let explorer = $state<Explorer | null>(null);

  onMount(() => {
    const e = createExplorer({ depthHours: depthDays * 24, live: false });
    const now = Date.now();
    const start = now - depthDays * MS_PER_DAY;
    e.setStreamStartTime(start);
    e.setViewRange({ start, end: now });
    e.assignMark("A", start + 0.5 * (now - start));
    e.assignMark("B", now);
    cell.current = e;
    explorer = e;
    return () => {
      cell.current = null as unknown as Explorer;
      e.destroy();
    };
  });

  function formatIso(ms: number): string {
    return new Date(ms).toISOString().slice(0, 19) + "+00";
  }

  const aTime = $derived(formatIso(explorer?.marks.A ?? 0));
  const bTime = $derived(formatIso(explorer?.marks.B ?? 0));
</script>

<div class="mt-8 flex w-full flex-col items-center justify-center gap-4">
  <div
    class="relative top-[-14px] z-10 flex w-full items-center justify-center font-geist"
  >
    <div class="relative h-7 w-full select-none">
      <div
        class="absolute inset-0 rounded-full bg-neutral-200"
        style="background: repeating-linear-gradient(90deg, rgb(0 0 0 / 10%) 0%, rgb(0 0 0 / 2%) 92%, rgb(0 0 0 / 10%) 100%)"
      ></div>
      {#if explorer}
        <IntervalSlider />
      {/if}
    </div>
  </div>
  <div class="max-w-120">
    <span
      class="inline rounded-xl bg-neutral-200/50 box-decoration-clone px-2 py-1 font-mono text-sm font-medium"
      >$ ypb download -i {aTime}/{bTime} abcdefgh123</span
    >
  </div>
</div>
<div class="mt-8 flex flex-col gap-1">
  <p class="text-base">
    Or capture frames for a <a
      href="https://xymaxim.github.io/ypb/tutorials/timelapse/"
      class="font-medium text-[var(--color-interval-600)] underline hover:no-underline">time-lapse video</a
    >:
  </p>
  <div class="max-w-120">
    <span class="rounded-xl px-2 py-1 font-mono text-sm"
      >$ ypb capture timelapse -i {aTime}/{bTime} --every 10m abcdefgh123</span
    >
  </div>
</div>
