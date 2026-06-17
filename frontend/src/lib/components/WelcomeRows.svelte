<script lang="ts">
  import { useElementSize } from "$lib/hooks/useElementSize.svelte";

  const container = useElementSize();

  const playSize = 30;
  const rewindSize = 70;
  const highlightW = 250;
  const highlightH = 30;

  const fillerMinW = 20;

  const playX = $derived(Math.random() * (container.width - playSize));
  const rewindX = $derived(Math.random() * (container.width - rewindSize));
  const highlightX = $derived(Math.random() * (container.width - highlightW));
</script>

<div
  class="flex h-full w-full flex-col justify-center"
  bind:this={container.el}
>
  <div class="flex w-full items-center" style:height="{rewindSize}px">
    {#if rewindX >= fillerMinW}
      <div
        class="filler bg-[var(--rewyt-selected-lighter)]"
        style:width="{rewindX}px"
      ></div>
    {/if}
    <div
      class="relative shrink-0 rounded-full bg-[var(--rewyt-selected)]"
      style:width="{rewindSize}px"
      style:height="{rewindSize}px"
    >
      <div
        class="absolute top-1/2 left-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black"
      ></div>
    </div>
  </div>

  <div class="flex w-full items-center" style:height="{playSize}px">
    {#if playX >= fillerMinW}
      <div
        class="filler bg-[var(--rewyt-play-400)]"
        style:width="{playX}px"
      ></div>
    {/if}
    <div
      class="relative shrink-0 rounded-full bg-[var(--rewyt-play)]"
      style:width="{playSize}px"
      style:height="{playSize}px"
    >
      <div
        class="absolute top-1/2 left-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black"
      ></div>
    </div>
  </div>

  <div class="flex w-full items-center" style:height="{highlightH}px">
    {#if highlightX >= fillerMinW}
      <div
        class="filler bg-[var(--rewyt-interval-light)]"
        style:width="{highlightX}px"
      ></div>
    {/if}
    <div
      class="shrink-0 rounded-full bg-[var(--rewyt-interval)]"
      style:width="{highlightW}px"
      style:height="{highlightH}px"
    ></div>
  </div>
</div>

<style>
  @reference "tailwindcss";

  .filler {
    @apply h-full rounded-3xl;
  }
</style>
