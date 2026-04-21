<script lang="ts">
  import { setContext } from "svelte";

  interface Props {
    min: number;
    max: number;
    gap: string;
    transition: number;
    seed: number;
    class: string;
  }

  const {
    min = -20,
    max = 20,
    gap = "gap-6",
    transition = 600,
    seed = 0,
    class: className,
  }: Props = $props();

  let tilterContext = $state({ min, max, gap, transition, seed });

  $effect(() => {
    tilterContext.min = min;
    tilterContext.max = max;
    tilterContext.gap = gap;
    tilterContext.transition = transition;
    tilterContext.seed = seed;
  });

  setContext("tilter", tilterContext);
</script>

<div class={className}>
  <slot />
</div>
