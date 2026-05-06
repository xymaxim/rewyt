<script lang="ts">
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: className }: Props = $props();

	const context = getContext('expandable');
</script>

<div class="{context?.open ? '' : 'hidden pointer-events-none'} {className}">
	{@render children()}
</div>



<!-- <script lang="ts">
     import { getContext } from 'svelte';
     import type { Snippet } from 'svelte';

     interface Props {
     children: Snippet;
     class?: string;
     }

     let { children, class: className }: Props = $props();

     const context = getContext('expandable');

     let contentWidth = $state(0);
     let contentElement: HTMLDivElement;

     $effect(() => {
     if (context?.open && contentElement) {
     contentWidth = contentElement.scrollWidth;
     } else {
     contentWidth = 0;
     }
     });
     </script>

     <div 
     bind:this={contentElement}
     class="overflow-hidden transition-all duration-300 {className}"
     style="width: {contentWidth}px;"
     >
     {@render children()}
     </div> -->
