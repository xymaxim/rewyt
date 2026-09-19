<script lang="ts">
  import { onMount } from "svelte";
  import {
    createExplorer,
    setExplorerContext,
    type Explorer,
    type ExplorerCell,
  } from "@rewyt-frontend/lib/explorer.svelte";
  import Timeline from "@rewyt-frontend/lib/components/Timeline.svelte";
  import { formatLocalTime } from "$lib/time";

  const DAY_MS = 24 * 60 * 60 * 1000;
  const DEPTH_DAYS = 7;

  let { selected = $bindable(0) }: { selected?: number } = $props();

  const cell = { current: null } as unknown as ExplorerCell;
  setExplorerContext(cell);

  let explorer = $state<Explorer | null>(null);
  let lastRewindTarget = $state<number | null>(null);

  onMount(() => {
    const e = createExplorer({ depthHours: DEPTH_DAYS * 24 });
    const now = Date.now();
    e.setStreamStartTime(now - DEPTH_DAYS * DAY_MS);
    e.setSelectedTime(now);
    e.setPlayheadTime(now);
    cell.current = e;
    explorer = e;
    return () => {
      cell.current = null as unknown as Explorer;
      e.destroy();
    };
  });

  $effect(() => {
    if (explorer) selected = explorer.selectedTime ?? 0;
  });

  const playheadLabel = $derived(
    explorer ? formatLocalTime(explorer.playheadTime ?? Date.now()) : "",
  );
  const selectedLabel = $derived(
    explorer ? formatLocalTime(explorer.selectedTime ?? Date.now()) : "",
  );

  const isRewound = $derived(
    lastRewindTarget !== null &&
      explorer?.selectedTime != null &&
      lastRewindTarget === explorer.selectedTime,
  );

  async function handleRewind(isoTime: string): Promise<boolean> {
    if (!explorer) return false;
    const target = new Date(isoTime).getTime();
    explorer.setPlayheadTime(target);
    lastRewindTarget = target;
    return true;
  }
</script>

<div class="flex w-full flex-col items-center">
  <div
    class="text-muted-foreground flex w-full flex-col justify-start gap-0 font-medium md:flex-row md:gap-8"
  >
    <span
      class="flex items-center gap-1 tabular-nums {selectedLabel !=
      playheadLabel
        ? 'opacity-50'
        : ''} transition-opacity"
      >{playheadLabel}</span
    >
    <span
      class:opacity-0={selectedLabel == playheadLabel}
      class="flex items-center gap-1 tabular-nums transition-opacity"
      ><span class="inline-block size-2.5 rounded-full bg-[#d0e758]"
      ></span>{selectedLabel}</span
    >
  </div>

  <div class="mt-2 w-full">
    {#if explorer}
      <Timeline
        seekableRange={null}
        mpdStartTime={0}
        {isRewound}
        onRewind={handleRewind}
        onSeekTo={() => {}}
      />
    {/if}
  </div>
</div>
