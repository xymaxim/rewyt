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
    class="font-geist relative top-[-14px] z-10 flex w-full items-center justify-center"
  >
    <div class="relative h-7 w-full select-none">
      <div
        class="absolute inset-0 rounded-full"
        style="background: repeating-linear-gradient(90deg, rgb(0 0 0 / 20%) 0%, rgb(0 0 0 / 4%) 92%, rgb(0 0 0 / 20%) 100%)"
      ></div>
      {#if explorer}
        <IntervalSlider />
      {/if}
    </div>
  </div>
  <div class="max-w-120">
    <span
      class="inline rounded-full bg-[var(--color-interval-50)] box-decoration-clone px-2 py-1 font-mono font-medium"
      >$ ypb <a
        href="https://xymaxim.github.io/ypb/reference/cli/download/"
        class="font-bold text-[var(--color-interval-400)] hover:text-[var(--color-interval-300)]"
        >download</a
      >
      -i {aTime}/{bTime} abcdefgh123</span
    >
  </div>
</div>
<div class="mt-8 flex flex-col gap-1">
  <p class="text-lg">
    Or capture frames for a <a
      href="https://xymaxim.github.io/ypb/tutorials/timelapse/"
      class="rounded-2xl bg-[var(--color-interval)] box-decoration-clone px-1 font-medium text-white hover:bg-[var(--color-interval-light)] hover:text-black"
      >time-lapse</a
    >:
  </p>
  <div class="max-w-120">
    <span class="rounded-xl px-2 py-1 font-mono leading-snug font-medium"
      >$ ypb capture <a
        href="https://xymaxim.github.io/ypb/reference/cli/cli/#timelapse"
        class="font-bold text-[var(--color-interval-400)] hover:text-[var(--color-interval-300)]"
        >timelapse</a
      >
      -i {aTime}/{bTime} --every 10m abcdefgh123</span
    >
  </div>
</div>
