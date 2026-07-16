import { onMount } from "svelte";
import { getExplorerContext } from "$lib/explorer.svelte";
import { clampViewRange } from "$lib/utils/timelineUtils";

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

  const sliderValue = $derived.by<number>(() => {
    const min = getMin();
    const max = getMax();

    if (explorer.selectedTime !== null) return explorer.selectedTime;
    if (explorer.mpdStartTime !== null) return explorer.mpdStartTime;

    if (getFallback) return Math.min(Math.max(getFallback(), min), max);

    const vr = explorer.viewRange;
    return Math.min(Math.max((vr.start + vr.end) / 2, min), max);
  });

  let bindableValue = $state(0);
  $effect(() => {
    bindableValue = sliderValue;
  });

  const thumbHidden = $derived(explorer.viewRange === null);

  function onValueChange(value: number) {
    if (!isSliding) return;

    const center = clampToSpan
      ? Math.min(
          Math.max(value, getMin() + explorer.zoomLevel / 2),
          getMax() - explorer.zoomLevel / 2,
        )
      : value;

    explorer.setSelectedTime(value);
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
      bindableValue = v;
    },
    get thumbHidden() {
      return thumbHidden;
    },
    onValueChange,
    onPointerDown,
    onPointerUp,
  };
}
