<script lang="ts">
  import screenshot from "$lib/assets/screenshot.png";
  import annotations from "$lib/data/screenshot-annotations.json";

  const holes = annotations.filter((a) => a.type !== "window");

  const groups = [...new Set(annotations.map((a) => a.group))].map((id) => ({
    id,
  }));

  const groupCenterY = groups.map((g) => {
    const items = annotations.filter((a) => a.group === g.id);
    const top = Math.min(...items.map((a) => a.bbox[1]));
    const bottom = Math.max(...items.map((a) => a.bbox[3]));
    return (top + bottom) / 2;
  });

  const holePaddingPx = 5;
  const holeRadiusPx = 12;
  const maskRadius = 10;
  let screenshotWidth = $state(1011);

  let maskedGroup = $state<string | null>(null);
  let showMask = $state(false);

  const visibleHoles = $derived(
    maskedGroup ? holes.filter((a) => a.group === maskedGroup) : [],
  );

  const pxToUnits = $derived(screenshotWidth > 0 ? 1011 / screenshotWidth : 1);
  const scale = $derived(screenshotWidth / 1011);
  const holePadding = $derived(holePaddingPx * pxToUnits);
  const holeRadius = $derived(holeRadiusPx * pxToUnits);

  const hotspots = $derived(
    groups.map((g, i) => ({
      id: g.id,
      x: 32 * scale,
      y: groupCenterY[i] * scale,
    })),
  );
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
        {#each visibleHoles as a (a.id)}
          {@render outline(a)}
        {/each}
      </mask>
    </defs>
    <rect
      class="motion-safe:transition-opacity motion-safe:duration-150"
      class:opacity-0={!showMask}
      class:opacity-100={showMask}
      width="1011"
      height="740"
      fill="var(--color-selected-darkest, #d4d4d4)"
      fill-opacity="0.6"
      mask="url(#screenshot-annotations-mask)"
    />
  </svg>
  <div class="pointer-events-none absolute inset-0">
    {#each hotspots as h (h.id)}
      <button
        type="button"
        class="pointer-events-auto absolute size-2 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black ring-3 ring-white transition-shadow hover:ring-5"
        style="left: {h.x}px; top: {h.y}px"
        aria-label={h.id}
        onpointerenter={() => {
          maskedGroup = h.id;
          showMask = true;
        }}
        onpointerleave={() => (showMask = false)}
        onfocus={() => {
          maskedGroup = h.id;
          showMask = true;
        }}
        onblur={() => (showMask = false)}
      ></button>
    {/each}
  </div>
</div>
