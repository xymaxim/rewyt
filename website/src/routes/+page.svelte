<script lang="ts">
  import {
    ArrowDown,
    ArrowUp,
    ArrowUpRight,
    BookOpen,
    ChevronRight,
    EllipsisVertical,
    Pen,
    TextCursor,
  } from "lucide-svelte";
  import LandingPane from "/src/lib/components/LandingPane.svelte";
  import RewindPane from "/src/lib/components/RewindPane.svelte";
  import IntervalPane from "/src/lib/components/IntervalPane.svelte";
  import ScreenshotPane from "/src/lib/components/ScreenshotPane.svelte";
  import MoreAboutPane from "/src/lib/components/MoreAboutPane.svelte";
  import { Popover } from "bits-ui";
  import { page } from "$app/state";
  import { formatLocalIso } from "$lib/time";

  let playing = $state(false);
  let rewinding = $state(false);
  let copyOpen = $state(true);
  let inputOpen = $state(true);
  let etymologySourceOpen = $state(false);

  let selected = $state(0);

  let selectedTimeIso = $derived(formatLocalIso(selected));
</script>

<div class="relative mt-4 flex flex-col items-center gap-4">
  <a
    href="https://video.liberta.vip/w/jSCtepm8BfAE6oZN7qJXB2?start=1m4s"
    target="_blank"
    rel="noopener noreferrer"
    class="flex cursor-pointer items-center gap-1 rounded-full border-1 border-[oklch(0.44_0.21_299)]/40 bg-[oklch(0.95_0.03_308)] px-2 py-0 text-sm font-medium text-[oklch(0.44_0.21_299)]! text-[var(--color-muted-foreground)] transition hover:bg-[oklch(0.85_0.07_307)]"
  >
    Watch a two-minute demo <ChevronRight size={14} strokeWidth={3} />
  </a>
  <LandingPane bind:playing bind:rewinding />
  <div
    class="pointer-events-none absolute inset-x-0 top-[-40px] bottom-0 flex flex-col items-center justify-center gap-0 transition sm:gap-2"
    class:opacity-0={rewinding || playing}
    class:scale-50={rewinding || playing}
  >
    <h1 class="mb-4 text-center text-3xl font-normal sm:text-5xl">
      <p>Rewind & play</p>
      <p>YouTube live streams</p>
    </h1>
    <p class="text-normal px-6 text-center">
      Rewyt is a desktop app for rewatching live streams beyond YouTube's limits
    </p>
  </div>
</div>

<div class="mt-12 flex flex-col items-center gap-4 px-4">
  <div class="flex items-center gap-4">
    <a
      href="#get-rewyt"
      class="flex cursor-pointer items-center gap-1 rounded-2xl bg-[var(--color-selected)] px-4 py-2.5 text-sm font-semibold transition hover:scale-105 hover:bg-[var(--color-selected-dark)] active:scale-95"
    >
      Get Rewyt <ArrowDown />
    </a>
    <a
      href="https://xymaxim.github.io/rewyt/docs/quickstart/"
      class="flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition hover:scale-105 active:scale-95"
    >
      Quickstart <BookOpen />
    </a>
  </div>
  <div class="flex flex-col items-center gap-1">
    <p class="text-sm">Available for Linux, macOS, and Windows</p>
    <p class="text-muted-foreground text-sm">
      <a
        href="https://xymaxim.github.io/rewyt/docs/disclaimer/"
        class="cursor-pointer font-medium text-[var(--color-selected-darkest)] underline hover:no-underline"
        >Rewyt Usage Disclaimer</a
      >
    </p>
  </div>

  <ScreenshotPane />

  <div
    class="mt-10 flex w-full max-w-[720px] flex-col rounded-2xl bg-amber-100 px-4 py-4 text-left sm:px-6"
  >
    <p class="flex items-baseline">
      <span class="text-xl font-extrabold">rewyt</span>
      <span class="ml-2 font-normal text-gray-500">/rɪˈwɪt/</span>
    </p>
    <ol class="mt-3 space-y-2 text-gray-700">
      <li>
        <span class="shrink-0 text-gray-500 italic">1. (n.)</span>
        from
        <Popover.Root bind:open={etymologySourceOpen}>
          <Popover.Trigger>
            {#snippet child({ props })}
              <span
                {...props}
                role="button"
                tabindex="0"
                class="cursor-pointer border-amber-700 font-medium text-amber-800 underline hover:no-underline"
                >Old English</span
              >
            {/snippet}
          </Popover.Trigger>
          <Popover.Content
            side="top"
            align="center"
            sideOffset={8}
            class="z-10 w-80 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-gray-600 shadow-lg md:w-100"
          >
            <p class="leading-tight">
              Thorpe, Benjamin. <em>Analecta Anglo-Saxonica</em>. John and
              Arthur Arch, 1834, p. 240.
              <a
                href="https://archive.org/details/analectaanglosa02thorgoog/page/240"
                target="_blank"
                rel="noopener noreferrer"
                class="ml-1 font-medium text-amber-700"
              >
                [archive.org]
              </a>
            </p>
          </Popover.Content>
        </Popover.Root>
        <em>"rewyt,"</em>
        <a
          href="https://archive.org/details/analectaanglosax00tho/page/240/mode/2up?q=rewyt"
          >meaning</a
        > <em>navigation</em>, <em>voyage</em>.
      </li>
      <li>
        <span class="shrink-0 text-gray-500 italic">2. (v.)</span>
        to rewatch YouTube live streams, navigating through past moments
      </li>
    </ol>
  </div>

  <div
    class="mb-15 flex w-full max-w-[720px] flex-col items-center gap-2 rounded-2xl px-4 py-5 text-center sm:px-10"
  >
    <h3 class="text-2xl font-medium text-[oklch(0.5952_0.1402_124.34)]">
      Rewyt past moments
    </h3>
    <p class="text-muted-foreground text-md mb-8 w-full font-medium md:w-2/3">
      Rewind through a YouTube live stream and play it back. Explore a stream or
      rewatch specific moments.
    </p>

    <RewindPane bind:selected />
  </div>

  <div
    class="mb-15 flex w-full max-w-[720px] flex-col items-center gap-2 rounded-2xl px-4 py-5 text-center sm:px-10"
  >
    <h3 class="text-2xl font-medium text-[oklch(0.5952_0.1402_124.34)]">
      Share timestamps
    </h3>
    <p class="text-muted-foreground text-md w-full font-medium md:w-2/3">
      Copy a timestamp for the moment you found, or paste one to jump right to
      it. Perfect for sharing with others.
    </p>
    <div class="mt-10 flex w-full max-w-120 items-end justify-between">
      <div class="flex -rotate-7 flex-col gap-2">
        <div
          class="rounded-xl border-1 border-neutral-300 bg-neutral-100/50 px-3 py-2 text-sm shadow-md"
          class:invisible={!copyOpen}
        >
          Copy timestamp
        </div>
        <div
          class="relative inline-flex h-11 w-9 items-center justify-center rounded-2xl bg-[oklch(0.9001_0.1264_120.7)] hover:cursor-pointer active:top-[1px]"
          onclick={() => (copyOpen = !copyOpen)}
        >
          <EllipsisVertical size={22} />
        </div>
      </div>

      <div class="flex rotate-3 flex-col items-center gap-2">
        <div
          class="rounded-2xl border-1 border-neutral-200 bg-neutral-100/50 p-4 shadow-md"
          class:invisible={!inputOpen}
        >
          <div
            class="inline-flex items-center rounded-xl border-1 border-neutral-300 bg-white px-8 py-2 text-sm"
          >
            {selectedTimeIso}<TextCursor size={18} class="hidden" />
          </div>
        </div>
        <div
          class="relative inline-flex size-12 items-center justify-center rounded-full bg-gradient-to-r from-[oklch(0.9001_0.1264_120.7)] to-[oklch(0.85_0.07_307)] hover:cursor-pointer active:top-[1px]"
          onclick={() => (inputOpen = !inputOpen)}
        >
          <Pen size={22} />
        </div>
      </div>
    </div>
  </div>

  <div
    class="mb-15 flex max-w-[720px] flex-col items-center gap-2 rounded-2xl bg-gradient-to-b from-[oklch(0.9547_0.0571_118.13)]/0 to-70% px-4 py-5 text-center sm:px-10"
  >
    <h3 class="text-2xl font-medium text-[oklch(0.5952_0.1402_124.34)]">
      Highlight and save clips
    </h3>
    <p class="text-muted-foreground text-md w-full font-medium md:w-2/3">
      Mark an interval and save it to a file with <a
        href="https://xymaxim.github.io/ypb/"
        class="inline-flex items-baseline gap-0.5 font-bold text-[#6d8c17]"
        ><ArrowUpRight size={14} />ypb</a
      >. Great for clipping and saving an interesting moment.
    </p>
    <IntervalPane />
  </div>

  <MoreAboutPane />

  <div
    id="get-rewyt"
    class="mb-15 flex w-full max-w-[720px] flex-col items-center gap-2 rounded-2xl px-0 py-4 sm:px-4"
  >
    <h3 class="text-center text-2xl font-medium">Get Rewyt</h3>

    <p>Latest version: v2026.9.9 (9 September 2026)</p>
    <div class="mt-4 flex w-full flex-col gap-6">
      <p>
        Not sure which to choose? <a
          href="https://xymaxim.github.io/rewyt/docs/guides/install/install/"
          class="font-medium text-[var(--color-selected-darkest)] underline hover:no-underline"
          >Compare the installation options</a
        >.
      </p>
      <div
        class="flex flex-col gap-2 rounded-2xl bg-[var(--color-selected-lighter)] p-4"
      >
        <p class="text-lg font-medium">Desktop app</p>
        <p>Download pre-built binaries. Requires yt-dlp, FFmpeg, etc.</p>
        <p>
          <a
            href="https://xymaxim.github.io/rewyt/docs/guides/install/desktop/"
            class="font-medium text-[var(--color-selected-darkest)] underline hover:no-underline"
            >Read the desktop guide</a
          >
        </p>
        <div class="mt-2 flex flex-col gap-2 md:flex-row md:gap-4">
          <a
            href="https://github.com/xymaxim/rewyt/releases/latest"
            class="relative flex flex-1 flex-col rounded-2xl bg-[var(--color-selected-lightest)] px-5 py-4 transition hover:bg-neutral-100"
          >
            <ArrowUpRight
              size={16}
              class="text-muted-foreground absolute top-5 right-3"
            />
            <span class="font-medium">Linux</span>
            <span class="text-muted-foreground text-sm">For x64</span>
          </a>
          <a
            href="https://github.com/xymaxim/rewyt/releases/latest"
            class="relative flex flex-1 flex-col rounded-2xl bg-[var(--color-selected-lightest)] px-5 py-4 transition hover:bg-neutral-100"
          >
            <ArrowUpRight
              size={16}
              class="text-muted-foreground absolute top-5 right-3"
            />
            <span class="font-medium">macOS</span>
            <span class="text-muted-foreground text-sm"
              >For Intel & Apple Silicon</span
            >
          </a>
          <a
            href="https://github.com/xymaxim/rewyt/releases/latest"
            class="relative flex flex-1 flex-col rounded-2xl border-0 border-neutral-200 bg-[var(--color-selected-lightest)] px-5 py-4 transition hover:bg-neutral-100"
          >
            <ArrowUpRight
              size={16}
              class="text-muted-foreground absolute top-5 right-3"
            />
            <span class="font-medium">Windows</span>
            <span class="text-muted-foreground text-sm">For x64</span>
          </a>
        </div>
      </div>

      <div
        class="flex flex-col gap-2 rounded-2xl bg-[var(--color-selected-lighter)] p-4"
      >
        <p class="text-lg font-medium">Compose</p>
        <p>Run it with Podman/Docker, everything included</p>
        <p>
          <a
            href="https://xymaxim.github.io/rewyt/docs/guides/install/web/"
            class="cursor-pointer font-medium text-[var(--color-selected-darkest)] underline hover:no-underline"
            >Read the Compose guide</a
          >
        </p>
      </div>
    </div>

    {#if page.url.hash === "#get-rewyt"}
      <a
        href={page.url.pathname}
        aria-label="Back to top"
        onclick={() => window.scrollTo({ top: 0 })}
        class="mx-auto mt-4 flex size-10 items-center justify-center rounded-full bg-neutral-200/80 hover:bg-neutral-300"
      >
        <ArrowUp />
      </a>
    {/if}
  </div>
</div>
