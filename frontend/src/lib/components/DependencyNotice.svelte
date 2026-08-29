<script lang="ts">
  import * as Alert from "$lib/components/ui/alert";

  interface Props {
    missingDependencies: string[];
  }

  let { missingDependencies }: Props = $props();

  let isMissingOne = $derived(missingDependencies.length === 1);
</script>

{#if missingDependencies.length > 0}
  <Alert.Root
    class="relative mt-2 min-w-[640px] gap-0 rounded-2xl border-0 bg-[var(--color-destructive)]/5"
  >
    <Alert.Title class="mb-0 flex text-base text-[var(--color-destructive)]">
      Missing required {isMissingOne ? "tool" : "tools"}
    </Alert.Title>
    <Alert.Description class="text-primary!">
      <p>
        The following {isMissingOne ? "tool" : "tools"} could not be found: {missingDependencies.join(
          ", ",
        )}.
      </p>
      <p>
        Please install {isMissingOne ? "it" : "them"} and make sure {isMissingOne
          ? "it is"
          : "they are"} available in your system PATH.
      </p>
    </Alert.Description>
  </Alert.Root>
{/if}
