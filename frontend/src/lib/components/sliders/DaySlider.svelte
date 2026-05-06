<script lang="ts">
 import { Slider } from "bits-ui";
 import { getExplorerContext } from "$lib/explorer.svelte.js";
 import { MS_PER_MINUTE, MS_PER_HOUR } from "$lib/utils/dateUtils";
 import { findDay } from "$lib/utils/timelineUtils";
 import { useTimeSlider } from "$lib/components/sliders/useTimeSlider.svelte";
 import MinimapOverlay from "$lib/components/MinimapOverlay.svelte";
 import UnallowedMask from "$lib/components/sliders/UnallowedMask.svelte";

 interface Props {
     tickStepHours?: number;
 }

 const { tickStepHours = 4 }: Props = $props();

 const explorer = getExplorerContext();

 // const sliderStep = MS_PER_MINUTE;


 const currentDay = $derived.by(() => {
     const vr = explorer.viewRange;
     if (!vr) return explorer.days[0] ?? null;
     const center = (vr.start + vr.end) / 2;
     return findDay(center, explorer.days) ?? explorer.days[0] ?? null;
 });

 const dayStart = $derived(currentDay?.dayStart ?? 0);
 const dayEnd = $derived(currentDay?.dayEnd ?? dayStart + 24 * MS_PER_HOUR);
 const daySpan = $derived(dayEnd - dayStart);


 const spanMs = $derived(explorer.viewRange.end - explorer.viewRange.start);
 const sliderStep = $derived.by(() => {
     if (slider.barWidth === 0) return 1000;
     return Math.round(spanMs / slider.barWidth / 1000) * 1000;
 }
 );

 const allowedStart = $derived(
     Math.max(dayStart, explorer.availableRange?.start ?? dayStart),
 );
 const allowedEnd = $derived(
     Math.min(dayEnd, explorer.availableRange?.end ?? dayEnd),
 );

 const leftUnallowedPercent = $derived(
     daySpan > 0 ? ((allowedStart - dayStart) / daySpan) * 100 : 0,
 );
 const rightUnallowedPercent = $derived(
     daySpan > 0 ? ((dayEnd - allowedEnd) / daySpan) * 100 : 0,
 );

 const slider = useTimeSlider({
     getMin: () => dayStart,
     getMax: () => dayEnd,
     getFallback: () => allowedStart + (allowedEnd - allowedStart) / 2,
     clampToSpan: true,
 });

 let barEl = $state<HTMLDivElement | null>(null);
 $effect(() => {
     slider.setBarEl(barEl);
 });

 const thumbLabel = $derived.by<string>(() => {
     const shifted = new Date(slider.sliderValue + explorer.timezoneOffset * 60 * 1000);
     const hour = shifted.getUTCHours();
     const cappedHour = hour === 0 && slider.sliderValue >= dayEnd - 1 ? 23 : hour;
     return `${cappedHour}h`;
 });

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

 function onValueChange(v: number) {
     const clamped = Math.min(Math.max(v, allowedStart), allowedEnd);
     slider.onValueChange(clamped);
 }
</script>

<div
  bind:this={barEl}
  class="relative h-9 w-full select-none"
>
  {#each hourTicks as tick}
    <span
      class="pointer-events-none absolute z-0 text-xs whitespace-nowrap text-muted-foreground font-medium"
      style="left: {tick.px}px; top: 50%; transform: translate(-50%, -50%);"
    >
      {tick.label}
    </span>
  {/each}

  <div class="pointer-events-none absolute inset-x-0 -top-px bottom-[-1px] z-20">
    <MinimapOverlay minimapStart={dayStart} minimapEnd={dayEnd} barWidth={slider.barWidth} />
  </div>

  <UnallowedMask leftPercent={leftUnallowedPercent} rightPercent={rightUnallowedPercent} />
  
  <div class="pointer-events-none absolute inset-y-0 z-50" style="left: -18px; right: -18px;">
    <Slider.Root
      type="single"
      min={dayStart}
      max={dayEnd}
      step={sliderStep}
      bind:value={slider.sliderValue}
      onValueChange={onValueChange}
      onpointerdown={slider.onPointerDown} 
      onpointerup={slider.onPointerUp}
      class="pointer-events-auto relative flex h-full w-full touch-none items-center"
    >
      <Slider.Track class="relative h-full w-full overflow-hidden rounded-full bg-transparent">
        <Slider.Range class="absolute h-full bg-transparent" />
      </Slider.Track>

      <Slider.Thumb
        index={0}
        class="relative flex size-8 cursor-ew-resize items-center justify-center
               rounded-full bg-[var(--rewyt-selected-600)] outline-none transition-opacity
               {slider.thumbHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}"
      >
         <span class="pointer-events-none select-none text-sm font-bold text-foreground tracking-wide">
              {thumbLabel}
          </span>
      </Slider.Thumb>
    </Slider.Root>
  </div>
</div>
