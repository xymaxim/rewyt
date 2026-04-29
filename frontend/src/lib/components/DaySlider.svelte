<script lang="ts">
  import { Slider } from "bits-ui";
  import { getExplorerContext } from "../explorer.svelte.js";
  import { MS_PER_MINUTE, MS_PER_HOUR } from "../utils/dateUtils";
  import { findDay } from "../utils/timelineUtils";
  import { useTimeSlider } from "../hooks/useTimeSlider.svelte";
  import MinimapOverlay from "./MinimapOverlay.svelte";

  interface Props {
    /** Tick interval in hours (default 3). */
    tickStepHours?: number;
  }

  const { tickStepHours = 4 }: Props = $props();

  const explorer = getExplorerContext();

  const sliderStep = 5 * MS_PER_MINUTE;

  // ── Derived – current day bounds (slider spans midnight → midnight) ───────────
  const currentDay = $derived.by(() => {
    const vr = explorer.viewRange;
    if (!vr) return explorer.days[0] ?? null;
    const center = (vr.start + vr.end) / 2;
    return findDay(center, explorer.days) ?? explorer.days[0] ?? null;
  });

  const dayStart = $derived(currentDay?.dayStart ?? 0);
  const dayEnd = $derived(currentDay?.dayEnd ?? dayStart + 24 * MS_PER_HOUR);
  const daySpan = $derived(dayEnd - dayStart);

  // ── Hook ─────────────────────────────────────────────────────────────────────
  const slider = useTimeSlider({
    getMin: () => dayStart,
    getMax: () => dayEnd,
    getFallback: () => dayStart + 12 * MS_PER_HOUR,
    clampToSpan: true,
  });

 let barEl = $state<HTMLDivElement | null>(null);
 $effect(() => {
     slider.setBarEl(barEl);
 });

  // ── Derived – thumb label: local hour of the slider center ───────────────────
  const thumbLabel = $derived.by<string>(() => {
    const shifted = new Date(slider.sliderValue + explorer.timezoneOffset * 60 * 1000);
    const hour = shifted.getUTCHours();
    // sliderValue can reach dayEnd (next midnight = 0h) at the right edge — cap at 23.
    const cappedHour = hour === 0 && slider.sliderValue >= dayEnd - 1 ? 23 : hour
    return `${cappedHour}h`;
  });

  // ── Derived – hour tick marks ─────────────────────────────────────────────────
  const hourTicks = $derived.by<{ ts: number; px: number; label: string }[]>(() => {
    if (daySpan === 0 || slider.barWidth === 0) return [];
    const stepMs = tickStepHours * MS_PER_HOUR;
    const ticks: { ts: number; px: number; label: string }[] = [];
    let ts = dayStart;
    while (ts < dayEnd) {
      const px = ((ts - dayStart) / daySpan) * slider.barWidth;
      const shifted = new Date(ts + explorer.timezoneOffset * 60 * 1000);
      ticks.push({ ts, px, label: `${shifted.getUTCHours()}h` });
      ts += stepMs;
    }
    return ticks;
  });
</script>

<div
  bind:this={barEl}
  class="relative h-9 w-full select-none overflow-visible"
>
  <!-- Hour tick labels (z-0) -->
  {#each hourTicks as tick}
    <span
      class="pointer-events-none absolute z-0 text-xs whitespace-nowrap text-muted-foreground"
      style="left: {tick.px}px; top: 50%; transform: translate(-50%, -50%);"
    >
      {tick.label}
    </span>
  {/each}

  <!-- Minimap overlay: above labels, below thumb. 1px bleed top + bottom. -->
  <div class="pointer-events-none absolute inset-x-0 -top-px bottom-[-1px] z-20">
    <MinimapOverlay minimapStart={dayStart} minimapEnd={dayEnd} barWidth={slider.barWidth} />
  </div>

  <!-- Slider: full day width. Offset by half thumb width (18px for w-9). -->
  <div class="pointer-events-none absolute inset-y-0 z-50" style="left: -18px; right: -18px;">
    <Slider.Root
      bind:value={slider.sliderValue}
      type="single"
      min={dayStart}
      max={dayEnd}
      step={sliderStep}
      onValueChange={slider.onValueChange}
      onpointerdown={slider.onPointerDown}
      onpointerup={slider.onPointerUp}
      class="pointer-events-auto relative flex h-full w-full touch-none items-center"
    >
      <Slider.Track class="relative h-full w-full overflow-hidden rounded-full bg-transparent">
        <Slider.Range class="absolute h-full bg-transparent" />
      </Slider.Track>

      <Slider.Thumb
        index={0}
        class="relative flex h-9 w-9 cursor-ew-resize items-center justify-center
               rounded-full bg-[var(--color-view)] outline-none transition-opacity
               {slider.thumbHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}"
      >
        <span class="pointer-events-none select-none text-xs font-semibold text-neutral-800 leading-none">
          {thumbLabel}
        </span>
      </Slider.Thumb>
    </Slider.Root>
  </div>
</div>