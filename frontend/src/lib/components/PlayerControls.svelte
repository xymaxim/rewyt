<script lang="ts">
  import { Pause, Play, Maximize, Minimize } from "lucide-svelte";

  interface Props {
    videoEl: HTMLVideoElement | null;
    stageEl: HTMLElement | null;
    onTogglePlayPause: () => void;
  }

  let { videoEl, stageEl, onTogglePlayPause }: Props = $props();

  let isPlaying = $state(false);
  let currentTime = $state(0);
  let isFullscreen = $state(false);

  const elapsed = $derived(formatElapsed(currentTime));

  function formatElapsed(seconds: number): string {
    const s = Math.max(0, Math.floor(seconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
  }

  function onPlay() {
    isPlaying = true;
  }

  function onPause() {
    isPlaying = false;
  }

  function onTimeUpdate() {
    if (videoEl) currentTime = videoEl.currentTime;
  }

  function onFullscreenChange() {
    isFullscreen = !!stageEl && document.fullscreenElement === stageEl;
  }

  $effect(() => {
    const el = videoEl;
    if (!el) return;
    isPlaying = !el.paused;
    currentTime = el.currentTime;
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("timeupdate", onTimeUpdate);
    };
  });

  $effect(() => {
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  });

  function toggleFullscreen() {
    if (!stageEl) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      stageEl.requestFullscreen().catch(() => {});
    }
  }
</script>

<div
  class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100"
>
  <button
    type="button"
    title={isPlaying ? "Pause" : "Play"}
    class="pointer-events-auto flex size-16 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/35"
    onclick={onTogglePlayPause}
  >
    {#if isPlaying}
      <Pause size={36} strokeWidth={2} class="fill-current" />
    {:else}
      <Play size={36} strokeWidth={2} class="fill-current" />
    {/if}
  </button>

  <div
    class="pointer-events-auto absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-6 pt-8 pb-2"
  >
    <span class="text-sm font-medium text-white tabular-nums">{elapsed}</span>
    <button
      type="button"
      title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      class="pointer-events-auto flex size-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/25"
      onclick={toggleFullscreen}
    >
      {#if isFullscreen}
        <Minimize size={22} strokeWidth={2} />
      {:else}
        <Maximize size={22} strokeWidth={2} />
      {/if}
    </button>
  </div>
</div>
