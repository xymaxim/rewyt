import { onMount } from "svelte";
import { getExplorerContext } from "$lib/explorer.svelte";
import { clampViewRange, snapTime } from "$lib/utils/timelineUtils";

export interface TimeSliderOptions {
  getMin: () => number;
  getMax: () => number;
  getFallback?: () => number;
  clampToSpan?: boolean;
  updateViewRange?: boolean;
  onTimeChange?: () => void;
}

export interface TimeSliderState {
  readonly barEl: HTMLDivElement | null;
  setBarEl: (el: HTMLDivElement | null) => void;
  readonly barWidth: number;
  readonly isSliding: boolean;
  sliderValue: number;
  readonly thumbHidden: boolean;
  onValueChange: (value: number) => void;
  onPointerDown: () => void;
  onPointerUp: () => void;
}

export function useTimeSlider(options: TimeSliderOptions): TimeSliderState {
  const { getMin, getMax, getFallback, clampToSpan = false } = options;
  const explorer = getExplorerContext();

  let barEl = $state<HTMLDivElement | null>(null);
  let barWidth = $state(0);
  let isSliding = $state(false);

  let dragValue = $state<number | null>(null);

  const sliderValue = $derived.by<number>(() => {
    if (dragValue !== null) return dragValue;
    const min = getMin();
    const max = getMax();

    if (explorer.selectedTime !== null) return explorer.selectedTime;
    if (explorer.mpdStartTime !== null) return explorer.mpdStartTime;

    if (getFallback) return Math.min(Math.max(getFallback(), min), max);

    const vr = explorer.viewRange;
    return Math.min(Math.max((vr.start + vr.end) / 2, min), max);
  });

  const thumbHidden = $derived(explorer.viewRange === null);

  function onValueChange(value: number) {
    if (!isSliding) return;

    dragValue = value;

    const center = clampToSpan
      ? Math.min(
          Math.max(value, getMin() + explorer.zoomLevel / 2),
          getMax() - explorer.zoomLevel / 2,
        )
      : value;

    const vr = explorer.viewRange;
    const spanMs = vr ? vr.end - vr.start : 0;
    const snapped = spanMs > 0 ? Math.round(snapTime(value, spanMs)) : value;

    explorer.setSelectedTime(snapped);
    options.onTimeChange?.();
    if (options.updateViewRange !== false) {
      explorer.setViewRange(
        clampViewRange(
          center,
          explorer.zoomLevel,
          explorer.days,
          explorer.centeredOnMidnight,
        ),
      );
    }
  }

  function onPointerDown() {
    isSliding = true;
    explorer.setIsSliding(true);
  }
  function onPointerUp() {
    isSliding = false;
    dragValue = null;
    explorer.setIsSliding(false);
  }

  $effect(() => {
    if (!barEl) return;
    const ro = new ResizeObserver((e) => {
      barWidth = e[0].contentRect.width;
    });
    ro.observe(barEl);
    return () => ro.disconnect();
  });

  onMount(() => {
    const handler = () => {
      isSliding = false;
      dragValue = null;
      explorer.setIsSliding(false);
    };
    window.addEventListener("pointerup", handler);
    return () => window.removeEventListener("pointerup", handler);
  });

  return {
    get barEl() {
      return barEl;
    },
    setBarEl(el) {
      barEl = el;
    },
    get barWidth() {
      return barWidth;
    },
    get isSliding() {
      return isSliding;
    },
    get sliderValue() {
      return sliderValue;
    },
    set sliderValue(v) {
      if (isSliding) dragValue = v;
    },
    get thumbHidden() {
      return thumbHidden;
    },
    onValueChange,
    onPointerDown,
    onPointerUp,
  };
}
