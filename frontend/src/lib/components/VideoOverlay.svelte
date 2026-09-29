<script lang="ts">
  import { Maximize2, Minimize2 } from "lucide-svelte";
  import type { MediaPlayerClass } from "dashjs";
  import type { StreamInfo } from "$lib/player.svelte";
  import PlayerControls from "./PlayerControls.svelte";

  interface Props {
    streamInfo: StreamInfo | null;
    videoEl: HTMLVideoElement | null;
    stageEl: HTMLElement | null;
    dashPlayer: MediaPlayerClass | null;
    isAtLiveEdge: boolean;
    onTogglePlayPause: () => void;
    onScreenshot: () => void | Promise<void>;
    onRewindToLive: () => void;
  }

  let {
    streamInfo,
    videoEl,
    stageEl,
    dashPlayer,
    isAtLiveEdge,
    onTogglePlayPause,
    onScreenshot,
    onRewindToLive,
  }: Props = $props();

  // Overlay flash state
  let overlayFlashing = $state(false);
  let flashTimer: ReturnType<typeof setTimeout> | null = null;
  const flashMs = 1000;

  let menuOpen = $state(false);

  // Fullscreen state
  let isFullscreen = $state(false);

  function onFullscreenChange() {
    isFullscreen = !!stageEl && document.fullscreenElement === stageEl;
  }

  function toggleFullscreen() {
    if (!stageEl) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      stageEl.requestFullscreen().catch(() => {});
    }
  }

  export function flashOverlay() {
    overlayFlashing = true;
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(() => {
      overlayFlashing = false;
      flashTimer = null;
    }, flashMs);
  }

  export function setMenuOpen(open: boolean) {
    menuOpen = open;
  }

  $effect(() => {
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  });
</script>

<div
  class="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
  class:opacity-100={overlayFlashing || menuOpen}
>
  {#if streamInfo}
    <div class="absolute top-3 left-3 flex flex-col items-start gap-0">
      <a
        href="https://www.youtube.com/watch?v={streamInfo.id}"
        class="text-md pointer-events-auto max-w-140 truncate rounded-full bg-[var(--color-video-overlay)] px-3 py-2 leading-tight font-semibold text-white hover:bg-[var(--color-video-overlay-hover)]"
        target="_blank"
        rel="noopener noreferrer">{streamInfo.title}</a
      >
      <a
        href="https://youtube.com/channel/{streamInfo.channelId}"
        class="pointer-events-auto max-w-140 truncate rounded-full bg-[var(--color-video-overlay)] px-3 py-2 text-sm font-medium text-neutral-100 hover:bg-[var(--color-video-overlay-hover)]"
        target="_blank"
        rel="noopener noreferrer">{streamInfo.channelTitle}</a
      >
    </div>
  {/if}

  <div class="absolute top-3 right-3">
    <button
      type="button"
      title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      class="pointer-events-auto flex size-10 items-center justify-center rounded-full bg-[var(--color-video-overlay)] text-white transition-colors hover:bg-[var(--color-video-overlay-hover)]"
      onclick={toggleFullscreen}
    >
      {#if isFullscreen}
        <Minimize2 size={22} strokeWidth={2} />
      {:else}
        <Maximize2 size={22} strokeWidth={2} />
      {/if}
    </button>
  </div>

  <PlayerControls
    {videoEl}
    {dashPlayer}
    {isAtLiveEdge}
    {isFullscreen}
    {onTogglePlayPause}
    {onScreenshot}
    {onRewindToLive}
    onMenuOpenChange={setMenuOpen}
  />
</div>
