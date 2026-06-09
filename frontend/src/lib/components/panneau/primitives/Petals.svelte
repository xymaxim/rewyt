<script lang="ts">
  import type { PetalsResolved } from "../types";

  interface Props {
    x: number;
    y: number;
    resolved: PetalsResolved;
    onclick?: () => void;
  }

  let { x, y, resolved, onclick }: Props = $props();

  const { size, count, color, strokeWidth } = resolved;

  // Each line i is placed at angle (PI / count) * i to uniformly cover the circle
  const lines = Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI / count) * i;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const r = size / 2;
    return {
      x1: x - cos * r,
      y1: y - sin * r,
      x2: x + cos * r,
      y2: y + sin * r,
    };
  });
</script>

<g class="absolute z-1000" transform="translate({x}, {y})" {onclick}>
  {#each lines as line}
    <line
      x1={line.x1}
      y1={line.y1}
      x2={line.x2}
      y2={line.y2}
      stroke={color}
      stroke-width={strokeWidth}
      stroke-linecap="round"
    />
  {/each}
</g>
