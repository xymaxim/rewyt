<script lang="ts">
  interface Props {
    collapsing?: boolean;
    collapsingDuration?: number;
    seed?: number;
  }

  let { collapsing = false, collapsingDuration = 600, seed = 0 }: Props = $props();

  const WIDTH = 620;
  const HEIGHT = 342;

  type Ring = { r: number; fill: string };
  type Shape =
    | { kind: "bead"; rings: Ring[] }
    | { kind: "rect"; width: number; height: number; color: string };
  type LayoutItem = { shape: Shape; radius: number; x: number; y: number; angle: number };

  const SHAPES: Shape[] = [
    {
      kind: "bead",
      rings: [
        { r: 80 / 2 * 0.08, fill: "oklch(0 0 0)" },
        { r: 80 / 2 * 1.0, fill: "oklch(0.884 0.168 117.7)" },
      ],
    },
    {
      kind: "bead",
      rings: [{ r: 80 / 2 * 1.0, fill: "oklch(0.800 0.147 84.0)" }],
    },
    {
      kind: "bead",
      rings: [
        { r: 30 / 2 * 0.15, fill: "oklch(0 0 0)" },
        { r: 30 / 2 * 1.0, fill: "oklch(0.690 0.200 19.0)" },
      ],
    },
    {
      kind: "bead",
      rings: [{ r: 30 / 2 * 1.0, fill: "oklch(0.850 0.070 307.0)" }],
    },
    {
      kind: "rect",
      width: 70 * 0.15,
      height: 70,
      color: "oklch(0.850 0.070 307.0)",
    },
  ];

  function shapeRadius(s: Shape): number {
    return s.kind === "bead" ? (s.rings.at(-1)?.r ?? 0) : Math.hypot(s.width, s.height) / 2;
  }

  function layout(): LayoutItem[] {
    const maxAttempts = 100;
    const placed: { x: number; y: number; r: number }[] = [];

    return SHAPES.map((shape) => {
      const r = shapeRadius(shape);
      let x = 0;
      let y = 0;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const nx = r + Math.random() * (WIDTH - r * 2);
        const ny = r + Math.random() * (HEIGHT - r * 2);
        if (!placed.some((p) => Math.hypot(p.x - nx, p.y - ny) < p.r + r)) {
          x = nx;
          y = ny;
          break;
        }
        x = nx;
        y = ny;
      }
      placed.push({ x, y, r });
      return { shape, radius: r, x, y, angle: Math.random() * 360 };
    });
  }

  let items = $state<LayoutItem[]>([]);

  $effect(() => {
    seed;
    items = layout();
  });
</script>

<div
  class="block overflow-visible!"
  style:width="{WIDTH}px"
  style:height="{HEIGHT}px"
>
  <svg
    width={WIDTH}
    height={HEIGHT}
    viewBox="0 0 {WIDTH} {HEIGHT}"
    class="overflow-none block"
    style="--collapsing-duration: {collapsingDuration}ms;"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {#each items as item, i (i)}
      <g
        class="slot"
        class:collapsed={collapsing}
        style="translate: {item.x}px {item.y}px; rotate: {item.angle}deg;"
      >
        {#if item.shape.kind === "bead"}
          {#each item.shape.rings.toReversed() as ring}
            <circle r={ring.r} fill={ring.fill} />
          {/each}
        {:else}
          <rect
            x={-item.shape.width / 2}
            y={-item.shape.height / 2}
            width={item.shape.width}
            height={item.shape.height}
            fill={item.shape.color}
          />
        {/if}
      </g>
    {/each}
  </svg>
</div>

<style>
  .slot {
    transition: translate var(--collapsing-duration)
      cubic-bezier(0.34, 1.56, 0.64, 1);
    transform-origin: center;
    transform-box: fill-box;
  }
</style>
