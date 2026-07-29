<script lang="ts">
  import livePicks from "$lib/data/live-picks.json";

  function videoIdFromLink(link: string): string | null {
    try {
      const url = new URL(link);
      if (url.searchParams.has("v")) return url.searchParams.get("v");
      const match = url.pathname.match(/^\/live\/([a-zA-Z0-9_-]{11})/);
      if (match) return match[1];
      return null;
    } catch {
      return null;
    }
  }
</script>

<section class="mx-auto mt-6 max-w-4xl px-4">
  <h1 class="mb-4 text-3xl font-medium">Live Picks</h1>

  <p class="leading-relaxed">
    YouTube hosts many great live streams from all around the world. You can
    find feeding birds, erupting volcanoes, streaking meteor showers, and more.
    Here is a curated selection of the ones we found interesting.
  </p>
  <p class="text-sm mt-2 text-[var(--color-muted-foreground)]">If a video isn't available, the stream has likely ended. Check the channel for more videos.</p>

  <ul class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
    {#each livePicks as pick (pick.link)}
      {@const videoId = videoIdFromLink(pick.link)}
      <li class="flex flex-col rounded-xl bg-neutral-200/50 px-4 py-3">
        <span class="flex items-center gap-2">
          <a
            href={pick.link}
            target="_blank"
            rel="noopener noreferrer"
            class="text-lg font-medium leading-tight"
          >
            {pick.title}
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
        {#if videoId}
          <div
            class="relative mt-3 aspect-video w-full overflow-hidden rounded-lg"
          >
            <iframe
              class="absolute inset-0 h-full w-full"
              src="https://www.youtube.com/embed/{videoId}"
              allowfullscreen
              loading="lazy"
            ></iframe>
          </div>
        {/if}
      </li>
    {/each}
  </ul>
</section>
