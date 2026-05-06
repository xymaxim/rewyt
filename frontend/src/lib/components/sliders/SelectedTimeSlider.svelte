<script lang="ts">
 import { Slider } from "bits-ui";
 import { Rewind } from "lucide-svelte";
 import { getExplorerContext } from "$lib/explorer.svelte";
 import { snapTime, formatHoverTime } from "$lib/utils/timelineUtils";
 import { useTimeSlider } from "$lib/components/sliders/useTimeSlider.svelte";
 import { pixelToTime } from "$lib/utils/timePixelUtils";

 interface Props {
     hoverPx?: number | null;
     onRewind: (isoTime: string, pauseAfterRewind?: boolean) => void;
     isRewound: boolean;
 }

 const { hoverPx: timelineHoverPx = null, onRewind, isRewound }: Props = $props();

 const explorer = getExplorerContext();

 const thumbSizePx = 32; // size-8
 const thumbColorDefault = "var(--rewyt-selected-600)";
 const thumbColorActive  = "#E3B591"; // violet-300
 const thumbLabelOffset = 6;

 const rangeStart = $derived(explorer.viewRange?.start ?? 0);
 const rangeEnd   = $derived(explorer.viewRange?.end   ?? 0);
 const spanMs     = $derived(rangeEnd - rangeStart);

 const allowedStart = $derived(
     Math.max(rangeStart, explorer.availableRange?.start ?? rangeStart),
 );
 const allowedEnd = $derived(
     Math.min(rangeEnd, explorer.availableRange?.end ?? rangeEnd),
 );

 const slider = useTimeSlider({
     getMin: () => allowedStart,
     getMax: () => allowedEnd,
     getFallback: () => explorer.selectedTime ?? allowedStart,
     updateViewRange: false,
 });

 let barEl = $state<HTMLDivElement | null>(null);
 $effect(() => { slider.setBarEl(barEl); });

 const allowedStartPercent = $derived(
     spanMs > 0 ? ((allowedStart - rangeStart) / spanMs) * 100 : 0,
 );
 const allowedEndPercent = $derived(
     spanMs > 0 ? ((allowedEnd - rangeStart) / spanMs) * 100 : 100,
 );

 const snappedValue = $derived(snapTime(slider.sliderValue, spanMs));
 const label        = $derived(formatHoverTime(snappedValue, spanMs, explorer.timezoneOffset));

 const thumbPercent = $derived(
     allowedEnd > allowedStart
                ? ((slider.sliderValue - allowedStart) / (allowedEnd - allowedStart)) * 100
                : 0,
 );
 const labelFlipped = $derived(thumbPercent > 85);

 // Thumb pixel position relative to barEl
 const thumbPx = $derived(
     slider.barWidth > 0
                     ? (allowedStartPercent / 100 + thumbPercent / 100 * (allowedEndPercent - allowedStartPercent) / 100) * slider.barWidth
                     : 0,
 );

 // ── Active state ──────────────────────────────────────────────────────────
 //const isActive = $derived(explorer.dragTime !== null || timelineHoverPx !== null);
 const isActive = $derived((explorer.isSliding && explorer.dragTime !== null) || timelineHoverPx !== null);

 const activeTs = $derived.by<number | null>(() => {
     if (!isActive) return null;
     if (timelineHoverPx !== null && slider.barWidth > 0 && spanMs > 0) {
         const ts = pixelToTime(timelineHoverPx, { start: rangeStart, end: rangeEnd }, slider.barWidth);
         if (ts === null || ts < allowedStart || ts > allowedEnd) return null;
         return ts;
     }
     if (explorer.isSliding && explorer.dragTime !== null) {
         const ts = explorer.dragTime;
         if (ts < allowedStart || ts > allowedEnd) return null;
         return ts;
     }
     return null;
 });

  $effect(() => {
      console.log(explorer.isSliding, "isSliding", isActive, "isActive")
 })


 const activeSnapped  = $derived(activeTs !== null ? snapTime(activeTs, spanMs) : null);
 const activeLabel    = $derived(activeSnapped !== null ? formatHoverTime(activeSnapped, spanMs, explorer.timezoneOffset) : null);
 const activeCirclePx = $derived.by<number | null>(() => {
     if (activeTs === null || spanMs === 0 || slider.barWidth === 0) return null;
     return ((activeTs - rangeStart) / spanMs) * slider.barWidth;
 });
 const activeLabelFlipped = $derived(
     activeCirclePx !== null && slider.barWidth > 0 && activeCirclePx / slider.barWidth > 0.85,
 );

 // ── Label style ───────────────────────────────────────────────────────────
 const getLabelStyle = () => {
     if (!labelFlipped && isRewound)  return `margin-left: ${thumbLabelOffset}px`;
     if (!labelFlipped && !isRewound) return `margin-left: ${thumbSizePx + thumbLabelOffset}px`;
     if (labelFlipped && isRewound)   return `margin-right: ${thumbLabelOffset}px`;
     return `margin-right: ${thumbSizePx + thumbLabelOffset}px`;
 };

 function onPointerUp() {
     slider.onPointerUp();
     const snapped = snappedValue;
     explorer.setSelectedTime(snapped);
     onRewind(new Date(snapped).toISOString(), explorer.pauseAfterRewind);
 }
</script>

{#if explorer.viewRange !== null}
    <div bind:this={barEl} class="relative flex h-full w-full items-center">

        <!-- State 3: active circle (drag or hover) -->
        {#if isActive && activeCirclePx !== null && activeLabel !== null}
            <div
                class="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-50 flex size-8 items-center justify-center rounded-full"
                style="left: {activeCirclePx}px; background: {thumbColorActive};"
            >
                <div class="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 size-3 rounded-full z-10" style="background: {thumbColorDefault}" />
                <span
                    class="pointer-events-none absolute h-full items-center flex top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-base px-1"
                    class:left-full={!activeLabelFlipped}
                    class:right-full={activeLabelFlipped}
                    style="{activeLabelFlipped ? `margin-right: ${thumbLabelOffset}px` : `margin-left: ${thumbLabelOffset}px`}"
                >
                    {activeLabel}
                </span>
            </div>
        {/if}

        <!-- Resting state: follower div with rewind button + label, outside bits-ui -->
        {#if !isActive}
            <div
                class="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-40 flex size-8 items-center justify-center"
                style="left: {thumbPx}px;"
            >
                <!-- Rewind button: same size as thumb, touches it on left or right -->
                {#if !isRewound}
                    <div
                        class="pointer-events-auto absolute top-1/2 -translate-y-1/2 flex cursor-pointer items-center justify-center rounded-full bg-[var(--rewyt-selected-600)] hover:scale-110 transition-transform"
                        style="width: {thumbSizePx}px; height: {thumbSizePx}px; {labelFlipped ? `right: 100%; margin-right: 1px;` : `left: 100%; margin-left: 1px;`}"
                        onclick={() => onRewind(new Date(slider.sliderValue).toISOString(), explorer.pauseAfterRewind)}
                        >
                        <Rewind class="text-foreground" size={18} />
                    </div>
                {/if}

                <!-- Label -->
                <span
                    class="pointer-events-none absolute top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-base"
                    class:left-full={!labelFlipped}
                    class:right-full={labelFlipped}
                    style={getLabelStyle()}
                >
                    {label}
                </span>
            </div>
        {/if}

        <!-- Slider: track/range pointer-events-none, thumb only interactive -->
        <div
            class="pointer-events-none absolute inset-y-0"
            style="left: calc({allowedStartPercent}% - {thumbSizePx / 2}px); width: calc({allowedEndPercent - allowedStartPercent}% + {thumbSizePx}px);"
        >
            <Slider.Root
                type="single"
                bind:value={slider.sliderValue}
                onValueChange={slider.onValueChange}
                onpointerdown={slider.onPointerDown}
                onpointerup={onPointerUp}
                min={allowedStart}
                max={allowedEnd}
                step={1000}
                class="pointer-events-none! relative flex h-full w-full touch-none items-center"
            >
                <Slider.Track class="relative h-full w-full overflow-hidden rounded-full bg-transparent">
                    <Slider.Range class="absolute h-full bg-transparent" />
                </Slider.Track>

                <Slider.Thumb
                    index={0}
                    class="pointer-events-auto relative flex size-8 cursor-ew-resize items-center justify-center outline-none {timelineHoverPx ? 'opacity-40 grayscale-100' : ''}"
                >
                    <div class="absolute inset-0 rounded-full z-10" style="background: {isRewound ? thumbColorDefault : thumbColorActive};" />
                    <div class="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 size-0.75 bg-black rounded-full z-10" />
                </Slider.Thumb>
            </Slider.Root>
        </div>
    </div>
{/if}
