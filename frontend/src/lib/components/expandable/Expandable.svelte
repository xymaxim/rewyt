<script lang="ts">
  import { setContext } from "svelte";
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    open?: boolean;
    trigger?: "click" | "hover" | "both";
    closeOnClickOutside?: boolean;
    onOpenChange?: (open: boolean) => void;
  }

  let {
    children,
    open: openProp = false,
    trigger = "click",
    closeOnClickOutside = true,
    onOpenChange,
  }: Props = $props();

  let open = $state(openProp);

  function setOpen(v: boolean) {
    open = v;
    onOpenChange?.(v);
  }

  setContext("expandable", {
    get open() {
      return open;
    },
    setOpen,
    trigger,
    closeOnClickOutside,
  });
</script>

<div class="flex">
  {@render children()}
</div>
