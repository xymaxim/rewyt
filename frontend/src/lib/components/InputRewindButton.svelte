<script lang="ts">
  import { Pen } from "lucide-svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  let {
    size = 40,
    iconSize = size / 2,
    class: className = "",
    ...rest
  }: {
    size?: number;
    iconSize?: number;
    class?: string;
  } & HTMLButtonAttributes = $props();
</script>

<button
  {...rest}
  type="button"
  style="width: {size}px; height: {size}px;"
  class="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-selected-light)] to-[var(--color-interval-light)] hover:cursor-pointer {className}"
>
  <Pen size={iconSize} />
</button>
