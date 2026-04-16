<script lang="ts">
  import type { PrimitiveProps, PillConfig } from "../types";
  import { randBetween, randomOklch } from "../utils";
  import { untrack } from "svelte";

  let {
    x,
    y,
    config,
    seed = 0,
    onclick,
  }: PrimitiveProps<PillConfig> = $props();

  // ─── computeRadii inlined — scales outerR by each proportion ─────────────
  function computeRadii(
    outerR: number,
    proportions: [number, number, number],
  ): [number, number, number] {
    return proportions.map((p) => outerR * p) as [number, number, number];
  }

  // ─── State ────────────────────────────────────────────────────────────────
  interface Ring {
    halfH: number;
    halfW: number;
    fill: string;
  }

  let rings = $state<Ring[]>([]);
  let opacity = $state(1);

  function roll() {
    // halfH is the base unit — sizeRange drives height
    const halfH = randBetween(config.sizeRange) / 2;
    const ratio = randBetween(config.ratioRange);
    const halfW = halfH * ratio;

    // proportions scale both axes uniformly → nested pills
    const radii = computeRadii(halfH, config.ringProportions);

    // largest first so smaller rings paint on top
    rings = [...config.ringColors]
      .map((range, i) => ({
        halfH: radii[i],
        halfW: radii[i] * ratio,
        fill: randomOklch(range),
      }))
      .reverse();

    opacity = config.opacity ? randBetween(config.opacity) : 1;
  }

  $effect(() => {
    seed;
    untrack(() => roll());
  });

  // ─── Wiggle ───────────────────────────────────────────────────────────────
  let wiggling = $state(false);

  function handleClick() {
    wiggling = true;
    onclick?.();
  }
</script>

<!-- outer: position only -->
<g transform="translate({x}, {y})">
  <!-- inner: wiggle target -->
  <g
    class="primitive"
    class:wiggle={wiggling}
    onanimationend={() => (wiggling = false)}
    onclick={handleClick}
    role="button"
    style="cursor: pointer;"
    {opacity}
  >
    {#each rings as ring}
      <!--
        rx = ry = halfH of this ring → perfect semicircle ends
        rect is centred on 0,0
      -->
      <rect
        x={-ring.halfW}
        y={-ring.halfH}
        width={ring.halfW * 2}
        height={ring.halfH * 2}
        rx={ring.halfH}
        ry={ring.halfH}
        fill={ring.fill}
      />
    {/each}
  </g>
</g>

<style>
  .primitive {
    transform-box: fill-box;
    transform-origin: center;
  }

  @keyframes wiggle {
    0% {
      transform: rotate(0deg) scale(1);
    }
    20% {
      transform: rotate(-12deg) scale(1.15);
    }
    40% {
      transform: rotate(10deg) scale(0.95);
    }
    60% {
      transform: rotate(-6deg) scale(1.05);
    }
    80% {
      transform: rotate(4deg) scale(0.98);
    }
    100% {
      transform: rotate(0deg) scale(1);
    }
  }

  .wiggle {
    animation: wiggle 0.4s ease-in-out forwards;
  }
</style>
