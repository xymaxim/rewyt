<script lang="ts">
  import { onMount, getContext } from "svelte";

  interface Props {
    text: string;
    min?: number;
    max?: number;
    gap?: string;
    class: string;
    onclick?: (value: string, index: number) => void;
  }

  const {
    text,
    min: propMin,
    max: propMax,
    gap: propGap,
    class: className,
    onclick,
  }: Props = $props();

  const context = getContext<{
    min: number;
    max: number;
    gap: string;
    transition: number;
    seed: number;
  }>("tilter") ?? { min: -20, max: 20, gap: "gap-2", transition: 0, seed: 0 };
  const min = propMin ?? context.min;
  const max = propMax ?? context.max;
  const gap = propGap ?? context.gap;

  type Token = { value: string; angle: number; id: string };
  let tokens: Token[] = $state([]);

  const randAngle = () => Math.floor(Math.random() * (max - min + 1)) + min;

  function randomize() {
    tokens = text
      .split(/\s+/)
      .filter(Boolean)
      .map((value, i) => ({
        value,
        angle: randAngle(),
        id: `${value}-${i}`,
      }));
  }

  $effect(() => {
    context.seed;
    randomize();
  });

  onMount(randomize);
</script>

<div class="flex {gap} {className}">
  {#each tokens as { value, angle, id }, i (id)}
    <span
      class="inline-block cursor-pointer"
      style="rotate: {angle}deg; transition: rotate {context.transition}ms ease-out;"
      onclick={() => onclick?.(value, i)}
    >
      {value}
    </span>
  {/each}
</div>
