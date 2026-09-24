<script lang="ts">
  import { onMount } from "svelte";
  import { X, ArrowRight } from "lucide-svelte";
  import { Popover } from "bits-ui";
  import InputRewindButton from "@rewyt-frontend/lib/components/InputRewindButton.svelte";
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
  import {
    formatISOString,
    parseTimestamp,
  } from "@rewyt-frontend/lib/utils/dateTimeUtils";
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
  let lastRewindSource = $state<"timeline" | "button" | "input" | null>(null);
  let observedSelectedTime: number | null = null;
  let tourFocus = $state<TourFocus[] | null>(null);
  let isTourOpen = $state(false);
  let isTimeInputOpen = $state(false);
  let timeInput = $state("");
  let timeInputInvalid = $state(false);
  let playheadRowEl: HTMLElement | undefined = $state();

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

  $effect(() => {
    if (isTimeInputOpen && explorer) {
      timeInput = formatISOString(
        explorer.selectedTime ?? explorer.playheadTime ?? Date.now(),
        explorer.timezoneOffset,
      );
      timeInputInvalid = false;
    }
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

  function submitTimeInput() {
    if (!explorer) return;
    const target = parseTimestamp(timeInput);
    if (target === null) {
      timeInputInvalid = true;
      return;
    }
    lastRewindSource = "input";
    explorer.setSelectedTime(target);
    explorer.setPlayheadTime(target);
    lastRewindTarget = target;
    isTimeInputOpen = false;
  }
</script>

<div class="flex w-full flex-col items-center">
  <div
    class="flex flex-col items-center self-stretch rounded-2xl px-4 transition-colors"
    class:bg-amber-100={isTourOpen}
    class:px-8={isTourOpen}
    class:py-4={isTourOpen}
    class:-mx-4={isTourOpen}
    class:-my-4={isTourOpen}
  >
    <div
      bind:this={playheadRowEl}
      class="text-muted-foreground flex w-full scroll-mt-4 flex-col gap-2 font-medium sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex items-center gap-8">
        <span class="font-geist flex items-center gap-1 tabular-nums"
          >{playheadLabel}</span
        >
        {#if explorer}
          <div
            class="transition-opacity duration-200"
            class:opacity-20={isDimmed("timeInput")}
            class:pointer-events-none={isDimmed("timeInput")}
            inert={isDimmed("timeInput")}
          >
            <Popover.Root bind:open={isTimeInputOpen}>
              <Popover.Trigger>
                {#snippet child({ props })}
                  <InputRewindButton
                    {...props}
                    size={36}
                    aria-label="Input and rewind"
                  />
                {/snippet}
              </Popover.Trigger>
              <Popover.Content
                side="bottom"
                align="start"
                sideOffset={8}
                class="z-100 w-72 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-lg"
              >
                <input
                  bind:value={timeInput}
                  onkeydown={(e) => {
                    if (e.key === "Enter") submitTimeInput();
                  }}
                  placeholder="YYYY-MM-DDTHH:MM:SS+00:00"
                  class="font-geist h-10 w-full rounded-xl border-1 px-3 text-sm outline-none"
                  class:border-2={timeInputInvalid}
                  class:border-red-400={timeInputInvalid}
                  class:border-neutral-300={!timeInputInvalid}
                />
                <button
                  type="button"
                  class="font-geist mt-2 h-10 w-full rounded-xl bg-[var(--color-selected)] px-3 text-sm font-semibold hover:cursor-pointer hover:bg-[var(--color-selected-light)]"
                  onclick={submitTimeInput}
                >
                  Rewind
                </button>
              </Popover.Content>
            </Popover.Root>
          </div>
        {/if}
      </div>
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
  </div>

  {#if explorer}
    <div class="mt-10 flex w-full flex-col items-start">
      <button
        type="button"
        class="group flex w-full items-center gap-6 text-left hover:cursor-pointer"
        onclick={() => {
          isTourOpen = !isTourOpen;
          if (isTourOpen) {
            playheadRowEl?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          } else {
            tourFocus = null;
          }
        }}
      >
        <div
          class="flex h-11 w-13 shrink-0 items-center justify-center rounded-full bg-[var(--color-selected)] group-hover:bg-[var(--color-selected-dark)]"
        >
          {#if isTourOpen}
            <X
              size={28}
              class="shrink-0 text-[var(--color-selected-darkest)]"
            />
          {:else}
            <ArrowRight
              size={28}
              class="shrink-0 text-[var(--color-selected-darkest)]"
            />
          {/if}
        </div>
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
      </button>

      {#if isTourOpen}
        <RewindTourPane
          {explorer}
          {lastRewindSource}
          {lastRewindTarget}
          {isTimeInputOpen}
          onFocusChange={handleFocusChange}
        />
      {/if}
    </div>
  {/if}
</div>
