<script lang="ts">
  import { Slider } from "$lib/components/ui/slider/index.js";
  import { onMount } from "svelte";
  import { getExplorerContext } from "../explorer.svelte.js";
  import { clampViewRange } from "../utils/timelineUtils";

  const explorer = getExplorerContext();

  // State
  let now = $state(Date.now());
  let isSliding = $state(false);

  // Derived
  const min = $derived(
    explorer.days[explorer.days.length - 1]?.dayStart ?? now,
  );
  const max = $derived(explorer.days[0]?.dayEnd ?? now);
  const allowedStart = $derived(now - 6 * 24 * 60 * 60 * 1000);

  const allowedStartPercent = $derived(
    Math.max(0, ((allowedStart - min) / (max - min)) * 100),
  );
  const nowPercent = $derived(Math.min(100, ((now - min) / (max - min)) * 100));

  const sliderValue = $derived.by<number[]>(() => {
    if (explorer.selectedTime === null) return [allowedStart];
    return [Math.min(Math.max(explorer.selectedTime, allowedStart), now)];
  });

  const thumbClass = $derived(
    explorer.selectedTime === null
      ? "[&_[role=slider]]:opacity-0 [&_[role=slider]]:pointer-events-none"
      : "",
  );

  // Event handlers
  function onValueChange(value: number) {
    if (!isSliding) return;
    const t = Math.min(Math.max(value, allowedStart), now);
    const vr = explorer.viewRange;
    explorer.setSelectedTime(t);
    if (!vr) return;
    explorer.setViewRange(
      clampViewRange(
        t,
        vr.end - vr.start,
        explorer.days,
        explorer.centeredOnMidnight,
      ),
    );
  }

  // Lifecycle
  onMount(() => {
    const interval = setInterval(() => {
      now = Date.now();
    }, 600_000);
    const onPointerUp = () => (isSliding = false);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      clearInterval(interval);
      window.removeEventListener("pointerup", onPointerUp);
    };
  });
</script>

<div class="relative w-full py-2">
  <div
    style="position: absolute; left: calc({allowedStartPercent}% - 8px); width: calc({nowPercent -
      allowedStartPercent}% + 10px);"
  >
    <Slider
      type="single"
      min={allowedStart}
      max={now}
      step={600_000}
      value={sliderValue}
      {onValueChange}
      onpointerdown={() => (isSliding = true)}
      onpointerup={() => (isSliding = false)}
      class="w-full cursor-pointer {thumbClass}
            [&_[data-slot=slider-range]]:bg-transparent
            [&_[data-slot=slider-track]]:bg-black/15
            [&_[role=slider]]:z-10
            [&_[role=slider]]:h-4
            [&_[role=slider]]:w-4
            [&_[role=slider]]:cursor-ew-resize
            [&_[role=slider]]:border-[var(--ypb-selected)]
            [&_[role=slider]]:bg-[var(--ypb-selected)]"
    />
  </div>
</div>
