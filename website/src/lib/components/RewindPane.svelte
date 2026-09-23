<script lang="ts">
  import { onMount } from "svelte";
  import {
    createExplorer,
    setExplorerContext,
    type Explorer,
    type ExplorerCell,
  } from "@rewyt-frontend/lib/explorer.svelte";
  import Timeline from "@rewyt-frontend/lib/components/Timeline.svelte";
  import TimelineZoomControl from "@rewyt-frontend/lib/components/TimelineZoomControl.svelte";
  import DaysSlider from "@rewyt-frontend/lib/components/sliders/DaysSlider.svelte";
  import DaySlider from "@rewyt-frontend/lib/components/sliders/DaySlider.svelte";
  import {
    getTickIntervals,
    zoomLevelForSpan,
    type TickIntervals,
    type TickIntervalResolver,
  } from "@rewyt-frontend/lib/utils/timelineUtils";
  import type { ZoomLevelKey } from "@rewyt-frontend/lib/types";
  import {
    MS_PER_HOUR,
    MS_PER_MINUTE,
    MS_PER_DAY,
  } from "@rewyt-frontend/lib/utils/dateUtils";
  import { formatLocalTime } from "$lib/time";
  import RewindTutorialPane from "$lib/components/RewindTutorialPane.svelte";

  const DEPTH_DAYS = 7;

  const compactBarWidth = 520;
  const compactTickIntervals: Record<ZoomLevelKey, TickIntervals> = {
    "10m": { minor: MS_PER_MINUTE, major: 2 * MS_PER_MINUTE },
    "1h": { minor: 5 * MS_PER_MINUTE, major: 15 * MS_PER_MINUTE },
    "2h": { minor: 15 * MS_PER_MINUTE, major: MS_PER_HOUR },
    "12h": { minor: MS_PER_HOUR, major: 3 * MS_PER_HOUR },
    "1d": { minor: 2 * MS_PER_HOUR, major: 4 * MS_PER_HOUR },
  };

  const resolveTickIntervals: TickIntervalResolver = (spanMs, barWidth) =>
    barWidth < compactBarWidth
      ? compactTickIntervals[zoomLevelForSpan(spanMs)]
      : getTickIntervals(spanMs);

  let { selected = $bindable(0) }: { selected?: number } = $props();

  const cell = { current: null } as unknown as ExplorerCell;
  setExplorerContext(cell);

  let explorer = $state<Explorer | null>(null);
  let lastRewindTarget = $state<number | null>(null);
  let lastRewindSource = $state<"timeline" | "button" | null>(null);
  let observedSelectedTime: number | null = null;

  onMount(() => {
    const e = createExplorer({ depthHours: DEPTH_DAYS * 24, live: false });
    const now = Date.now();
    e.setStreamStartTime(now - DEPTH_DAYS * MS_PER_DAY);
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

  $effect(() => {
    observedSelectedTime = explorer?.selectedTime ?? null;
  });

  const playheadLabel = $derived(
    explorer ? formatLocalTime(explorer.playheadTime ?? Date.now()) : "",
  );

  const isRewound = $derived(
    lastRewindTarget !== null &&
      explorer?.selectedTime != null &&
      lastRewindTarget === explorer.selectedTime,
  );

  async function handleRewind(isoTime: string): Promise<boolean> {
    if (!explorer) return false;
    const target = new Date(isoTime).getTime();
    lastRewindSource =
      explorer.selectedTime !== observedSelectedTime ? "timeline" : "button";
    explorer.setPlayheadTime(target);
    lastRewindTarget = target;
    return true;
  }
</script>

<div class="flex w-full flex-col items-center">
  <div
    class="text-muted-foreground flex w-full flex-col gap-2 font-medium sm:flex-row sm:items-center sm:justify-between"
  >
    <span class="flex items-center gap-1 tabular-nums">{playheadLabel}</span>
    {#if explorer}
      <TimelineZoomControl />
    {/if}
  </div>

  <div class="relative mt-2 w-full">
    {#if explorer}
      <Timeline
        seekableRange={null}
        mpdStartTime={0}
        {isRewound}
        onRewind={handleRewind}
        onSeekTo={() => {}}
        tickIntervals={resolveTickIntervals}
      />

      <div class="mt-1 mb-2 flex flex-col gap-2 md:flex-row">
        <div
          class="relative w-full rounded-2xl bg-neutral-200 px-[1rem] md:w-[60%]"
        >
          <DaysSlider />
        </div>
        <div
          class="relative w-full rounded-2xl bg-neutral-200 px-[1rem] md:w-[40%]"
        >
          <DaySlider />
        </div>
      </div>
    {/if}
  </div>

  {#if explorer}
    <RewindTutorialPane {explorer} {lastRewindSource} {lastRewindTarget} />
  {/if}
</div>
