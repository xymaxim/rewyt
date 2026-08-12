<script lang="ts">
  import { Pause, Play, Maximize, Minimize, Volume2, VolumeOff } from "lucide-svelte";
  import { Slider } from "bits-ui";
  import type { MediaPlayerClass } from "dashjs";
  import { clampSeekTarget, getSeekMargin } from "$lib/player.svelte";

  interface Props {
    videoEl: HTMLVideoElement | null;
    stageEl: HTMLElement | null;
    dashPlayer: MediaPlayerClass | null;
    onTogglePlayPause: () => void;
  }

  let { videoEl, stageEl, dashPlayer, onTogglePlayPause }: Props = $props();

  // Playback state
  let isPlaying = $state(false);
  let currentTime = $state(0);
  let duration = $state(1);

  // Seek/buffering state
  let bufferedPercent = $state(0);
  let seekValue = $state(0);
  let dragging = $state(false);
  let seekMargin = $state(5);

  // Volume state
  let isMuted = $state(true);

  // Fullscreen state
  let isFullscreen = $state(false);

  // Derived values
  const elapsed = $derived(formatElapsed(currentTime));

  // Formatting helpers
  function formatElapsed(seconds: number): string {
    const s = Math.max(0, Math.floor(seconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
  }

  // Playback event handlers
  function onPlay() {
    isPlaying = true;
  }

  function onPause() {
    isPlaying = false;
  }

  function onTimeUpdate() {
    updateSeekbar();
  }

  function updateSeekbar() {
    if (!videoEl) return;
    currentTime = videoEl.currentTime;
    if (!dashPlayer) return;

    const position = dashPlayer.timeInDvrWindow() ?? videoEl.currentTime;
    if (!dragging) seekValue = position;

    const d = dashPlayer.duration();
    if (Number.isFinite(d) && d > 0) duration = d;
    else if (videoEl.seekable.length > 0) duration = videoEl.seekable.end(0);

    seekMargin = getSeekMargin(dashPlayer);

    const buffer =
      dashPlayer.getDashMetrics()?.getCurrentBufferLevel("video") ?? 0;
    bufferedPercent =
      duration > 0 ? Math.min(((position + buffer) / duration) * 100, 100) : 0;
  }

  function onSeekCommit(value: number) {
    dragging = false;
    if (!dashPlayer || !videoEl) return;
    const dvr = dashPlayer.getDvrWindow();
    if (!dvr) {
      dashPlayer.seek(value);
      return;
    }
    videoEl.currentTime = clampSeekTarget(dvr.start + value, dashPlayer, dvr);
  }

  // Volume handlers
  function onVolumeChange() {
    if (videoEl) isMuted = videoEl.muted;
  }

  function toggleMute() {
    if (!videoEl) return;
    videoEl.muted = !videoEl.muted;
    isMuted = videoEl.muted;
  }

  // Fullscreen handlers
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

  // Effects
  $effect(() => {
    const el = videoEl;
    if (!el) return;
    isPlaying = !el.paused;
    currentTime = el.currentTime;
    isMuted = el.muted;
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("volumechange", onVolumeChange);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("volumechange", onVolumeChange);
    };
  });

  $effect(() => {
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  });
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
    class="pointer-events-auto absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-6 pt-8"
  >
    <Slider.Root
      type="single"
      bind:value={seekValue}
      min={0}
      max={Math.max(duration - seekMargin, 0)}
      step={0.1}
      onpointerdown={() => (dragging = true)}
      onValueCommit={(v) => onSeekCommit(v)}
      class="relative flex w-full touch-none items-center select-none"
    >
      <span
        class="relative h-1.5 w-full grow cursor-pointer overflow-hidden rounded-full bg-white/25"
      >
        <span
          class="absolute inset-y-0 left-0 bg-white/40"
          style="width: {bufferedPercent}%"
        ></span>
        <Slider.Range class="absolute inset-y-0 bg-white" />
      </span>
      <Slider.Thumb
        index={0}
        class="size-3 cursor-grab rounded-full bg-white shadow outline-none active:cursor-grabbing"
      ></Slider.Thumb>
    </Slider.Root>

    <div class="flex items-center justify-between gap-2 pt-2 pb-2">
      <span class="text-sm font-medium text-white tabular-nums">{elapsed}</span>
      <div class="flex items-center gap-2">
        <button
          type="button"
          title={isMuted ? "Unmute" : "Mute"}
          class="pointer-events-auto flex size-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/25"
          onclick={toggleMute}
        >
          {#if isMuted}
            <VolumeOff size={22} strokeWidth={2} />
          {:else}
            <Volume2 size={22} strokeWidth={2} />
          {/if}
        </button>
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
  </div>
</div>
