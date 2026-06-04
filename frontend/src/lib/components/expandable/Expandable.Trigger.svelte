<script lang="ts">
  import { getContext } from "svelte";
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    class?: string;
    disabled?: boolean;
  }

  let { children, class: className, disabled = false }: Props = $props();

  let context = getContext<{
    open: boolean;
    setOpen: (open: boolean) => void;
    trigger: "click" | "hover" | "both";
  }>("expandable");

  try {
    context = getContext("expandable");
    if (!context) {
      error = "Context is undefined";
    }
  } catch (e) {
    error = `Context error: ${e}`;
  }

  function handleClick() {
    if (disabled) return;
    if (context.trigger === "click" || context.trigger === "both") {
      context.setOpen(!context.open);
    }
  }

  function handleMouseEnter() {
    if (disabled) return;
    if (context.trigger === "hover" || context.trigger === "both") {
      context.setOpen(true);
    }
  }

  function handleMouseLeave() {
    if (disabled) return;
    if (context.trigger === "hover" || context.trigger === "both") {
      context.setOpen(false);
    }
  }
</script>

<button
  {disabled}
  onclick={handleClick}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  class="flex cursor-pointer items-center outline-none {className}"
  aria-expanded={context.open}
  aria-haspopup="true"
>
  {@render children()}
</button>
