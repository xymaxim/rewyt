<script lang="ts">
  interface Props {
    x?: number;
    y?: number;
  }

  let { x = 0, y = 0 }: Props = $props();
</script>

<g transform="translate({x}, {y})">
  <circle r={40} fill="var(--color-selecting)" />
  <circle r={3} fill="oklch(0 0 0)" />
</g>
