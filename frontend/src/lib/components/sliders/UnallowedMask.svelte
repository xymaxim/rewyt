<script lang="ts">
  interface Props {
    leftPercent: number;
    rightPercent: number;
    fadeWidth?: number;
    offsetWidth?: string;
  }

  const {
    leftPercent,
    rightPercent,
    fadeWidth = 10,
    offsetWidth = "1rem",
  }: Props = $props();

  const fadeColor = "rgb(255 255 255 / 30%)";
</script>

{#if leftPercent > 0}
  <div
    class="pointer-events-none absolute inset-y-0 z-30 rounded-l-2xl"
    style="
      left: -{offsetWidth};
      width: calc({leftPercent}% + {offsetWidth});
      background: linear-gradient(to right,
        {fadeColor} 0%,
        {fadeColor} calc(100% - {fadeWidth}px),
        transparent 100%
      );
    "
  ></div>
{/if}

{#if rightPercent > 0}
  <div
    class="pointer-events-none absolute inset-y-0 z-30 rounded-r-2xl"
    style="
      right: -{offsetWidth};
      width: calc({rightPercent}% + {offsetWidth});
      background: linear-gradient(to left,
        {fadeColor} 0%,
        {fadeColor} calc(100% - {fadeWidth}px),
        transparent 100%
      );
    "
  ></div>
{/if}
