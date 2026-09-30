<script lang="ts">
  import { Accordion } from "bits-ui";
  import { ChevronDown } from "lucide-svelte";

  const items: { value: string; title: string }[] = [
    {
      value: "responsible-use",
      title: "How to use it responsibly?",
    },
    {
      value: "how-it-works",
      title: "How does it work?",
    },
  ];
</script>

<div
  class="mb-15 flex w-full max-w-[720px] flex-col items-center gap-2 rounded-2xl px-4 py-4"
>
  <h3 class="text-center text-2xl font-medium">More about Rewyt</h3>

  <Accordion.Root type="single" class="mt-4 flex w-full flex-col gap-1">
    {#each items as item (item.value)}
      <Accordion.Item
        value={item.value}
        class="overflow-hidden rounded-2xl bg-[var(--color-selected-lighter)]"
      >
        <Accordion.Header level={3} class="m-0">
          <Accordion.Trigger
            class="group flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-lg font-medium transition"
          >
            {item.title}
            <ChevronDown
              size={20}
              class="shrink-0 group-data-[state=open]:rotate-180"
            />
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content
          class="overflow-hidden px-5 data-[state=closed]:hidden"
        >
          {#if item.value === "responsible-use"}
            {@render responsibleUse()}
          {:else if item.value === "how-it-works"}
            {@render howItWorks()}
          {/if}
        </Accordion.Content>
      </Accordion.Item>
    {/each}
  </Accordion.Root>
</div>

{#snippet responsibleUse()}
  <p class="py-2">
    Rewyt is built for personal use like watching streams and keeping favorite
    moments, not for redistributing content elsewhere. If you do share a clip or
    screenshot, please credit the creator and their channel. Also, don't forget
    to support the people you watch by subscribing, liking, and commenting directly on YouTube.
    Read the <a
      href="https://xymaxim.github.io/rewyt/docs/disclaimer/"
      class="font-medium text-[var(--color-selected-darkest)] underline hover:no-underline"
      >usage disclaimer</a
    > as well.
  </p>
{/snippet}

{#snippet howItWorks()}
  <p class="py-2">
    Rewyt runs on top of <a
      href="https://xymaxim.github.io/ypb/"
      class="font-medium text-[var(--color-selected-darkest)] underline hover:no-underline hover:text-[var(--color-selected-darker)]"
      >ypb</a
    >, a playback proxy that gives access to past moments in YouTube live
    streams. When you open a stream, ypb fetches its info with yt-dlp, including
    the media segment URLs. When you rewind to a moment, ypb generates a dynamic
    MPEG-DASH manifest that starts from that moment. The player then streams the
    video from YouTube through ypb. More in the
    <a
      href="https://xymaxim.github.io/rewyt/docs/overview/"
      class="font-medium text-[var(--color-selected-darkest)] underline hover:no-underline hover:text-[var(--color-selected-darker)]"
      >full overview</a
    >.
  </p>
{/snippet}
