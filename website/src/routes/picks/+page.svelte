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

  const subjects = [
    ...new Set(livePicks.map((p) => p.subject).filter(Boolean)),
  ].sort();

  const grouped = subjects.map((s) => ({
    subject: s,
    slug: s.toLowerCase().replace(/\s+/g, "-"),
    items: livePicks.filter((p) => p.subject === s),
  }));

  function subjectSlug(s: string): string {
    return s.toLowerCase().replace(/\s+/g, "-");
  }
</script>

<section class="mx-auto mt-6 max-w-4xl px-4">
  <h1 class="mb-4 text-3xl font-medium">Live Picks</h1>

  <p class="leading-relaxed">
      YouTube hosts many great live streams from all around the world. You can
      find feeding birds, erupting volcanoes, streaking meteor showers, and more.
      Here is a hand-picked selection of long-running streams we found interesting.
  </p>
  <p class="mt-2 text-sm text-[var(--color-muted-foreground)]">
    If a video isn't available, the stream has probably ended. You might find
    other related live streams on its channel.
  </p>

  <nav class="mt-6 flex flex-wrap gap-x-4 gap-y-1">
    {#each subjects as subject}
      <a
        href="#{subjectSlug(subject)}"
        class="text-[var(--color-rewind-darkest)]">{subject}</a
      >
    {/each}
  </nav>

  {#each grouped as group}
    <h2 id={group.slug} class="mt-8 mb-3 text-2xl font-medium">
      {group.subject}
    </h2>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {#each group.items as pick (pick.link)}
        {@const videoId = videoIdFromLink(pick.link)}
        <div class="flex flex-col rounded-xl bg-neutral-200/50 px-4 py-3">
          <span class="flex items-center gap-2">
            <a
              href={pick.link}
              target="_blank"
              rel="noopener noreferrer"
              class="text-lg leading-tight font-medium"
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
        </div>
      {/each}
    </div>
  {/each}
</section>
