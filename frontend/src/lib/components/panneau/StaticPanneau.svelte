<script lang="ts">
  import { onMount } from "svelte";
  import type { AnyResolved } from "./types";
  import { randBetween } from "./utils";
  import { randomPositions } from "./positions";

  interface Props {
    primitives: PrimitiveDescriptor[];
    width?: number;
    height?: number;
    cy?: number;
    propSeed?: number;
    rx?: number;
    aspect?: number;
    nudge?: Range;
    collapsed?: boolean;
    collapsingDuration?: number;
    getPositions?: PositionFn;
    class?: string;
  }

  let {
    primitives,
    width = 640,
    height = 360,
    cy: propCy,
    propSeed = 0,
    rx: propRx,
    aspect = 1,
    nudge = [0, 0],
    collapsed = false,
    collapsingDuration = 600,
    getPositions = randomPositions,
    class: className = "",
  }: Props = $props();

  export type PositionParams = {
    n: number;
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    nudges: number[];
    angle: number;
    radii: number[];
  };

  export type PositionFn = (
    params: PositionParams,
  ) => { x: number; y: number }[];

  let ready = $state(false);

  const cx = $derived(width / 2);
  const cy = $derived(propCy ?? height / 2);
  const rx = $derived(propRx ?? width * 0.4);
  const ry = $derived(rx / aspect);

  const nudgeOffsets = $derived(primitives.map(() => randBetween(nudge)));

  const radii = $derived(
    primitives.map(({ config }) => {
      const c = config as any;
      if (c.sizeRange) return c.sizeRange[0] / 2;
      return 0;
    }),
  );

  const positionParams = $derived<PositionParams>({
    n: primitives.length,
    cx,
    cy,
    rx,
    ry,
    nudges: nudgeOffsets,
    angle: 0,
    radii,
  });

  const computedPositions = $derived(getPositions(positionParams));

  const positions = $derived(
    !ready || collapsed
      ? primitives.map(() => ({ x: cx, y: cy }))
      : computedPositions,
  );

  const resolved = $derived.by(() => {
    propSeed;
    return primitives.map(
      ({ config, resolve }) => resolve(config as any) as AnyResolved,
    );
  });

  onMount(() => {
    requestAnimationFrame(() => (ready = true));
  });
</script>

<div
  class="block {className}"
  style:width="{width}px"
  style:height="{height}px"
>
  <svg
    {width}
    {height}
    viewBox="0 0 {width} {height}"
    class="overflow-none block"
    style="--collapsing-duration: {collapsingDuration}ms;"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {#each primitives as { component: Primitive, onclick }, i (i)}
      <g
        class="slot"
        class:collapsed
        style="translate: {positions[i].x}px {positions[i].y}px;"
      >
        <Primitive x={0} y={0} resolved={resolved[i]} {onclick} />
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
