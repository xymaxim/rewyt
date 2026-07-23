<script lang="ts">
 import WelcomeRows from "$lib/components/WelcomeRows.svelte";
 import WelcomePanneau from "$lib/components/WelcomePanneau.svelte";

 let containerEl = $state<HTMLDivElement>();
</script>

<div
    class="h-full w-full flex-col items-center justify-center rounded-2xl bg-[var(--rewyt-selected-lighter)]"
>
    <div bind:this={containerEl} class="h-full w-full">
        <WelcomePanneau />
    </div>
    <div class="absolute inset-0 overflow-hidden">
        <div class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-0 text-[3rem] font-light tracking-tighter text-foreground">
            <p>Rewind, play, highlight</p>
        </div>
    </div>
</div>
