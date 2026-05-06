<script lang="ts">
import { onMount } from "svelte";
  import { getExplorerContext } from "$lib/explorer.svelte";
  import { useElementSize } from "$lib/hooks/useElementSize.svelte";
  import { pixelToTime } from "$lib/utils/timePixelUtils";

  interface Props {
    color?: string;
  }

  const { color = "var(--rewyt-interval-200)" }: Props = $props();

  const explorer = getExplorerContext();
  const container = useElementSize();

  const vr = $derived(explorer.viewRange);
  const { A, B } = $derived(explorer.marks);

  const hasA = $derived(A !== null);
  const hasB = $derived(B !== null);
  const hasBoth = $derived(hasA && hasB);
  const hasEither = $derived(hasA || hasB);

  const aVisible = $derived(hasA && vr !== null && A! >= vr.start && A! <= vr.end);
  const bVisible = $derived(hasB && vr !== null && B !== null && B >= vr.start && B <= vr.end);

  const fill = $derived.by(() => {
    if (!vr || container.width === 0) return null;
    if (A === null && B === null) return null;

    if (hasBoth) {
      if (A! > vr.end && B! > vr.end) return null;
      if (A! < vr.start && B! < vr.start) return null;
      const left = A! < vr.start ? 0 : ((A! - vr.start) / (vr.end - vr.start)) * container.width;
      const right = B! > vr.end ? container.width : ((B! - vr.start) / (vr.end - vr.start)) * container.width;
      return { left, right };
    }

    if (hasA && aVisible) {
      const px = ((A! - vr.start) / (vr.end - vr.start)) * container.width;
      return { left: px, right: null };
    }

    if (hasB && bVisible) {
      const px = ((B! - vr.start) / (vr.end - vr.start)) * container.width;
      return { left: null, right: px };
    }

    return null;
  });

  const thumbSize = $derived(container.height);

  // ── Drag handling ─────────────────────────────────────────────────────────
  let dragging = $state<"A" | "B" | null>(null);

  function getThumbHitArea(mark: "A" | "B"): { left: number; right: number } | null {
    if (!fill) return null;
    if (mark === "A" && fill.left !== null) {
      return { left: fill.left - thumbSize, right: fill.left };
    }
    if (mark === "B" && fill.right !== null) {
      return { left: fill.right, right: fill.right + thumbSize };
    }
    return null;
  }

  function onPointerDown(e: PointerEvent) {
    if (!container.el || !vr) return;
    const rect = container.el.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (aVisible) {
      const hit = getThumbHitArea("A");
      if (hit && x >= hit.left && x <= hit.right) {
        dragging = "A";
        explorer.setIsSliding(true);
        container.el.setPointerCapture(e.pointerId);
        return;
      }
    }

    if (bVisible) {
      const hit = getThumbHitArea("B");
      if (hit && x >= hit.left && x <= hit.right) {
        dragging = "B";
        explorer.setIsSliding(true);
        container.el.setPointerCapture(e.pointerId);
        return;
      }
    }
  }

function onPointerMove(e: PointerEvent) {
  if (!dragging || !container.el || !vr) return;
  const rect = container.el.getBoundingClientRect();
  const x = Math.min(Math.max(e.clientX - rect.left, 0), container.width);
  const ts = pixelToTime(x, vr, container.width);
  if (ts === null) return;

  let clamped = ts;
  if (dragging === "A" && B !== null) clamped = Math.min(ts, B);
  if (dragging === "B" && A !== null) clamped = Math.max(ts, A);

  explorer.assignMark(dragging, clamped);
}

function onPointerUp(e: PointerEvent) {
  if (dragging && container.el) {
    container.el.releasePointerCapture(e.pointerId);
    const blockClick = (ev: MouseEvent) => {
      ev.stopPropagation();
      window.removeEventListener("click", blockClick, true);
    };
    window.addEventListener("click", blockClick, true);
  }
  dragging = null;
  explorer.setIsSliding(false);
}

  onMount(() => {
    const handler = () => { dragging = null; explorer.setIsSliding(false)};
  });

</script>

<div
  bind:this={container.el}
  class="pointer-events-auto absolute inset-0 z-10 h-full touch-none"
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
>
  {#if fill !== null && vr !== null && hasEither}

    <!-- Interval fill -->
    {#if fill.left !== null && fill.right !== null}
      <div
        class="absolute top-1/2 -translate-y-1/2 rounded-xl"
        style="
          left: {fill.left}px;
          width: {fill.right - fill.left}px;
          height: {container.height}px;
          background: {color};
        "
      ></div>
    {/if}

    <!-- Edge line (single mark only) -->
      {#if aVisible && fill.left !== null}
        <div class="absolute top-0 bottom-0 w-px bg-black -translate-x-px" style="left: {fill.left}px;"></div>
      {/if}
      {#if bVisible && fill.right !== null}
        <div class="absolute top-0 bottom-0 w-px bg-black -translate-x-px" style="left: {fill.right}px;"></div>
      {/if}

    <!-- A thumb: sits left of edge -->
    {#if aVisible && fill.left !== null}
      <div
        class="absolute flex top-1/2 -translate-y-1/2 rounded-full cursor-ew-resize"
        style="
          left: {fill.left - thumbSize - 1}px;
          width: {thumbSize}px;
          height: {thumbSize}px;
          background: var(--rewyt-interval-100);
        "
      >
      <div class="flex flex-1 justify-center items-center text-base font-medium">A</div>
      </div>
    {/if}

    <!-- B thumb: sits right of edge -->
    {#if bVisible && fill.right !== null}
      <div
        class="absolute flex top-1/2 -translate-y-1/2 rounded-full cursor-ew-resize"
        style="
          left: {fill.right}px;
          width: {thumbSize}px;
          height: {thumbSize}px;
          background: var(--rewyt-interval-100);
        "
      >
      <span class="flex flex-1 justify-center items-center text-base font-medium">B</span>
      </div>
    {/if}

  {/if}
</div>