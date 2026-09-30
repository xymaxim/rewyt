<script lang="ts">
  import {
    ArrowDown,
    ArrowUp,
    ArrowUpRight,
    BookOpen,
    ChevronRight,
    EllipsisVertical,
    Undo,
    Play,
  } from "lucide-svelte";
  import InputRewindButton from "@rewyt-frontend/lib/components/InputRewindButton.svelte";
  import LandingPane from "/src/lib/components/LandingPane.svelte";
  import RewindPane from "/src/lib/components/RewindPane.svelte";
  import IntervalPane from "/src/lib/components/IntervalPane.svelte";
  import ScreenshotPane from "/src/lib/components/ScreenshotPane.svelte";
  import MoreAboutPane from "/src/lib/components/MoreAboutPane.svelte";
  import { version, releaseDate, downloads } from "$lib/release";
  import { Popover } from "bits-ui";
  import { page } from "$app/state";

  let playing = $state(false);
  let rewinding = $state(false);
  let copyOpen = $state(true);
  let etymologySourceOpen = $state(false);

  let selected = $state(0);
</script>

<div class="relative mt-4 flex flex-col items-center gap-4">
  <a
    href="https://video.liberta.vip/w/jSCtepm8BfAE6oZN7qJXB2?start=1m4s"
    target="_blank"
    rel="noopener noreferrer"
    class="flex cursor-pointer items-center gap-1 rounded-full border-2 border-black bg-transparent px-4 py-1 text-sm font-medium transition hover:bg-amber-200 hover:border-amber-200"
  >
    Watch a two-minute demo
  </a>
  <LandingPane bind:playing bind:rewinding>
    <div
      class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0 transition sm:gap-2"
      class:opacity-0={rewinding || playing}
      class:scale-50={rewinding || playing}
    >
      <h1 class="mb-4 text-center text-3xl font-normal sm:text-5xl">
        <p>Rewind & play</p>
        <p>YouTube live streams</p>
      </h1>
      <p class="text-normal px-6 text-center sm:text-lg">
        Rewyt is a desktop app for rewatching live streams beyond YouTube's
        limits
      </p>
    </div>
  </LandingPane>
</div>

<div class="mt-12 flex flex-col items-center gap-4">
  <div class="flex items-center gap-4">
    <a
      href="#get-rewyt"
      class="flex cursor-pointer items-center gap-1 rounded-3xl border-2 border-neutral-800 px-3 py-3 font-medium hover:border-[var(--color-selected)] hover:bg-[var(--color-selected)]"
    >
      Get Rewyt <ArrowDown />
    </a>
    <a
      href="https://xymaxim.github.io/rewyt/docs/quickstart/"
      class="flex cursor-pointer items-center gap-2 rounded-3xl border-2 border-neutral-800 px-3 py-3 font-medium hover:border-[var(--color-selected)] hover:bg-[var(--color-selected)]"
    >
      Quickstart
    </a>
  </div>
  <div class="flex flex-col items-center">
    <p>Available for Linux, macOS, and Windows</p>
    <p>
      <a
        href="https://xymaxim.github.io/rewyt/docs/disclaimer/"
        class="cursor-pointer font-medium text-[var(--color-selected-darker)] underline hover:no-underline"
        >Rewyt Usage Disclaimer</a
      >
    </p>
  </div>

  <div
    class="mt-10 mb-8 flex w-full max-w-[720px] flex-col items-center justify-center rounded-4xl px-4 text-2xl lg:px-0"
  >
    <p class="max-w-full items-baseline gap-1">
      With <span class="font-normal">Rewyt</span>, you can
      <span class="font-medium text-[var(--color-selected-darker)]">rewind</span
      >
      <Undo
        class="inline-block size-9 rounded-full bg-[var(--color-selected)] p-1"
      /> and
      <span class="whitespace-nowrap"
        ><span class="font-medium text-[var(--color-play)]">play</span>
        <Play
          class="inline-block size-9 rounded-full bg-[var(--color-play-lighter)] p-1"
        /></span
      >
      back past moments of ongoing YouTube live streams, far beyond the YouTube player
      limits.
      <span
        class="inline rounded-2xl bg-[var(--color-interval)] box-decoration-clone px-4 text-white"
        >Clip and save your favorite moments.</span
      >
      Share timestamps
      <span class="font-mono text-base font-medium tracking-tight"
        >HH:mm:ss</span
      > with others.
    </p>
  </div>

  <div class="flex w-full max-w-[720px] flex-col">
    <div
      class="relative mb-10 flex max-w-[720px] flex-col self-start rounded-2xl bg-[#FFE175]/0 px-4 text-left text-lg leading-snug lg:px-0"
    >
      <p class="text-2xl font-medium">rewyt</p>
      <!-- <p class="flex items-baseline">
           <span class="font-semibold">rewyt</span>
           <span class="ml-2 font-medium">/rɪˈwɪt/</span>
           </p> -->
      <ol class="pace-y-0">
        <li>
          1. <span class="shrink-0 italic">(n.)</span>
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
          > <em>navigation</em>, <em>voyage</em>
        </li>
        <li>
          2. <span class="shrink-0 italic">(v.)</span>
          to rewatch YouTube live streams, navigating through past moments
        </li>
      </ol>
    </div>
  </div>

  <div class="flex w-full flex-col items-center rounded-4xl px-4 py-10">
    <ScreenshotPane />
  </div>

  <div
    class="mb-10 flex w-full flex-col items-center gap-2 rounded-4xl bg-[var(--color-dark-background)] px-4 py-10 text-center md:py-20"
  >
    <!-- <div class="flex max-w-[720px] items-center">
           <div
           class="mb-6 flex size-16 rounded-full bg-[var(--color-selected)]"
           ></div>
           </div> -->
    <!-- <h3 class="text-3xl  font-medium text-[var(--color-selected-dark)]">
           Rewind past moments
         </h3> -->
    <div class="mb-10 max-w-[720px]">
      <p
        class="mb-8 inline max-w-1/2 rounded-2xl bg-[var(--color-selected)] box-decoration-clone px-4 text-2xl/tight text-black! text-neutral-200 sm:max-w-2/3 sm:text-2xl/tight"
      >
        Rewind a YouTube live stream and play it back. Watch specific moments
        you missed or browse the stream so far.
      </p>
    </div>
    <RewindPane bind:selected />
  </div>

  <div class="flex flex-col gap-2 px-4 md:flex-row">
    <div
      class="flex w-full max-w-[520px] flex-col items-center gap-2 rounded-4xl bg-[#FFE175] px-10 py-10! text-center sm:px-10"
    >
      <div class="mb-6 flex max-w-[720px] items-center self-start">
        <div class="flex size-16 rounded-full bg-[var(--color-interval)]"></div>
        <div class="flex size-16 rounded-full bg-[var(--color-interval)]"></div>
      </div>

      <div class="flex w-full max-w-[720px] flex-col items-center gap-6">
        <h3 class="self-start text-start text-3xl font-medium">
          Clip and save moments
        </h3>
        <p class="w-full self-start text-start text-xl leading-tight">
          Highlight an interval and save it as a video file with <a
            href="https://xymaxim.github.io/ypb/"
            class="rounded-2xl bg-[var(--color-interval)] px-1 text-white hover:bg-[var(--color-interval-light)] hover:text-black"
            >ypb</a
          >. Great for keeping the interesting moments.
        </p>
        <IntervalPane />
      </div>
    </div>

    <div
      class="flex w-full max-w-[520px] flex-col items-center gap-2 gap-6 rounded-4xl bg-[#FFE175] px-10 py-10 text-center"
    >
      <div
        class="flex h-16 items-center self-start text-start font-mono font-medium"
      >
        YYYY-MM-DDTHH:mm:ss
      </div>
      <h3 class="self-start text-start text-3xl font-medium">
        Share timestamps
      </h3>
      <p class="w-full self-start text-start text-xl leading-tight">
        Copy the timestamp of a moment you found, or paste one to jump right to
        it. Perfect for sharing with others.
      </p>

      <div
        class="mt-8 flex w-full max-w-[420px] flex-col gap-3 rounded-2xl bg-neutral-50 p-4 text-left shadow-lg"
        aria-hidden="true"
      >
        {#each [{ user: "LocalRailroadfan", msg: "​​M275 cleared CP98 @2026-09-26T05:51:00-04:00" }, { user: "AstroHuyToai2010", msg: "​Venus setting over the horizon (2026-09-28T19:40:00-10:00)" }, { user: "Katie-h2w", msg: "2026-09-28T20:36:27-10:00 やや右上↘赤く明るく" }] as row (row.user)}
          <div class="flex items-center gap-4">
            <div
              class="text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-300 text-sm font-medium"
            >
              {row.user.charAt(0)}
            </div>
            <p class="text-sm leading-tight">
              <span class="font-bold text-[var(--color-selected-darker)]"
                >@{row.user}</span
              >
              <span class="text-muted-foreground">{row.msg}</span>
            </p>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <MoreAboutPane />

  <div
    id="get-rewyt"
    class="flex w-full max-w-[720px] flex-col items-center gap-2 rounded-2xl px-4 py-4"
  >
    <h3 class="text-center text-2xl font-medium">Get Rewyt</h3>

    <p>Latest release: v{version}{releaseDate ? ` (${releaseDate})` : ""}</p>
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
            href={downloads.linux}
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
            href={downloads.macos}
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
            href={downloads.windows}
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
