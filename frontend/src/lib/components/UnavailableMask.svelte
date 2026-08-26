<script lang="ts">
  import { useElementSize } from "$lib/hooks/useElementSize.svelte";

  interface Props {
    leftWidth?: string;
    rightWidth?: string;
    title?: string;
    class?: string;
  }

  const {
    leftWidth,
    rightWidth,
    title,
    class: className = "",
  }: Props = $props();

  const size = useElementSize();

  const arcColor = "#d0d0d0";
  const arcRadiusRatio = 0.8;
  const gapRatio = 0;
  const strokeWidth = 10;

  const arcRadius = $derived(Math.round(size.height * arcRadiusRatio));
  const tileWidth = $derived(Math.round(arcRadius * (1 + gapRatio)));
  const tileHeight = $derived(Math.round(size.height));

  const leftPattern = $derived.by(() => {
    if (tileWidth <= 0 || tileHeight <= 0) return "none";
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='${tileWidth}' height='${tileHeight}' viewBox='0 0 ${tileWidth} ${tileHeight}'>` +
      `<path d='M${tileWidth} 0 A${arcRadius} ${arcRadius} 0 0 0 ${tileWidth} ${tileHeight}' ` +
      `fill='none' stroke='${arcColor}' stroke-width='${strokeWidth}' stroke-linecap='round'/>` +
      `</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  });

  const rightPattern = $derived.by(() => {
    if (tileWidth <= 0 || tileHeight <= 0) return "none";
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='${tileWidth}' height='${tileHeight}' viewBox='0 0 ${tileWidth} ${tileHeight}'>` +
      `<path d='M0 0 A${arcRadius} ${arcRadius} 0 0 1 0 ${tileHeight}' ` +
      `fill='none' stroke='${arcColor}' stroke-width='${strokeWidth}' stroke-linecap='round'/>` +
      `</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  });
</script>

<div
  bind:this={size.el}
  class="absolute inset-0 z-30 {className}"
  aria-hidden="true"
>
  {#if leftWidth}
    <div
      {title}
      class="unavailable-mask unavailable-mask--left absolute top-0 bottom-0 left-0 cursor-not-allowed"
      style="width: {leftWidth}; background-image: {leftPattern}; background-size: {tileWidth}px {tileHeight}px;"
    ></div>
  {/if}

  {#if rightWidth}
    <div
      {title}
      class="unavailable-mask unavailable-mask--right absolute top-0 bottom-0 right-0 cursor-not-allowed"
      style="width: {rightWidth}; background-image: {rightPattern}; background-size: {tileWidth}px {tileHeight}px;"
    ></div>
  {/if}
</div>

<style>
  @reference "tailwindcss";

  .unavailable-mask {
    background-color: #c0c0c0;
    background-repeat: repeat-x;
  }

  .unavailable-mask--left {
    @apply rounded-r-2xl;
    background-position: right center;
  }

  .unavailable-mask--right {
    @apply rounded-l-2xl;
    background-position: left center;
  }
</style>
