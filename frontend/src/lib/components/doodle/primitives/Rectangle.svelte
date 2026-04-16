<script lang="ts">
  import { untrack } from "svelte";
  import type { PrimitiveProps, RectangleConfig } from "../types";
  import { randBetween, randFrom, randomOklch, oklch } from "../utils";

  let {
    x,
    y,
    config,
    seed = 0,
    onclick,
  }: PrimitiveProps<RectangleConfig> = $props();

  // ─── Resolved random values ───────────────────────────────────────────────
  let size = $state(0);
  let angle = $state(0);
  let color = $state("");
  let opacity = $state(1);
  let strokeWidth = $state(0);
  let rx = $state(0);
  let rectX = $state(0);
  let rectY = $state(0);
  let rectH = $state(0);
  let rectW = $state(0);

  function roll() {
    const h = randBetween(config.sizeRange);
    const w = h * randBetween(config.ratioRange);
    angle = randBetween(config.angleRange);
    color = randomOklch(config.colorRange);
    opacity = config.opacity ? randBetween(config.opacity) : 1;
    strokeWidth = config.strokeWidth ? randBetween(config.strokeWidth) : 0;
    rx = config.rounded ? randBetween(config.rounded) : 0;
    // rect is centred on 0,0 inside the inner <g>
    rectX = -w / 2;
    rectY = -h / 2;
    rectW = w;
    rectH = h;
  }

  $effect(() => {
    seed;
    untrack(() => roll());
  });

  const half = $derived(size / 2);

  // ─── Wiggle ───────────────────────────────────────────────────────────────
  let wiggling = $state(false);

  function handleClick() {
    wiggling = true;
    onclick?.();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_interactive_supports_focus -->
<g transform="translate({x}, {y})">
  <!-- inner: rotate + wiggle target -->
  <g
    transform="rotate({angle})"
    class="primitive"
    class:wiggle={wiggling}
    onanimationend={() => (wiggling = false)}
    onclick={handleClick}
    role="button"
    style="cursor: pointer;"
  >
    <rect
      x={rectX}
      y={rectY}
      width={rectW}
      height={rectH}
      {rx}
      fill={config.filled === false ? "none" : color}
      stroke={config.filled === false
        ? color
        : strokeWidth > 0
          ? color
          : "none"}
      stroke-width={strokeWidth}
      {opacity}
    />
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
