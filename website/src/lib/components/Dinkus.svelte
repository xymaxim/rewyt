<script lang="ts">
  import SelectedCircle from "@rewyt-frontend/lib/components/panneau/primitives/SelectedCircle.svelte";
  import RewindCircle from "@rewyt-frontend/lib/components/panneau/primitives/RewindCircle.svelte";
  import PlayCircle from "@rewyt-frontend/lib/components/panneau/primitives/PlayCircle.svelte";

  const cell = 82;
  const height = 100;
  const rowWidth = cell * 3;
</script>

<svg
  width={rowWidth}
  {height}
  viewBox="0 0 {rowWidth} {height}"
  class="h-18 w-auto"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
>
  <g transform="translate({cell / 2}, {height / 2})"><RewindCircle /></g>
  <g transform="translate({cell * 1.5}, {height / 2})"><SelectedCircle /></g>
  <g transform="translate({cell * 2.5}, {height / 2})"><PlayCircle /></g>
</svg>
