<script lang="ts">
  interface Props {
    width?: number;
    height?: number;
    aspect?: number;
    ratios?: number[];
  }

  let {
    width = 500,
    height = 300,
    aspect = 1.2,
    ratios = [0.5, 0.5, 0.15],
  }: Props = $props();

  const centerX = width / 2;
  const centerY = height / 2;
  const baseRadius = height / 2;

  const colors = [
    "var(--rewyt-interval-light)",
    "var(--rewyt-selected)",
    "var(--rewyt-play-600)",
  ];
  const labels = ["Highlight", "Rewind", "Play"];

  const rings = ratios.map((ratio, index) => {
    const outerRatio = ratio;
    const innerRatio = ratios[index + 1] ?? 0;

    return {
      outerR: baseRadius * outerRatio,
      innerR: baseRadius * innerRatio,
      middleR: baseRadius * ((outerRatio + innerRatio) / 2),
      color: colors[index],
      label: labels[index],
    };
  });

  function arcPath(rx: number, ry: number, cx: number, cy: number): string {
    const x1 = cx - rx;
    const x2 = cx + rx;
    const y = cy;
    return `M ${x1} ${y} A ${rx} ${ry} 0 0 0 ${x2} ${y}`;
  }
</script>

<div
  class="flex items-center justify-center"
  style="width: {width}px; height: {height}px;"
>
  <svg {width} {height} viewBox="0 0 {width} {height}" class="-rotate-10">
    <defs>
      {#each rings as ring, index}
        {@const mx = index === 2 ? 10 : 1.2}
        {@const my = index === 2 ? 0 : 1}
        {@const rx = ring.middleR * aspect * mx}
        {@const ry = ring.middleR * my}
        <path
          id="arc-{index}"
          d={arcPath(rx, ry, centerX, centerY)}
          fill="none"
          stroke="blue"
          stroke-width="5"
        />
      {/each}
    </defs>

    {#each rings as ring, index}
      {@const w = 2 * ring.outerR * aspect}
      {@const h = 2 * ring.outerR + index * 10}
      <rect
        x={centerX - w / 2}
        y={centerY - h / 2}
        width={w}
        height={h}
        rx={h / 2}
        fill={ring.color}
      />
    {/each}

    {#each rings as ring, index}
      <text
        class="text-5xl"
        fill="black"
        text-anchor="middle"
        dominant-baseline="central"
        dy="0.4em"
      >
        <textPath href="#arc-{index}" startOffset="50%">
          {ring.label}
        </textPath>
      </text>
    {/each}
  </svg>
</div>

<style>
  svg {
    max-width: 100%;
    height: auto;
  }
  svg text,
  textPath {
    shape-rendering: geometricPrecision;
    text-rendering: geometricPrecision;
  }
</style>
