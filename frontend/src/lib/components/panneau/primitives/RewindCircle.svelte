<script lang="ts">
  import { Undo } from "lucide-svelte";

  interface Props {
    x?: number;
    y?: number;
    onclick?: () => void;
  }

  let { x = 0, y = 0, onclick }: Props = $props();

  const gradientId = $props.id();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onclick?.();
    }
  }
</script>

<defs>
  <linearGradient id={gradientId} x1="0%" y1="50%" x2="100%" y2="50%">
    <stop offset="0%" stop-color="var(--color-selecting)" />
    <stop offset="50%" stop-color="var(--color-selected)" />
  </linearGradient>
</defs>

<g transform="translate({x}, {y})">
  {#if onclick}
    <circle
      r={40}
      fill="url(#{gradientId})"
      class="clickable"
      role="button"
      tabindex="0"
      aria-label="Randomize layout"
      {onclick}
      onkeydown={handleKeydown}
    />
  {:else}
    <circle r={40} fill="url(#{gradientId})" />
  {/if}
  <foreignObject
    x={-20}
    y={-20}
    width={40}
    height={40}
    style="pointer-events: none;"
  >
    <div xmlns="http://www.w3.org/1999/xhtml" class="icon-wrap">
      <Undo size={32} color="oklch(0.2 0 0)" />
    </div>
  </foreignObject>
</g>

<style>
  .icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .clickable {
    cursor: pointer;
    outline: none;
  }
</style>
