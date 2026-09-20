<script lang="ts">
  import screenshot from "$lib/assets/screenshot.png";
  import annotations from "$lib/data/screenshot-annotations.json";

  const holes = annotations.filter((a) => a.type !== "window");

  const groups = [...new Set(annotations.map((a) => a.group))].map((id) => {
    const items = annotations.filter((a) => a.group === id);
    const top = Math.min(...items.map((a) => a.bbox[1]));
    const bottom = Math.max(...items.map((a) => a.bbox[3]));
    return { id, bbox: [0, top, 1011, bottom], centerY: (top + bottom) / 2 };
  });

  const groupDepth = (g: (typeof groups)[number]) =>
    groups.filter(
      (o) => o.id !== g.id && o.bbox[1] <= g.bbox[1] && o.bbox[3] >= g.bbox[3],
    ).length;

  const holePaddingPx = 5;
  const holeRadiusPx = 12;
  const maskRadius = 10;
  let screenshotWidth = $state(1011);

  let maskedGroup = $state<string | null>(null);
  let showMask = $state(false);

  const visibleHoles = $derived(
    maskedGroup ? holes.filter((a) => a.group === maskedGroup) : holes,
  );

  const pxToUnits = $derived(screenshotWidth > 0 ? 1011 / screenshotWidth : 1);
  const scale = $derived(screenshotWidth / 1011);
  const holePadding = $derived(holePaddingPx * pxToUnits);
  const holeRadius = $derived(holeRadiusPx * pxToUnits);
</script>

<div
  class="relative mt-10 w-full max-w-[720px]"
  bind:clientWidth={screenshotWidth}
  onpointerenter={() => (showMask = true)}
  onpointerleave={() => (showMask = false)}
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
      <filter id="screenshot-desaturate">
        <feColorMatrix type="saturate" values="0" />
      </filter>
    </defs>
    <g
      class="motion-safe:transition-opacity motion-safe:duration-150"
      class:opacity-0={!showMask}
      class:opacity-100={showMask}
      mask="url(#screenshot-annotations-mask)"
    >
      <image
        href={screenshot}
        width="1011"
        height="740"
        preserveAspectRatio="none"
        filter="url(#screenshot-desaturate)"
      />
      <rect
        width="1011"
        height="740"
        fill="var(--color-selected-darkest, #d4d4d4)"
        fill-opacity="0.5"
      />
    </g>
  </svg>
  <div class="pointer-events-none absolute inset-0">
    {#each groups as g (g.id)}
      {@const depth = groupDepth(g)}
      <button
        type="button"
        class="group pointer-events-auto absolute inset-x-0 cursor-pointer"
        style="top: {g.bbox[1] * scale}px; height: {(g.bbox[3] - g.bbox[1]) *
          scale}px; z-index: {depth}"
        aria-label={g.id}
        onpointerenter={() => {
          maskedGroup = g.id;
          showMask = true;
        }}
        onfocus={() => {
          maskedGroup = g.id;
          showMask = true;
        }}
        onblur={() => (showMask = false)}
      >
        <span
          class="pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black ring-3 ring-white transition-shadow group-hover:ring-5 group-focus-visible:ring-5"
          style="left: {32 * scale}px; top: {(g.centerY - g.bbox[1]) * scale}px"
        ></span>
      </button>
    {/each}
  </div>
</div>
