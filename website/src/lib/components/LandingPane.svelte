<script lang="ts">
  import { Slider } from "bits-ui";
  import cn from "clsx";

  import Pill from "rewyt/src/lib/components/panneau/primitives/Pill.svelte";
  import Bead from "rewyt/src/lib/components/panneau/primitives/Bead.svelte";
  import Empty from "rewyt/src/lib/components/panneau/primitives/Empty.svelte";
  import Rectangle from "rewyt/src/lib/components/panneau/primitives/Rectangle.svelte";
  import GradientRectangle from "rewyt/src/lib/components/panneau/primitives/GradientRectangle.svelte";
  import AnimatedPanneau from "rewyt/src/lib/components/panneau/AnimatedPanneau.svelte";
  import { FastForward, Play, Square, Rewind } from "lucide-svelte";

  import type {
    PrimitiveDescriptor,
    OklchRange,
  } from "rewyt/src/lib/components/panneau/types";
  import {
    resolveRectangle,
    resolveBead,
    resolveEmpty,
  } from "rewyt/src/lib/components/panneau/resolvers";
  import {
    ellipseSkippedPositions,
    tanPositions,
  } from "rewyt/src/lib/components/panneau/positions";

  interface Props {
    playing?: boolean;
    rewinding?: boolean;
  }

  let { playing = $bindable(false), rewinding = $bindable(false) }: Props =
    $props();

  let seed = $state(0);

  let rewindValue = $state(10 * Math.PI);
  let playValue = $state(rewindValue);
  let animationValue = $state(rewindValue);

  let containerEl: HTMLDivElement;
  let containerWidth = $state(720);

  $effect(() => {
    if (!containerEl) return;
    const ro = new ResizeObserver(([entry]) => {
      containerWidth = entry.contentRect.width;
    });
    ro.observe(containerEl);
    return () => ro.disconnect();
  });

  const OKLCH_RANGE: OklchRange = {
    l: [0.8, 0.9],
    c: [0.1, 0.15],
    h: [0, 360],
  };

  const initialPrimitives: PrimitiveDescriptor[] = [
    {
      component: Pill,
      config: {
        sizeRange: [80, 80],
        ringProportions: [0.2, 0.4, 1.0],
        ringColors: [OKLCH_RANGE, OKLCH_RANGE, OKLCH_RANGE],
      },
      resolve: resolveBead,
    },
    {
      component: Bead,
      config: {
        sizeRange: [60, 60],
        ringProportions: [0.3, 1.0],
        ringColors: [OKLCH_RANGE, OKLCH_RANGE],
      },
      resolve: resolveBead,
    },
    {
      component: Bead,
      config: {
        sizeRange: [30, 30],
        ringProportions: [1.0],
        ringColors: [OKLCH_RANGE],
      },
      resolve: resolveBead,
    },
    {
      component: Rectangle,
      config: {
        sizeRange: [60, 70],
        ratioRange: [0.2, 0.2],
        angleRange: [0, 180],
        colorRange: OKLCH_RANGE,
      },
      resolve: resolveRectangle,
    },
    {
      component: GradientRectangle,
      config: {
        sizeRange: [70, 80],
        ratioRange: [0.6, 0.7],
        angleRange: [0, 180],
        colorRange: OKLCH_RANGE,
      },
      resolve: resolveRectangle,
    },
    // { component: Empty, config: {}, resolve: resolveEmpty },
    // { component: Empty, config: {}, resolve: resolveEmpty },
  ];

  function shuffle(arr: PrimitiveDescriptor[]): PrimitiveDescriptor[] {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  const primitives = $derived.by(() => {
    seed;
    return shuffle(initialPrimitives);
  });

  $effect(() => {
    if (playValue - 0.01 > 10 * Math.PI) {
      animationValue = 0;
      seed = 0;
    }
  });

  $effect(() => {
    if (!rewinding) {
      playValue = animationValue;
    }

    seed = Math.floor(playValue / Math.PI);
  });

  function slidingPositions({ n, cx, cy, rx, ry, nudges, angle }) {
    const cycle = Math.floor(angle / (1 * Math.PI));
    const isResting = cycle % 2 === 1;
    const angleInCycle = angle % (1 * Math.PI);

    return Array.from({ length: n }, (_, i) => {
      let k = nudges[i];
      const isEven = i % 2 === 0;

      const baseX =
        cx +
        (((isEven ? 1 : -1) * cx) / nudges[i]) *
          (isEven ? Math.sin(angleInCycle * k) : Math.cos(angleInCycle * k));
      const baseY = 40 + i * 65;

      return { x: baseX, y: baseY };
    });
  }
</script>

<div class="flex w-full flex-col items-center gap-4 px-4">
  <div
    bind:this={containerEl}
    class="relative w-full max-w-[720px] rounded-2xl {rewinding
      ? 'bg-[var(--color-rewind-lightest)]/50'
      : 'bg-[var(--color-rewind-lightest)]'} transition-colors"
  >
    <AnimatedPanneau
      class="relative {rewinding ? 'rewinding' : ''} {rewinding || playing
        ? '[&_svg]:overflow-hidden'
        : '[&_svg]:overflow-visible'}"
      {primitives}
      bind:angle={animationValue}
      width={containerWidth}
      height={containerWidth * (342 / 720)}
      rx={containerWidth * (300 / 720)}
      aspect={16 / 8}
      nudge={[1.0, 3.0]}
      {seed}
      getPositions={rewinding || playing
        ? (params) => slidingPositions({ ...params })
        : (params) => ellipseSkippedPositions({ ...params, skipCount: 2 })}
      collapsed={false}
      playing={playing && !rewinding}
      playSpeed={0.02}
    />

    <button
      class="absolute bottom-2 left-3 flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/70 outline-none active:scale-90"
      onclick={() => (playing = !playing)}
    >
      {#if playing && !rewinding}
        <Square size={24} />
      {:else if rewinding}
        {#if rewindValue <= playValue}
          <Rewind size={24} />
        {:else}
          <FastForward size={24} />
        {/if}
      {:else}
        <Play size={24} />
      {/if}
    </button>
  </div>

  <div class="mt-2 flex w-full max-w-[720px]">
    <Slider.Root
      type="single"
      bind:value={rewindValue}
      min={0}
      max={10 * Math.PI}
      step={0.01}
      thumbPositioning="exact"
      onpointerdown={() => {
        rewinding = true;
      }}
      onpointerup={() => {
        animationValue = rewindValue;
        playValue = rewindValue;
      }}
      onValueChange={(v) => {
        seed = Math.floor(v / Math.PI);
        animationValue = v;
      }}
      onValueCommit={() => (rewinding = false)}
      class="relative flex w-full touch-none items-center select-none"
    >
      <div
        class="absolute bottom-0 z-30 size-3.5 -translate-x-1/2 rounded-full bg-[var(--color-play-700)]"
        style="left: {(playValue / (10 * Math.PI)) * 100}%"
      ></div>

      <span
        class="relative h-2 w-full grow cursor-pointer overflow-hidden rounded-full bg-neutral-200/30"
      >
        <Slider.Range class="absolute inset-0 h-full w-full" />
      </span>

      <Slider.Thumb
        index={0}
        class="items-centerrelative top-2 z-20 block h-9 w-9 translate-y-full cursor-grab touch-none rounded-full border-16 border-[var(--color-rewind-light)] bg-black/80 outline-none select-none active:cursor-grabbing"
      ></Slider.Thumb>
    </Slider.Root>
  </div>
</div>

<style>
  :global(.rewinding .slot) {
    transition: none;
  }
  :global(.playing .slot.playing) {
    transition: none;
  }
</style>
