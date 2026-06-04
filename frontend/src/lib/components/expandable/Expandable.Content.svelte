<script lang="ts">
  import { getContext } from "svelte";
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    class?: string;
  }

  let { children, class: className }: Props = $props();

  const context = getContext("expandable");
</script>

<div class="{context?.open ? '' : 'pointer-events-none hidden'} {className}">
  {@render children()}
</div>
