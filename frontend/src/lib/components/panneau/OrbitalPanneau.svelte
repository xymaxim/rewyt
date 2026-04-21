<script lang="ts">
  import { onMount } from "svelte";
  import type { PanneauProps, AnyResolved } from "./types";
  import { randBetween } from "./utils";

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
    orbiting?: boolean;
    orbitingSpeed?: number;
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
    orbiting = false,
    orbitingSpeed = 0.01,
    class: className = "",
  }: Props = $props();

  // State
  let seed = $state(propSeed);
  let ready = $state(false);
  let orbitAngle = $state(0);

  // Derived
  const cx = $derived(width / 2);
  const cy = $derived(propCy ?? height / 2);
  const rx = $derived(propRx ?? width * 0.4);

  const nudgeOffsets = $derived.by(() => {
    seed;
    return primitives.map(() => randBetween(nudge));
  });

  const orbitalPositions = $derived(
    getOrbitalPositions(
      primitives.length,
      cx,
      cy,
      rx,
      aspect,
      nudgeOffsets,
      orbitAngle,
    ),
  );

  const positions = $derived(
    !ready || collapsed
      ? primitives.map(() => ({ x: cx, y: cy }))
      : orbitalPositions,
  );

  const rotationSpeedRange = [-3, 3];
  const rotationSpeeds = $derived.by(() => {
    seed;
    return primitives.map(() => {
      let value = Math.floor(randBetween(rotationSpeedRange));
      while (value === 0) {
        value = Math.floor(randBetween(rotationSpeedRange));
      }
      return value;
    });
  });

  const rotations = $derived.by(() => {
    orbitAngle;
    return primitives.map((_, i) => {
      return orbitAngle * rotationSpeeds[i];
    });
  });

  const resolved = $derived.by(() => {
    seed;
    return primitives.map(
      ({ config, resolve }) => resolve(config as any) as AnyResolved,
    );
  });

  function getOrbitalPositions(
    n: number,
    cx: number,
    cy: number,
    rx: number,
    aspect: number,
    nudges: number[],
    angleOffset = 0,
  ): { x: number; y: number }[] {
    if (n === 0) return [];
    const ry = rx / aspect;
    return Array.from({ length: n }, (_, i) => {
      const angle = ((2 * Math.PI) / n) * i - Math.PI / 2 + angleOffset;
      return {
        x: cx + (rx + nudges[i]) * Math.cos(angle),
        y: cy + (ry + nudges[i]) * Math.sin(angle),
      };
    });
  }

  onMount(() => {
    requestAnimationFrame(() => (ready = true));

    let animationFrameId: number;
    const animate = () => {
      if (orbiting && !collapsed) {
        orbitAngle += orbitingSpeed;
      }
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animationFrameId);
  });
</script>

<div
  class="block overflow-hidden {className}"
  style:width="{width}px"
  style:height="{height}px"
>
  <svg
    {width}
    {height}
    viewBox="0 0 {width} {height}"
    class="block"
    style="--collapsing-duration: {collapsingDuration}ms;"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {#each primitives as { component: Primitive, onclick }, i (i)}
      <g
        class="slot"
        class:collapsed
        style="translate: {positions[i].x}px {positions[i]
          .y}px; rotate: {rotations[i]}rad;"
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
