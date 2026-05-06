<script lang="ts">
 import { Slider } from "bits-ui";
 import { getExplorerContext } from "$lib/explorer.svelte.js";
 import { MS_PER_MINUTE, MS_PER_HOUR } from "$lib/utils/dateUtils";
 import { useTimeSlider } from "$lib/components/sliders/useTimeSlider.svelte";
 import MinimapOverlay from "$lib/components/MinimapOverlay.svelte";
 import UnallowedMask from "$lib/components/sliders/UnallowedMask.svelte";
 import type { DayEntry } from "$lib/types";

  const explorer = getExplorerContext();

  const sliderStep = 10 * MS_PER_MINUTE;

  // ── Derived – full range (all days) ──────────────────────────────────────
  const minimapStart = $derived(explorer.days.at(-1)?.dayStart ?? 0);
  const minimapEnd = $derived(explorer.days.at(0)?.dayEnd ?? 0);
  const minimapSpan = $derived(minimapEnd - minimapStart);

  // ── Derived – allowed range ───────────────────────────────────────────────
  const allowedStart = $derived(explorer.availableRange?.start ?? minimapStart);
  const allowedEnd = $derived(explorer.availableRange?.end ?? minimapEnd);

  // ── Unallowed mask percents (relative to full minimap span) ───────────────
  const leftUnallowedPercent = $derived(
    minimapSpan > 0 ? ((allowedStart - minimapStart) / minimapSpan) * 100 : 0,
  );
  const rightUnallowedPercent = $derived(
    minimapSpan > 0 ? ((minimapEnd - allowedEnd) / minimapSpan) * 100 : 0,
  );

  // ── Hook: full minimap range for track, allowed range for clamping ────────
  const slider = useTimeSlider({
    getMin: () => minimapStart,
    getMax: () => minimapEnd,
    getFallback: () => allowedStart,
    clampToSpan: false,
  });

  let barEl = $state<HTMLDivElement | null>(null);
 $effect(() => {
     slider.setBarEl(barEl);
 });

   const thumbLabel = $derived.by<string>(() => {
    const shifted = new Date(slider.sliderValue + explorer.timezoneOffset * 60 * 1000);
    return String(shifted.getUTCDate());
   });

 // ── Derived – thumb fill: left→right based on time-of-day position ────────
 const thumbFillPercent = $derived.by<number>(() => {
     const vr = explorer.viewRange;
    if (!vr) return 0;
    const center = slider.sliderValue;
    const day =
      explorer.days.find((d) => center >= d.dayStart && center < d.dayEnd) ??
      explorer.days.find((d) => center === d.dayStart);
    if (!day) return 0;
    return ((center - day.dayStart) / (day.dayEnd - day.dayStart)) * 100;
  });

  const thumbStyle = $derived(
    `background: linear-gradient(to right, var(--rewyt-selected-600) ${thumbFillPercent}%, rgb(255 255 255 / 60%) ${thumbFillPercent}%);`,
  );

  // ── Day labels ────────────────────────────────────────────────────────────
  function toPixel(ts: number): number {
    if (minimapSpan === 0 || slider.barWidth === 0) return 0;
    return ((ts - minimapStart) / minimapSpan) * slider.barWidth;
  }

  const dayLabels = $derived.by(() => {
    let currentMonth = -1;
    const today = new Date(Date.now() + explorer.timezoneOffset * 60 * 1000);
    return [...explorer.days].reverse().map((day) => {
      const shifted = new Date(day.dayStart + explorer.timezoneOffset * 60 * 1000);
      const month = shifted.getUTCMonth();
      const isNewMonth = month !== currentMonth;
      currentMonth = month;
      const isToday = shifted.toDateString() === today.toDateString();
      const label = isToday
        ? "Today"
        : isNewMonth
          ? shifted.toLocaleString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
          : String(shifted.getUTCDate());
      return { day, label };
    });
  });
</script>

<div
  bind:this={barEl}
  class="relative h-9 w-full select-none"
>
  <!-- Day labels (z-0) -->
  {#each dayLabels as { day, label }}
      <span
          class="pointer-events-none absolute text-xs whitespace-nowrap text-muted-foreground font-medium overflow-visible!"
          style="left: {toPixel(day.dayStart + 12 * MS_PER_HOUR)}px; top: 50%; transform: translate(-50%, -50%);"
      >
      {label}
    </span>
  {/each}

  <!-- Minimap overlay: above labels, below thumb. 1px bleed top + bottom. -->
  <div class="pointer-events-none absolute inset-x-0 -top-px bottom-[-1px] z-20">
    <MinimapOverlay {minimapStart} {minimapEnd} barWidth={slider.barWidth} />
  </div>

  <!-- Unallowed region mask -->
  <UnallowedMask leftPercent={leftUnallowedPercent} rightPercent={rightUnallowedPercent} />

  <!-- Slider: full minimap width, value clamped to allowed range. -->
  <div class="pointer-events-none absolute inset-y-0 z-50" style="left: -10px; right: -10px;">
      <Slider.Root
          type="single"
          min={minimapStart}
          max={minimapEnd}
          step={sliderStep}
          bind:value={slider.sliderValue}
          onValueChange={(v) => {
                        const clamped = Math.min(Math.max(v, allowedStart), allowedEnd);
                        slider.onValueChange(clamped);
                        }}
          onpointerdown={slider.onPointerDown} 
          onpointerup={slider.onPointerUp}
      class="pointer-events-auto relative flex h-full w-full touch-none items-center"
    >
      <Slider.Track class="relative h-full w-full overflow-hidden rounded-full bg-transparent">
        <Slider.Range class="absolute h-full bg-transparent" />
      </Slider.Track>

      <Slider.Thumb
          index={0}
          class="block flex size-8 items-center bg-[var(--rewyt-selected-600)]! justify-center cursor-ew-resize rounded-full outline-none transition-opacity
                {slider.thumbHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}"
          style={thumbStyle}
      >
          <span class="pointer-events-none select-none text-sm font-bold text-foreground tracking-wide">
              {thumbLabel}
          </span>
      </Slider.Thumb>
    </Slider.Root>
  </div>
</div>
