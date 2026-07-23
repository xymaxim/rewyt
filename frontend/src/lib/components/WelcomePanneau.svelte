<script lang="ts">
  import Bead from "$lib/components/panneau/primitives/Bead.svelte";
  import Empty from "$lib/components/panneau/primitives/Empty.svelte";
  import Rectangle from "$lib/components/panneau/primitives/Rectangle.svelte";
  import GradientRectangle from "$lib/components/panneau/primitives/GradientRectangle.svelte";
  import StaticPanneau from "$lib/components/panneau/StaticPanneau.svelte";
  import { OKLCH_RANGE } from "$lib/components/panneau/utils";
  import type { PrimitiveDescriptor } from "$lib/components/panneau/types";
  import {
    resolveRectangle,
    resolveBead,
    resolveEmpty,
  } from "$lib/components/panneau/resolvers";

  interface Props {
    collapsing: boolean;
    collapsingDuration: number;
    seed?: number;
  }

  let { collapsing, collapsingDuration, seed = 0 }: Props = $props();

  const initialPrimitives: PrimitiveDescriptor[] = [
    {
      component: Bead,
      config: {
        sizeRange: [80, 80],
        ringProportions: [0.08, 1.0],
        ringColors: [
          {
            l: [0, 0],
            c: [0, 0],
            h: [0, 0],
          },
          {
            l: [0.8841, 0.8841],
            c: [0.1675, 0.1675],
            h: [117.72, 117.72],
          },
        ],
      },
      resolve: resolveBead,
    },
    {
      component: Bead,
      config: {
        sizeRange: [80, 80],
        ringProportions: [1.0],
        ringColors: [
          {
            l: [0.8, 0.8],
            c: [0.1469, 0.1469],
            h: [83.99, 83.99],
          },
        ],
      },
      resolve: resolveBead,
    },
    {
      component: Bead,
      config: {
        sizeRange: [30, 30],
        ringProportions: [0.15, 1.0],
        ringColors: [
          {
            l: [0, 0],
            c: [0, 0],
            h: [0, 0],
          },
          {
            l: [0.69, 0.69],
            c: [0.2, 0.2],
            h: [19, 19],
          },
        ],
      },
      resolve: resolveBead,
    },

    {
      component: Bead,
      config: {
        sizeRange: [30, 30],
        ringProportions: [1.0],
        ringColors: [
          {
            l: [0.85, 0.85],
            c: [0.07, 0.07],
            h: [307, 307],
          },
        ],
      },
      resolve: resolveBead,
    },
    {
      component: Rectangle,
      config: {
        sizeRange: [60, 70],
        ratioRange: [0.2, 0.2],
        angleRange: [0, 180],
        colorRange: {
          l: [0.85, 0.85],
          c: [0.07, 0.07],
          h: [307, 307],
        },
      },
      resolve: resolveRectangle,
    },
    {
      component: GradientRectangle,
      config: {
        sizeRange: [60, 80],
        ratioRange: [0.5, 0.7],
        angleRange: [0, 180],
        colorRange: {
          l: [0.85, 0.85],
          c: [0.07, 0.07],
          h: [307, 307],
        },
      },
      resolve: resolveRectangle,
    },
    {
      component: Empty,
      config: {},
      resolve: resolveEmpty,
    },
    {
      component: Empty,
      config: {},
      resolve: resolveEmpty,
    },
  ];

  function shuffle(arr: PrimitiveDescriptor[]): PrimitiveDescriptor[] {
    const hasAdjacentEmpty = (shuffled: PrimitiveDescriptor[]) => {
      for (let i = 0; i < shuffled.length - 1; i++) {
        if (
          shuffled[i].component === Empty &&
          shuffled[i + 1].component === Empty
        ) {
          return true;
        }
      }
      return false;
    };

    let shuffled: PrimitiveDescriptor[];

    do {
      shuffled = [...arr].sort(() => Math.random() - 0.5);
    } while (hasAdjacentEmpty(shuffled));

    return shuffled;
  }

  const primitives = $derived.by(() => {
    seed;
    return shuffle(initialPrimitives);
  });
</script>

<StaticPanneau
  class="overflow-visible!"
  {primitives}
  width={620}
  height={342}
  rx={250}
  aspect={16 / 9}
  nudge={[-10, 0]}
  {seed}
  collapsed={collapsing}
  {collapsingDuration}
/>
