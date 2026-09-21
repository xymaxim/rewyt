<script lang="ts">
  import { onMount } from "svelte";

  import Pill from "@rewyt-frontend/lib/components/panneau/primitives/Pill.svelte";
  import Bead from "@rewyt-frontend/lib/components/panneau/primitives/Bead.svelte";
  import Rectangle from "@rewyt-frontend/lib/components/panneau/primitives/Rectangle.svelte";
  import GradientRectangle from "@rewyt-frontend/lib/components/panneau/primitives/GradientRectangle.svelte";
  import {
    resolveBead,
    resolveRectangle,
  } from "@rewyt-frontend/lib/components/panneau/resolvers";
  import type {
    AnyResolved,
    OklchRange,
    PrimitiveDescriptor,
  } from "@rewyt-frontend/lib/components/panneau/types";

  const count = 3;
  const cell = 120;
  const height = 100;
  const rowWidth = count * cell;

  const oklchRange: OklchRange = {
    l: [0.8, 0.9],
    c: [0.1, 0.15],
    h: [0, 360],
  };

  const primitives: PrimitiveDescriptor[] = [
    {
      component: Pill,
      config: {
        sizeRange: [height - 20, height - 20],
        ringProportions: [0.4, 1.0],
        ringColors: [oklchRange, oklchRange],
      },
      resolve: resolveBead,
    },
    {
      component: Bead,
      config: {
        sizeRange: [30, 30],
        ringProportions: [1.0],
        ringColors: [oklchRange],
      },
      resolve: resolveBead,
    },
    {
      component: Rectangle,
      config: {
        sizeRange: [height - 20, height - 20],
        ratioRange: [0.2, 0.2],
        angleRange: [0, 180],
        colorRange: oklchRange,
      },
      resolve: resolveRectangle,
    },
    {
      component: GradientRectangle,
      config: {
        sizeRange: [70, 80],
        ratioRange: [0.6, 0.7],
        angleRange: [0, 180],
        colorRange: oklchRange,
      },
      resolve: resolveRectangle,
    },
  ];

  let picks = $state<
    { component: PrimitiveDescriptor["component"]; resolved: AnyResolved }[]
  >([]);

  onMount(() => {
    picks = [...primitives]
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map(({ component, config, resolve }) => ({
        component,
        resolved: resolve(config),
      }));
  });
</script>

<svg
  width={rowWidth}
  {height}
  viewBox="0 0 {rowWidth} {height}"
  class="h-16 w-auto"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
>
  {#each picks as { component: Primitive, resolved }, i (i)}
    <g transform="translate({cell / 2 + i * cell}, {height / 2})">
      <Primitive x={0} y={0} {resolved} />
    </g>
  {/each}
</svg>
