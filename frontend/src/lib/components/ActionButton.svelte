<script lang="ts">
  import { fly } from "svelte/transition";
  import { Button } from "$lib/components/ui/button";
  import type { ButtonProps } from "$lib/components/ui/button";

  interface NotificationConfig {
    message: string;
    duration?: number;
  }

  interface Props extends Omit<ButtonProps, "onclick"> {
    notification: NotificationConfig;
    action: () => void | Promise<void>;
    children?: import("svelte").Snippet;
  }

  let {
    notification,
    action,
    children,
    disabled = false,
    ...buttonProps
  }: Props = $props();

  type State = {
    visible: boolean;
    loading: boolean;
    message: string;
  };

  let ui = $state<State>({
    visible: false,
    loading: false,
    message: "",
  });

  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function showBubble(message: string) {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    ui.message = message;
    ui.visible = true;

    timeoutId = setTimeout(() => {
      ui.visible = false;
      timeoutId = null;
    }, notification.duration ?? 2000);
  }

  async function handleClick() {
    if (ui.loading) return;
    ui.loading = true;

    try {
      await action();
      showBubble(notification.message);
    } catch (err) {
      showBubble(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      ui.loading = false;
    }
  }
</script>

<div class="relative inline-block">
  {#if ui.visible}
    <div
      role="status"
      aria-live="polite"
      transition:fly={{ y: -6, duration: 180 }}
      class="absolute bottom-full left-1/2 z-50 mb-2.5 -translate-x-1/2
                  rounded-lg bg-neutral-600 px-3 py-2
                  text-xs tracking-wide whitespace-nowrap text-white
                  shadow-md"
    >
      {ui.message}
    </div>
  {/if}

  <Button
    {...buttonProps}
    disabled={disabled || ui.loading}
    onclick={handleClick}
  >
    {#if ui.loading}
      <span
        class="mr-2 inline-block h-3 w-3 animate-spin rounded-full
                         border-2 border-current border-t-transparent"
      />
    {/if}
    {@render children?.()}
  </Button>
</div>
