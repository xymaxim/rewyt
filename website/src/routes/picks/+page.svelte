<script lang="ts">
  import livePicks from "$lib/data/live-picks.json";
</script>

<section class="mx-auto mt-6 max-w-2xl px-4">
  <h1 class="mb-4 text-3xl font-normal">Live Picks</h1>

  <p class="mb-8 leading-relaxed">
    YouTube hosts many great live streams from all around the world. You can
    find feeding birds, erupting volcanoes, streaking meteor showers, and more.
    Here is a curated selection of the ones we found interesting.
  </p>

  <ul class="flex flex-col gap-4">
    {#each livePicks as pick (pick.link)}
      <li class="flex flex-col rounded-xl bg-neutral-100 px-4 py-3">
        <span class="flex items-center gap-2">
          <a
            href={pick.link}
            target="_blank"
            rel="noopener noreferrer"
            class="text-lg leading-tight font-medium"
          >
            {pick.title}
            {#if pick.status === "live"}
              <span class="inline-block h-2 w-2 rounded-full bg-red-500" />
            {/if}
          </a>
        </span>
        {#if pick.channelTitle}
          <a
            href={pick.channelLink}
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs"
          >
            {pick.channelTitle}
          </a>
        {/if}
        <p class="mt-1 leading-none text-[var(--color-muted-foreground)]">
          {pick.description}
        </p>
      </li>
    {/each}
  </ul>
</section>
