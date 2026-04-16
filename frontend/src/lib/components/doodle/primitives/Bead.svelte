<script lang="ts">
  import type { PrimitiveProps, BeadConfig } from "../types";
  import type { OklchRange } from "../types";
  import { randBetween, randomOklch } from "../utils";
  import { untrack } from "svelte";

  let {
    x,
    y,
    config,
    seed = 0,
    onclick,
  }: PrimitiveProps<BeadConfig> = $props();

  function computeRadii(
    outerR: number,
    proportions: [number, number, number],
  ): [number, number, number] {
    return proportions.map((p) => outerR * p) as [number, number, number];
  }

  let rings = $state<{ r: number; fill: string }[]>([]);
  let opacity = $state(1);
  let wiggling = $state(false);

  function roll() {
    const outerR = randBetween(config.sizeRange) / 2;
    const radii = computeRadii(outerR, config.ringProportions);
    rings = config.ringColors
      .map((range, i) => ({
        r: radii[i],
        fill: randomOklch(range),
      }))
      .reverse();
    opacity = config.opacity ? randBetween(config.opacity) : 1;
  }

  $effect(() => {
    seed;
    untrack(() => roll());
  });

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
      <circle r={ring.r} fill={ring.fill} />
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
