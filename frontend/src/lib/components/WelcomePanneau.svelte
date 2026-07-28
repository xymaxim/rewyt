<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { Undo } from "lucide-svelte";

  interface Props {
    collapsing?: boolean;
    collapsingDuration?: number;
    seed?: number;
    debug?: boolean;
  }

  let {
    collapsing = false,
    collapsingDuration = 600,
    seed = $bindable(0),
    debug = false,
  }: Props = $props();

  const w = 600;
  const h = 320;
  const exclusion = { x: w / 2 - 200, y: h / 2 - 50, w: 400, h: 100 };
  const shapeKinds = [
    "selectedCircle",
    "rewindCircle",
    "playCircle",
    "highlightCircle",
    "highlightBar",
  ] as const;
  const shapeCount = shapeKinds.length;

  type Placement = { x: number; y: number; angle: number };

  function circleOverlapsRect(
    cx: number,
    cy: number,
    r: number,
    rx: number,
    ry: number,
    rw: number,
    rh: number,
  ): boolean {
    const nearestX = Math.max(rx, Math.min(cx, rx + rw));
    const nearestY = Math.max(ry, Math.min(cy, ry + rh));
    return Math.hypot(cx - nearestX, cy - nearestY) < r;
  }

  function randomizePlacements(
    radii: number[],
    kinds: readonly string[],
  ): Placement[] {
    const placed: { x: number; y: number; r: number }[] = [];

    return radii.map((r, idx) => {
      // Fall back to the least-bad candidate if no fully-clear spot is
      // found; avoiding the exclusion zone beats avoiding other shapes.
      let best = { x: w / 2, y: h / 2 };
      let bestHitsExclusion = true;
      let bestOtherOverlaps = Infinity;

      for (let attempt = 0; attempt < 1000; attempt++) {
        const nx = r + Math.random() * (w - r * 2);
        const ny = r + Math.random() * (h - r * 2);
        const hitsExclusion = circleOverlapsRect(
          nx,
          ny,
          r,
          exclusion.x,
          exclusion.y,
          exclusion.w,
          exclusion.h,
        );
        const otherOverlaps = placed.filter(
          (p) => Math.hypot(p.x - nx, p.y - ny) < p.r + r,
        ).length;

        if (!hitsExclusion && otherOverlaps === 0) {
          best = { x: nx, y: ny };
          bestHitsExclusion = false;
          bestOtherOverlaps = 0;
          break;
        }

        const isBetter =
          (bestHitsExclusion && !hitsExclusion) ||
          (hitsExclusion === bestHitsExclusion &&
            otherOverlaps < bestOtherOverlaps);

        if (isBetter) {
          best = { x: nx, y: ny };
          bestHitsExclusion = hitsExclusion;
          bestOtherOverlaps = otherOverlaps;
        }
      }

      placed.push({ x: best.x, y: best.y, r });

      const angle =
        kinds[idx] === "rewindCircle"
          ? -60 + Math.random() * 90
          : Math.random() * 360;

      return { x: best.x, y: best.y, angle };
    });
  }

  let gEls = $state<SVGGElement[]>([]);

  // A 0x0 bbox means the shape hasn't finished laying out yet; treating
  // that as radius 0 would disable its collision checks, so fall back to
  // the largest valid radius measured this pass instead.
  function measureRadii(): number[] {
    const boxes = gEls.map((g) => g.getBBox());
    const measured = boxes.map((box) =>
      box.width || box.height ? Math.hypot(box.width, box.height) / 2 : NaN,
    );
    const validMax = Math.max(0, ...measured.filter((r) => !Number.isNaN(r)));
    const fallback = validMax || 60;
    return measured.map((r) => (Number.isNaN(r) ? fallback : r));
  }

  let placements = $state<Placement[]>(
    Array.from({ length: shapeCount }, () => ({
      x: w / 2,
      y: h / 2,
      angle: 0,
    })),
  );
  let radii = $state<number[]>(Array.from({ length: shapeCount }, () => 0));
  let ready = $state(false);

  $effect(() => {
    seed;
    if (ready) {
      // untrack: reading gEls here would make this effect depend on it, and
      // placements changing re-renders the <g>s, rewriting gEls via
      // bind:this; causing an infinite loop. Only react to seed/ready.
      untrack(() => {
        radii = measureRadii();
        placements = randomizePlacements(radii, shapeKinds);
      });
    }
  });

  onMount(() => {
    // Wait a frame so layout settles before measuring, and so the first
    // placement animates in instead of snapping.
    requestAnimationFrame(() => {
      ready = true;
      radii = measureRadii();
      placements = randomizePlacements(radii, shapeKinds);
    });
  });
</script>

<div class="block overflow-visible" style:width="{w}px" style:height="{h}px">
  <svg
    width={w}
    height={h}
    viewBox="0 0 {w} {h}"
    class="block overflow-visible"
    style="--collapsing-duration: {collapsingDuration}ms;"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="rewind-gradient" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="var(--rewyt-selecting)" />
        <stop offset="50%" stop-color="var(--rewyt-selected)" />
      </linearGradient>
    </defs>

    {#snippet selectedCircle()}
      <circle r={40} fill="var(--rewyt-selecting)" />
      <circle r={3.2} fill="oklch(0 0 0)" />
    {/snippet}

    {#snippet rewindCircle()}
      <circle
        r={40}
        fill="url(#rewind-gradient)"
        class="clickable"
        role="button"
        tabindex="0"
        aria-label="Randomize layout"
        onclick={() => seed++}
        onkeydown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            seed++;
          }
        }}
      />
      <foreignObject
        x={-15}
        y={-15}
        width={30}
        height={30}
        style="pointer-events: none;"
      >
        <div xmlns="http://www.w3.org/1999/xhtml" class="icon-wrap">
          <Undo size={28} color="oklch(0.2 0 0)" />
        </div>
      </foreignObject>
    {/snippet}

    {#snippet playCircle()}
      <circle r={15} fill="var(--rewyt-play)" />
      <circle r={2.25} fill="oklch(0 0 0)" />
    {/snippet}

    {#snippet highlightCircle()}
      <circle r={20} fill="var(--rewyt-interval-light)" />
    {/snippet}

    {#snippet highlightBar()}
      <rect
        x={-5.25}
        y={-35}
        width={10.5}
        height={70}
        fill="var(--rewyt-interval-light)"
      />
    {/snippet}

    {#if debug}
      <rect
        x={exclusion.x}
        y={exclusion.y}
        width={exclusion.w}
        height={exclusion.h}
        fill="oklch(0 0 0 / 0.1)"
      />
    {/if}

    {#each shapeKinds as kind, i (i)}
      {@const snippets = {
        selectedCircle,
        rewindCircle,
        playCircle,
        highlightCircle,
        highlightBar,
      }}
      {@const content = snippets[kind]}
      <g
        bind:this={gEls[i]}
        class="slot"
        class:collapsed={collapsing}
        style:translate="{placements[i].x}px {placements[i].y}px"
        style:rotate="{placements[i].angle}deg"
      >
        {@render content(placements[i].angle)}
      </g>
    {/each}
  </svg>
</div>

<style>
  .slot {
    transition:
      translate var(--collapsing-duration) cubic-bezier(0.34, 1.56, 0.64, 1),
      rotate var(--collapsing-duration) cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-origin: center;
    transform-box: fill-box;
  }

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
