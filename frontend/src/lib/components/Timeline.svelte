<script lang="ts">
 import { getExplorerContext } from "$lib/explorer.svelte";
 import { MS_PER_HOUR } from "$lib/utils/dateUtils";
 import { formatTime } from "$lib/utils/dateTimeUtils";
 import { useElementSize } from "$lib/hooks/useElementSize.svelte";
 import { pixelToTime, timeToPixel } from "$lib/utils/timePixelUtils";
 import {
     buildTicks,
     findDay,
     getStripeBackground,
     snapTime,
 } from "$lib/utils/timelineUtils";
 import IntervalSlider from "$lib/components/sliders/IntervalSlider.svelte";
 import SelectedTimeSlider from "$lib/components/sliders/SelectedTimeSlider.svelte";

  import {
      ArrowUpRight,
      Camera,
      Circle,
      Pause,
      Play,
      Radio,
      RotateCcw,
      Settings,
      ZoomIn,
  } from "lucide-svelte";
 
 interface Props {
     seekableRange: { start: number; end: number } | null;
     isRewound: boolean;
     onRewind: (interval: string) => void;
 }

 let { seekableRange, isRewound, onRewind }: Props = $props();

 const explorer = getExplorerContext();
 const bar = useElementSize();

 let timelineEl = $state<HTMLDivElement | null>(null);
 let hoverPx = $state<number | null>(null);

 const notAvailableMessage = "Outside rewind range";

 const range = $derived(
     explorer.viewRange && bar.width > 0 ? explorer.viewRange : null,
 );

 const ticks = $derived.by(() => {
     if (range === null) return [];
     const center = (range.start + range.end) / 2;
     const day = findDay(center, explorer.days);
     const dayStart = day?.dayStart ?? Math.floor(center / MS_PER_HOUR) * MS_PER_HOUR;
     return buildTicks(range, bar.width, dayStart, explorer.timezoneOffset).map((tick) => {
         if (!tick.major || tick.label !== "00:00") return { ...tick, dayLabel: null };
         const ts = pixelToTime(tick.px, range, bar.width);
         return {
             ...tick,
             dayLabel: ts !== null ? formatDayLabel(ts, explorer.timezoneOffset) : null,
         };
     });
 });

 const { stripeWidthPx, stripeOffsetPx, stripeGradient } = $derived.by(() =>
     range
     ? getStripeBackground(range, bar.width, explorer.timezoneOffset * 60 * 1000)
     : { stripeWidthPx: 0, stripeOffsetPx: 0, stripeGradient: "" },
 );

 const seekableLeft = $derived.by<number | null>(() => {
     if (!seekableRange || !range) return null;
     if (seekableRange.end < range.start || seekableRange.start > range.end) return null;
     return timeToPixel(Math.max(seekableRange.start, range.start), range, bar.width);
 });

 const seekableRight = $derived.by<number | null>(() => {
     if (!seekableRange || !range) return null;
     if (seekableRange.end < range.start || seekableRange.start > range.end) return null;
     return timeToPixel(Math.min(seekableRange.end, range.end), range, bar.width);
 });

 const unavailableLeftPx = $derived.by<number | null>(() => {
     const ar = explorer.availableRange;
     if (!ar || !range) return null;
     if (ar.start <= range.start) return null;
     return timeToPixel(Math.min(ar.start, range.end), range, bar.width);
 });

 const unavailableRightPx = $derived.by<number | null>(() => {
     const ar = explorer.availableRange;
     if (!ar || !range) return null;
     if (ar.end >= range.end) return null;
     return timeToPixel(Math.max(ar.end, range.start), range, bar.width);
 });

 const playheadPx = $derived.by<number | null>(() => {
     if (range === null) return null;
     const t = explorer.playheadTime;
     if (t === null) return null;
     return timeToPixel(t, range, bar.width);
 });

 const playheadLabelFlipped = $derived(
     playheadPx !== null && bar.width > 0 && playheadPx / bar.width > 0.85,
 );

 function isAvailable(ts: number): boolean {
     const ar = explorer.availableRange;
     if (!ar) return true;
     return ts >= ar.start && ts <= ar.end;
 }

 function formatDayLabel(ts: number, offsetMinutes: number): string | null {
     const shifted = new Date(ts + offsetMinutes * 60 * 1000);
     if (shifted.getUTCHours() !== 0 || shifted.getUTCMinutes() !== 0) return null;
     const now = new Date(Date.now() + offsetMinutes * 60 * 1000);
     const isToday = now.toDateString() === shifted.toDateString();
     if (isToday) return "Today";
     return shifted.toLocaleString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
 }

 function onMouseMove(e: MouseEvent) {
     if (!timelineEl) return;
     if (explorer.isSliding) {
         hoverPx = null;
         return;
     }
     const px = e.clientX - timelineEl.getBoundingClientRect().left;
     const ts = range ? pixelToTime(px, range, bar.width) : null;
     hoverPx = ts && isAvailable(ts) ? px : null;
 }

 function onMouseLeave() {
     hoverPx = null;
 }

 function onClick(e: MouseEvent) {
     if (explorer.isSliding) return;
     if (!timelineEl || range === null) return;
     const spanMs = range.end - range.start;
     const ts = Math.round(
         snapTime(
             pixelToTime(e.clientX - timelineEl.getBoundingClientRect().left, range, bar.width),
             spanMs,
         ),
     );
     if (!isAvailable(ts)) return;
     explorer.setSelectedTime(ts);
     explorer.setDragTime(ts);
     if (!e.ctrlKey) onRewind(new Date(ts).toISOString(), explorer.pauseAfterRewind);
     hoverPx = null;
 }

 $effect(() => {
     if (explorer.isSliding) hoverPx = null;
 });
</script>

<div bind:this={bar.el} class="relative w-full pb-0 outline-hidden select-none">    
    <div class="relative h-6 w-full">
        {#each ticks.filter((t) => t.major) as tick}
            <span
                class="absolute text-sm whitespace-nowrap"
                class:text-foreground={!tick.dayLabel}
                class:text-muted-foreground={!!tick.dayLabel}
                class:text-gray-300={!isAvailable(pixelToTime(tick.px, range!, bar.width))}
                style="left: {tick.px}px; transform: translateX(-50%);"
            >{tick.dayLabel ?? tick.label}</span>
        {/each}
    </div>

    <div
        bind:this={timelineEl}
        class="group relative h-12 w-full rounded-2xl cursor-pointer"
        style="background: {stripeGradient} {stripeOffsetPx}px 0 / {stripeWidthPx}px 100%;"
        onmousemove={onMouseMove}
        onmouseleave={onMouseLeave}
        onclick={onClick}
    >
        
        {#if seekableLeft !== null && seekableRight !== null}
            <div
                class="pointer-events-none absolute top-0 bottom-0 rounded-xl bg-[var(--rewyt-play-300)]/60"
                style="left: {seekableLeft}px; width: {seekableRight - seekableLeft}px"
            ></div>
        {/if}

        {#if unavailableLeftPx !== null}
            <div title={notAvailableMessage} class="unavailable-back absolute top-0 bottom-0 left-0" style="width: {unavailableLeftPx}px;"></div>
        {/if}

        {#if unavailableRightPx !== null}
            <div title={notAvailableMessage} class="unavailable-back absolute top-0 right-0 bottom-0" style="left: {unavailableRightPx}px;"></div>
        {/if}

        {#each ticks as tick}
            <div class="absolute z-30 bg-black/30" style="left: {tick.px}px; height: {tick.major ? 10 : 6}px; width: 1px;"></div>
        {/each}

        <div class="absolute w-full h-7!">
            <IntervalSlider />
        </div>

        <div class="pointer-events-none absolute w-full rounded-full inset-0">
            {#if playheadPx !== null}
                <div
                    class="h-full pointer-events-none absolute size-5! bottom-0 z-50 rounded-full"
                    style="left: 0; background: var(--rewyt-play-950); will-change: transform; transform: translateX(calc({playheadPx}px - 50%));"
                >
                    <div class="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 size-0.75 rotate-30 bg-black rounded-full"/>
                    <div
                        class="absolute top-1/2 -translate-y-1/2 whitespace-nowrap"
                        class:left-full={!playheadLabelFlipped}
                        class:ml-2={!playheadLabelFlipped}
                        class:right-full={playheadLabelFlipped}
                        class:mr-2={playheadLabelFlipped}
                    >
                        {formatTime(explorer.playheadTime, explorer.timezoneOffset)}
                    </div>
                </div>
            {/if}
        </div>
    </div>

    <div class="relative w-full h-8">
        {#if explorer.dragTime !== null || hoverPx !== null}
            <SelectedTimeSlider {hoverPx} {isRewound} {onRewind} />
        {:else}
            <div class="flex justify-center text-sm text-muted-foreground h-5 py-1 gap-1">
                <span>Click above or slide</span>
                <span class="inline-flex items-center rounded-full bg-[var(--rewyt-selected)]/50 size-5"></span>
                <span>to rewind</span>
            </div>
        {/if}
    </div>

</div>

<style>
 @reference "tailwindcss";
 .unavailable-back {
     @apply cursor-not-allowed rounded-md backdrop-blur-md backdrop-grayscale;
     background: --alpha(var(--background) / 70%);
 }
</style>
