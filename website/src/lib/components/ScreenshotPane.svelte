<script lang="ts">
  import screenshot from "$lib/assets/screenshot.png";
  import annotations from "$lib/data/screenshot-annotations.json";

  const holes = annotations.filter((a) => a.type !== "window");

  const holePaddingPx = 5;
  const holeRadiusPx = 12;
  const maskRadius = 10;
  let screenshotWidth = $state(1011);

  const pxToUnits = $derived(screenshotWidth > 0 ? 1011 / screenshotWidth : 1);
  const holePadding = $derived(holePaddingPx * pxToUnits);
  const holeRadius = $derived(holeRadiusPx * pxToUnits);
</script>

<div
  class="relative mt-10 w-full max-w-[720px]"
  bind:clientWidth={screenshotWidth}
>
  <img src={screenshot} alt="Rewyt screenshot" class="w-full" />
  {#snippet outline(a: (typeof annotations)[number])}
    {@const [x1, y1, x2, y2] = a.bbox}
    {#if a.type === "button"}
      <ellipse
        cx={(x1 + x2) / 2}
        cy={(y1 + y2) / 2}
        rx={(x2 - x1) / 2 + holePadding}
        ry={(y2 - y1) / 2 + holePadding}
        fill="black"
      />
    {:else}
      <rect
        x={x1 - holePadding}
        y={y1 - holePadding}
        width={x2 - x1 + 2 * holePadding}
        height={y2 - y1 + 2 * holePadding}
        rx={holeRadius}
        ry={holeRadius}
        fill="black"
      />
    {/if}
  {/snippet}
  <svg
    class="pointer-events-none absolute inset-0 h-full w-full"
    viewBox="0 0 1011 740"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <defs>
      <mask id="screenshot-annotations-mask">
        <rect
          width="1011"
          height="740"
          rx={maskRadius}
          ry={maskRadius}
          fill="white"
        />
        {#each holes as a (a.id)}
          {@render outline(a)}
        {/each}
      </mask>
    </defs>
    <rect
      width="1011"
      height="740"
      fill="var(--color-selected-darkest, #d4d4d4)"
      fill-opacity="0.6"
      mask="url(#screenshot-annotations-mask)"
    />
  </svg>
</div>
