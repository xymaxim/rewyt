<script lang="ts">
  import { Accordion } from "bits-ui";
  import { ChevronDown } from "lucide-svelte";

  const items = [
    {
      value: "responsible-use",
      title: "How to use it responsibly?",
      content:
        "Rewyt is built for personal use like watching streams and keeping favorite moments, not for redistributing content elsewhere. If you do share a clip or screenshot, please credit the creator and their channel. Also, don't forget to support the people you watch by subscribing to their channel and liking or commenting on YouTube.",
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
          class="overflow-hidden px-5 text-gray-700 data-[state=closed]:hidden"
        >
          <p class="py-2">{item.content}</p>
        </Accordion.Content>
      </Accordion.Item>
    {/each}
  </Accordion.Root>
</div>
