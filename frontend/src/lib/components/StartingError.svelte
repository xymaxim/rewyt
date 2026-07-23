<script lang="ts">
  import * as Alert from "$lib/components/ui/alert";

  interface Props {
    error: unknown;
    stdout: string;
  }

  let { error, stdout }: Props = $props();

  let message = $derived.by(() => {
    const raw = (error as any).message;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (parsed?.message) return parsed.message;
      } catch {}
    }
    return String(raw ?? error);
  });
</script>

<Alert.Root
  class="relative mt-2 min-w-[640px] gap-0 rounded-2xl border-0 bg-[var(--color-destructive)]/5"
>
  <Alert.Title
    class="mb-0 flex items-center gap-2 text-base text-[var(--color-destructive)]"
  >
    Stream start failed
  </Alert.Title>
  <Alert.Description class="mt-2 text-sm text-primary">
    <p class="text-sm"><span class="font-semibold">Error:</span> {message}</p>
    {#if stdout}
      <span class="font-semibold">Output:</span>
      <p class="max-h-36 overflow-y-auto whitespace-pre-wrap">{stdout}</p>
    {/if}
  </Alert.Description>
</Alert.Root>
