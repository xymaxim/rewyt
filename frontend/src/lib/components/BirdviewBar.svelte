<script lang="ts">
 import { Slider } from "bits-ui";
 import { getExplorerContext } from "../explorer.svelte.js";
 import { MS_PER_MINUTE, MS_PER_HOUR } from "../utils/dateUtils";
 import { useTimeSlider } from "../hooks/useTimeSlider.svelte";
 import MinimapOverlay from "./MinimapOverlay.svelte";
 import type { DayEntry } from "../types";

 const explorer = getExplorerContext();

 const sliderStep = 10 * MS_PER_MINUTE;
 
 // ── Derived – minimap span (full days range) ─────────────────────────────────
 const minimapStart = $derived(explorer.days.at(-1)?.dayStart ?? 0);
 const minimapEnd = $derived(explorer.days.at(0)?.dayEnd ?? 0);

 // ── Derived – allowed range (slider bounds) ──────────────────────────────────
 const allowedStart = $derived(explorer.availableRange?.start ?? minimapStart);
 const allowedEnd = $derived(explorer.availableRange?.end ?? minimapEnd);

 const fullRangeStart = $derived(Math.min(allowedStart, minimapStart));
 const fullRangeEnd = $derived(Math.max(allowedEnd, minimapEnd));

 // Slider wrapper is positioned absolutely over the allowed range only.
 // Offset by half thumb width (10px for w-5) so click point aligns with center.
 const allowedStartPercent = $derived(
     ((allowedStart - fullRangeStart) / (fullRangeEnd - fullRangeStart)) * 100,
 );
 const allowedEndPercent = $derived(
     ((allowedEnd - fullRangeStart) / (fullRangeEnd - fullRangeStart)) * 100,
 );

 // ── Hook ─────────────────────────────────────────────────────────────────────
 const slider = useTimeSlider({
     getMin: () => allowedStart,
     getMax: () => allowedEnd,
     getFallback: () => allowedStart,
     clampToSpan: false,
 });

 let barEl = $state<HTMLDivElement | null>(null);
 $effect(() => {
     slider.setBarEl(barEl);
 });

 
 // ── Derived – thumb fill: left→right based on time-of-day position ───────────
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
     `background: linear-gradient(to right, var(--color-view) ${thumbFillPercent-5}%, rgba(255 255 255 / 50%) ${thumbFillPercent+5}%);`,
 );

 // ── Day label helpers ────────────────────────────────────────────────────────
 const minimapSpan = $derived(minimapEnd - minimapStart);

 function toPixel(ts: number): number {
     if (minimapSpan === 0 || slider.barWidth === 0) return 0;
     return ((ts - minimapStart) / minimapSpan) * slider.barWidth;
 }

 function formatLabel(day: DayEntry): string {
     const off = explorer.timezoneOffset;
     const nowShifted = new Date(Date.now() + off * 60 * 1000);
     const dayShifted = new Date(day.dayStart + off * 60 * 1000);
     const isToday =
         nowShifted.getUTCFullYear() === dayShifted.getUTCFullYear() &&
         nowShifted.getUTCMonth() === dayShifted.getUTCMonth() &&
         nowShifted.getUTCDate() === dayShifted.getUTCDate();
     if (isToday) return "Today";
     return dayShifted.toLocaleString("en-US", {
         month: "short",
         day: "numeric",
         timeZone: "UTC",
     });
 }
</script>

<!--
     BirdviewBar (OverviewSlider)
     ┌─────────────────────────────────────────────────────┐
     │  [day labels across full width]             z-0     │
     │  [minimap overlay: interval + playhead]     z-20    │
     │  [slider: transparent track, filled pill]   z-50    │
     └─────────────────────────────────────────────────────┘
     Height h-9 (36px). Minimap bleeds 1px above + below.
-->
<div
    bind:this={barEl}
    class="relative h-9 w-full select-none overflow-visible"
>
    <!-- Day labels (z-0) -->
    {#each explorer.days as day}
        <span
            class="pointer-events-none absolute z-0 text-xs font-medium whitespace-nowrap text-muted-foreground"
            style="left: {toPixel(day.dayStart + 12 * MS_PER_HOUR)}px; top: 50%; transform: translate(-50%, -50%);"
        >
            {formatLabel(day)}
        </span>
    {/each}

    <!-- Minimap overlay: above labels, below thumb. 1px bleed top + bottom. -->
    <div class="pointer-events-none absolute inset-x-0 -top-px bottom-[-1px] z-20">
        <MinimapOverlay {minimapStart} {minimapEnd} barWidth={slider.barWidth} />
    </div>

    <!-- Slider: over allowed range only. Offset by half thumb width (10px). -->
    <div
        class="pointer-events-none absolute inset-y-0 z-50"
        style="left: calc({allowedStartPercent}% - 10px); width: calc({allowedEndPercent - allowedStartPercent}% + 20px);"
    >
        <Slider.Root
            bind:value={slider.sliderValue}
            type="single"
            min={allowedStart}
            max={allowedEnd}
            step={sliderStep}
            onValueChange={slider.onValueChange}
            onpointerdown={slider.onPointerDown}
            onpointerup={slider.onPointerUp}
            class="pointer-events-auto relative flex h-full w-full touch-none items-center"
        >
            <Slider.Track class="relative h-full w-full overflow-hidden rounded-full bg-transparent">
                <Slider.Range class="absolute h-full bg-transparent" />
            </Slider.Track>

            <!-- Thumb: pill filled left→right by time-of-day. No shadow. -->
            <Slider.Thumb
                index={0}
                class="block size-8 cursor-ew-resize rounded-full items-center justify-center flex outline-none transition-opacity
                      bg-[var(--color-view)]!
                      {slider.thumbHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}"
                style={thumbStyle}
            >
                <span class="text-xs font-semibold">24</span>
            </Slider.Thumb>
             
        </Slider.Root>
    </div>
</div>
