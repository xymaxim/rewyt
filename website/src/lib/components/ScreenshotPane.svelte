<script lang="ts">
  import screenshot from "$lib/assets/screenshot.png";
  import annotations from "$lib/data/screenshot-annotations.json";
  import { layoutLabels, labelY } from "$lib/labelPlacement";
  import { MediaQuery } from "svelte/reactivity";
  import { EyeOff, MousePointer, Pointer } from "lucide-svelte";

  const labelledAnnotations = annotations.filter((a) => a.label);

  const groups = [...new Set(annotations.map((a) => a.group))].map((id) => {
    const items = annotations.filter((a) => a.group === id);
    const top = Math.min(...items.map((a) => a.bbox[1]));
    const bottom = Math.max(...items.map((a) => a.bbox[3]));
    return { id, bbox: [0, top, 1006, bottom], centerY: (top + bottom) / 2 };
  });

  const groupDepth = (g: (typeof groups)[number]) =>
    groups.filter(
      (o) => o.id !== g.id && o.bbox[1] <= g.bbox[1] && o.bbox[3] >= g.bbox[3],
    ).length;

  const labelsByGroup = new Map(
    groups.map((g) => [g.id, layoutLabels(labelledAnnotations, g)]),
  );

  const isRound = (a: (typeof annotations)[number]) => {
    const w = a.bbox[2] - a.bbox[0];
    const h = a.bbox[3] - a.bbox[1];
    const ratio = w / h;
    return ratio >= 0.85 && ratio <= 1.18;
  };

  const holePaddingPx = 5;
  const holeRadiusPx = 12;
  const maskRadius = 10;
  let screenshotWidth = $state(1006);

  let maskedGroup = $state<string | null>(null);
  let showMask = $state(false);
  let showHotspots = $state(false);

  const isMobile = new MediaQuery("(max-width: 639px)");
  const labelsVisible = $derived(
    isMobile.current ? maskedGroup !== null || showHotspots : showMask,
  );
  const hotspotsVisible = $derived(isMobile.current ? showHotspots : showMask);

  const visibleHoles = $derived(
    maskedGroup
      ? annotations.filter((a) => a.group === maskedGroup)
      : annotations,
  );
  const labelItems = $derived(
    maskedGroup ? (labelsByGroup.get(maskedGroup) ?? []) : [],
  );
  const numberedItems = $derived(
    labelItems.map((item, i) => ({ ...item, number: i + 1 })),
  );

  const pxToUnits = $derived(screenshotWidth > 0 ? 1011 / screenshotWidth : 1);
  const scale = $derived(screenshotWidth / 1011);
  const holePadding = $derived(holePaddingPx * pxToUnits);
  const holeRadius = $derived(holeRadiusPx * pxToUnits);
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="relative w-full max-w-[720px] py-6"
  onpointerenter={() => (showMask = true)}
  onpointerleave={() => (showMask = false)}
  onclick={(e) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (isMobile.current) {
      if (maskedGroup !== null || showHotspots) {
        maskedGroup = null;
        showHotspots = false;
      } else {
        showHotspots = true;
      }
    } else {
      maskedGroup = null;
    }
  }}
>
  <div class="relative" bind:clientWidth={screenshotWidth}>
    <img src={screenshot} alt="Rewyt screenshot" class="w-full shadow-lg" />
    {#snippet outline(a: (typeof annotations)[number])}
      {@const [x1, y1, x2, y2] = a.bbox}
      {#if isRound(a)}
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
      viewBox="0 0 1006 736"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <mask id="screenshot-annotations-mask">
          <rect
            width="1006"
            height="736"
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
        class:opacity-0={!labelsVisible}
        class:opacity-100={labelsVisible}
        mask="url(#screenshot-annotations-mask)"
      >
        <image
          href={screenshot}
          width="1006"
          height="736"
          preserveAspectRatio="none"
          filter="url(#screenshot-desaturate)"
        />
        <rect
          width="1006"
          height="736"
          fill="var(--color-selected-darkest)"
          fill-opacity="0.55"
        />
      </g>
      {#each labelItems as item (item.id)}
        <line
          x1={item.anchorX}
          y1={item.anchorY}
          x2={item.anchorX}
          y2={labelY(item)}
          stroke="var(--color-selected-light)"
          stroke-width="3"
          class="motion-safe:transition-opacity motion-safe:duration-150"
          class:opacity-0={!labelsVisible}
          class:opacity-100={labelsVisible}
        />
        <circle
          cx={item.anchorX}
          cy={item.anchorY}
          r={5}
          fill="black"
          stroke="white"
          stroke-width="3"
          class="motion-safe:transition-opacity motion-safe:duration-150"
          class:opacity-0={!labelsVisible}
          class:opacity-100={labelsVisible}
        />
      {/each}
    </svg>
    <div class="pointer-events-none absolute inset-0">
      {#each labelItems as item (item.id)}
        <span
          class="absolute z-100 hidden -translate-x-1/2 rounded-lg bg-black px-2 py-0.5 text-sm font-medium whitespace-nowrap text-white motion-safe:transition-opacity motion-safe:duration-150 sm:block"
          class:-translate-y-full={item.side === "top"}
          class:opacity-0={!labelsVisible}
          class:opacity-100={labelsVisible}
          style="left: {item.anchorX * scale}px; top: {labelY(item) * scale}px;"
        >
          {item.label}
        </span>
      {/each}
      {#each numberedItems as item (item.id)}
        <span
          class="absolute z-100 flex size-6 -translate-x-1/2 items-center justify-center rounded-full bg-black text-sm font-medium text-white motion-safe:transition-opacity motion-safe:duration-150 sm:hidden"
          class:-translate-y-full={item.side === "top"}
          class:opacity-0={!labelsVisible}
          class:opacity-100={labelsVisible}
          style="left: {item.anchorX * scale}px; top: {labelY(item) * scale}px;"
        >
          {item.number}
        </span>
      {/each}
      {#each groups as g (g.id)}
        {@const depth = groupDepth(g)}
        {@const isFocused = maskedGroup === g.id}
        {@const hotspotClass = isFocused
          ? "size-1 ring-9 ring-[var(--color-selected)]"
          : "size-1.5 ring-5 ring-[var(--color-selected-dark)]"}
        <button
          type="button"
          class="pointer-events-auto absolute inset-x-0 cursor-pointer"
          style="top: {g.bbox[1] * scale}px; height: {(g.bbox[3] - g.bbox[1]) *
            scale}px; z-index: {depth}"
          aria-label={g.id}
          onpointerenter={() => {
            if (isMobile.current) return;
            maskedGroup = g.id;
            showMask = true;
          }}
          onfocus={() => {
            if (isMobile.current) return;
            maskedGroup = g.id;
            showMask = true;
          }}
          onclick={() => {
            if (!isMobile.current) return;
            if (maskedGroup === g.id) {
              maskedGroup = null;
              showHotspots = false;
            } else {
              maskedGroup = g.id;
              showHotspots = true;
            }
          }}
          onblur={() => (showMask = false)}
        >
          <span
            class="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-black motion-safe:transition-[opacity,box-shadow] motion-safe:duration-150 {hotspotClass}"
            class:opacity-0={!hotspotsVisible}
            class:opacity-60={hotspotsVisible &&
              maskedGroup !== null &&
              !isFocused}
            class:opacity-100={hotspotsVisible &&
              (maskedGroup === null || isFocused)}
            style="left: {36 * scale}px; top: {(g.centerY - g.bbox[1]) *
              scale}px"
          ></span>
        </button>
      {/each}
    </div>
  </div>
</div>

{#if labelItems.length > 0}
  <ol class="mt-4 flex w-full max-w-[720px] flex-col gap-2 px-4 sm:hidden">
    {#each numberedItems as item (item.id)}
      <li class="flex items-center gap-2 text-sm">
        <span
          class="flex size-6 shrink-0 items-center justify-center rounded-full bg-black font-medium text-white"
          >{item.number}</span
        >
        <span>{item.label}</span>
      </li>
    {/each}
  </ol>
{/if}
{#if hotspotsVisible}
  <button
    type="button"
    aria-label="Hide annotations"
    class="mx-auto mt-4 flex size-10 items-center justify-center rounded-full bg-neutral-200/80 hover:bg-neutral-300 sm:hidden"
    onclick={() => {
      maskedGroup = null;
      showHotspots = false;
      showMask = false;
    }}
  >
    <EyeOff />
  </button>
{/if}

<div
  class="flex w-full max-w-[720px] items-center justify-center gap-2 select-none motion-safe:transition-opacity motion-safe:duration-150"
  class:opacity-0={labelsVisible}
  class:pointer-events-none={labelsVisible}
  class:hidden={isMobile.current && labelItems.length > 0}
>
  <span class="hidden sm:inline">Hover the screenshot to show annotations</span>
  <span class="sm:hidden">Tap the screenshot to show annotations</span>
</div>
