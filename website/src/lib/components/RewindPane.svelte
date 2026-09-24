<script lang="ts">
  import { onMount } from "svelte";
  import { ArrowLeft, ArrowRight } from "lucide-svelte";
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
  import RewindTourPane, {
    type TourFocus,
  } from "$lib/components/RewindTourPane.svelte";

  const depthDays = 7;

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
  let tourFocus = $state<TourFocus[] | null>(null);
  let isTourOpen = $state(false);

  const isDimmed = (key: TourFocus) =>
    tourFocus !== null && !tourFocus.includes(key);

  function handleFocusChange(focus: TourFocus[] | null) {
    tourFocus = focus;
  }

  onMount(() => {
    const e = createExplorer({ depthHours: depthDays * 24, live: false });
    const now = Date.now();
    e.setStreamStartTime(now - depthDays * MS_PER_DAY);
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
    <span class="flex items-center gap-1 font-geist tabular-nums">{playheadLabel}</span>
    {#if explorer}
      <div
        class="font-geist transition-opacity duration-200"
        class:opacity-20={isDimmed("zoom")}
        class:pointer-events-none={isDimmed("zoom")}
        inert={isDimmed("zoom")}
      >
        <TimelineZoomControl />
      </div>
    {/if}
  </div>

  <div class="font-geist relative mt-2 w-full">
    {#if explorer}
      <div
        class="transition-opacity duration-200"
        class:opacity-20={isDimmed("timeline")}
        class:pointer-events-none={isDimmed("timeline")}
        inert={isDimmed("timeline")}
      >
        <Timeline
          seekableRange={null}
          mpdStartTime={0}
          {isRewound}
          onRewind={handleRewind}
          onSeekTo={() => {}}
          tickIntervals={resolveTickIntervals}
        />
      </div>

      <div class="mt-1 mb-2 flex flex-col gap-2">
        <div
          class="relative w-full rounded-2xl bg-neutral-200 px-[1rem] transition-opacity duration-200"
          class:opacity-20={isDimmed("daysSlider")}
          class:pointer-events-none={isDimmed("daysSlider")}
          inert={isDimmed("daysSlider")}
        >
          <DaysSlider />
        </div>
        <div
          class="relative w-full rounded-2xl bg-neutral-200 px-[1rem] transition-opacity duration-200"
          class:opacity-20={isDimmed("daySlider")}
          class:pointer-events-none={isDimmed("daySlider")}
          inert={isDimmed("daySlider")}
        >
          <DaySlider />
        </div>
      </div>
    {/if}
  </div>

  {#if explorer}
    <div class="mt-10 flex w-full flex-col items-start">
      <button
        type="button"
        class="flex w-full items-center justify-between gap-2 text-left hover:cursor-pointer"
        onclick={() => {
          isTourOpen = !isTourOpen;
          if (!isTourOpen) tourFocus = null;
        }}
      >
        <span class="flex flex-col items-start">
          <span
            class="text-lg font-semibold text-[var(--color-selected-darker)]"
          >
            {isTourOpen ? "Hide the tour" : "Take the tour"}
          </span>
          <span class="text-muted-foreground">
            Learn how to rewind and jump through the timeline
          </span>
        </span>
        {#if isTourOpen}
          <ArrowLeft size={28} class="shrink-0" />
        {:else}
          <ArrowRight size={28} class="shrink-0" />
        {/if}
      </button>

      {#if isTourOpen}
        <RewindTourPane
          {explorer}
          {lastRewindSource}
          {lastRewindTarget}
          onFocusChange={handleFocusChange}
        />
      {/if}
    </div>
  {/if}
</div>
