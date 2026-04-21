<script lang="ts">
  import { onMount, getContext } from "svelte";

  interface Props {
    min?: number;
    max?: number;
    class: string;
  }

  const { min: propMin, max: propMax, class: className }: Props = $props();

  const context = getContext<{
    min: number;
    max: number;
    transition: number;
    seed: number;
  }>("tilter") ?? {
    min: -20,
    max: 20,
    transition: 600,
    seed: 0,
  };
  const min = propMin ?? context.min;
  const max = propMax ?? context.max;

  let angle: number = $state(0);

  const randAngle = () => Math.floor(Math.random() * (max - min + 1)) + min;

  $effect(() => {
    context.seed;
    angle = randAngle();
  });

  onMount(() => {
    angle = randAngle();
  });
</script>

<div class="flex {className}">
  <span
    class="inline-block"
    style="rotate: {angle}deg; transition: rotate {context.transition}ms ease-out;"
  >
    <slot />
  </span>
</div>
