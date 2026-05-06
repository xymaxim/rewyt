<script lang="ts">
 import { getContext } from 'svelte';
 import { Button } from "$lib/components/ui/button/index.js";
 import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
 import * as Dialog from "$lib/components/ui/dialog/index.js";
 import { Label } from "$lib/components/ui/label/index.js";
 import * as Select from "$lib/components/ui/select/index.js";
 import { Switch } from "$lib/components/ui/switch/index.js";
 import { ZOOM_LEVELS, type ZoomLevelKey } from "$lib/types";
 import * as Expandable from '$lib/components/expandable';
 import TimelineViewRange from "$lib/components/TimelineViewRange.svelte";
 import TimelineViewControl from "./TimelineViewControl.svelte";
 import {
     ArrowUpRight,
     ArrowDown,
     Camera,
     Circle,
     FastForward,
     Pause,
     Play,
     Rewind,
     Radio,
     RotateCcw,
     Settings,
     ZoomIn,
 } from "lucide-svelte";
 import { getExplorerContext } from "../explorer.svelte";
 import { clampViewRange } from "../utils/timelineUtils";
 import {
     UTC_OFFSETS,
     formatDateTime,
     formatOffset,
 } from "../utils/dateTimeUtils";
 import ActionButton from "./ActionButton.svelte";

 interface Props {
     isPlaying: boolean;
     playingTime: Date | null;
     isRewound: boolean;
     onTogglePlayPause: () => void;
     onStep: (seconds: number) => void;
     onRewind: (isoTime: string) => void;
     onRewindToLive: () => void;
     onReplay: () => void;
     onScreenshot: (ts: number) => void;
 }

 const {
     isPlaying,
     playingTime,
     isRewound,
     onReplay,
     onRewind,
     onRewindToLive,
     onScreenshot,
     onStep,
     onTogglePlayPause,
 }: Props = $props();

 const explorer = getExplorerContext();

 // Derived: check if playhead is outside current view
 const isPlayheadOutOfView = $derived.by(() => {
     if (playingTime === null || explorer.viewRange === null) return false;
     const pt = explorer.playheadTime;
     if (pt === null) return false;
     return pt < explorer.viewRange.start || pt > explorer.viewRange.end;
 });

 // State
 let timezoneDialogOpen = $state(false);
 let playheadSnapshot = $state<number | null>(null);
 let pendingOffsetValue = $state<string>("UTC+00:00");

 // Playhead
 function jumpToPlayhead() {
     if (playingTime === null) return;
     explorer.setViewRange(
         clampViewRange(
             playingTime.getTime(),
             explorer.zoomLevel,
             explorer.days,
             explorer.centeredOnMidnight,
         ),
     );
 }

 // Timezone dialog
 function openTimezoneDialog() {
     playheadSnapshot = explorer.playheadTime;
     pendingOffsetValue =
         UTC_OFFSETS.find((o) => o.offsetMinutes === explorer.timezoneOffset)
         ?.value ?? "UTC+00:00";
     timezoneDialogOpen = true;
 }

 function confirmTimezone() {
     const offset = UTC_OFFSETS.find((o) => o.value === pendingOffsetValue);
     if (offset) explorer.setTimezoneOffset(offset.offsetMinutes);
     timezoneDialogOpen = false;
 }

 function cancelTimezone() {
     timezoneDialogOpen = false;
 }

 function formatSnapshotTime(offsetMinutes: number): string {
     if (playheadSnapshot === null) return "";
     const d = new Date(playheadSnapshot + offsetMinutes * 60 * 1000);
     return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
 }

 const zoomKey = $derived(
     (Object.entries(ZOOM_LEVELS).find(
         ([, v]) => v === explorer.zoomLevel,
     )?.[0] ?? "1d") as ZoomLevelKey,
 );
</script>

<div class="mt-2 grid w-full gap-1" style="grid-template-columns: auto 1fr;">
  <!-- Center -->
    <div class="flex gap-2">
    {#if explorer.isRewinding}
      <div
        class="flex w-50 items-center justify-center gap-0.5 text-muted-foreground w-70"
      >
        <Circle size={6} strokeWidth={5} fill="none" />
        <Circle size={6} strokeWidth={5} fill="none" />
        <Circle size={6} strokeWidth={5} fill="none" />
      </div>
    {:else if playingTime !== null}
      <div
          class="flex cursor-pointer items-center gap-4 w-70"
      >
          {#if isPlaying}
              <div class="flex size-9 bg-rose-200 rounded-full items-center justify-center">
                  <Pause strokeWidth={2} />
              </div>
          {:else if explorer.isSliding}
              <div class="flex size-9 bg-[var(--rewyt-selected-300)] rounded-full items-center justify-center">
                  {#if explorer.selectedTime <= explorer.playheadTime}
                      <Rewind strokeWidth={2} />
                  {:else}
                      <FastForward strokeWidth={2} />
                  {/if}
              </div>
          {:else}
              <div class="flex size-9 bg-rose-200 rounded-full items-center justify-center">
                  <Play class="" strokeWidth={2} />
              </div>
              {/if}
          <div
              class="relative inline-flex gap-2 items-center justify-start! inline-block text-xl 
                     {isPlayheadOutOfView
              ? 'text-gray-300!'
              : 'text-foreground!'}"
              title="Jump to playhead"
              onclick={jumpToPlayhead}
          >
              <span class="flex items-center tabular-nums">
                  
          {formatDateTime(
                      playingTime.getTime(),
                      explorer.timezoneOffset,
                      false,
              )}
              </span>
              <span 
                  class="flex items-center h-9 w-10 justify-center rounded-full bg-neutral-200 text-sm"
                  onclick={openTimezoneDialog}
              >
                  {formatOffset(explorer.timezoneOffset)}
              </span>
              {#if isPlayheadOutOfView}
                  <span
                      class="absolute flex top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-9 justify-center items-center rounded-full bg-[var(--rewyt-play-200)] p-0.5 ring-2 ring-[var(--background)]"
                  >
                      <ArrowUpRight strokeWidth={2} class="text-foreground" />
                  </span>
              {/if}
          </div>
      </div>
    {:else}
      <span class="text-sm text-gray-400">Not playing</span>
    {/if}

    <!-- <div class="play-toolbar__group ml-4">
         <Button
         title={isPlaying ? "Pause" : "Play"}
         variant="ghost"
         size="icon"
         class="p-0! {isPlaying ? '!bg-[var(--rewyt-play-light)]' : ''}"
         onclick={onTogglePlayPause}
         >
         {#if isPlaying}<Pause class="size-4.5" />{:else}<Play
         class="size-4.5"
         />{/if}
         </Button>
         <Button title="Repeat" variant="ghost" size="icon" onclick={onReplay}>
         <RotateCcw class="size-4.5" />
         </Button>
         <ActionButton
         title="Take screenshot"
         action={() => onScreenshot(explorer.playheadTime)}
         notification={{ message: "Screenshot saved" }}
         variant="ghost"
         size="icon"
         >
         <Camera class="size-4.5" />
         </ActionButton>
         </div>
    -->
    <!-- <div class="play-toolbar__group items-center gap-2!">
         <Expandable.Root trigger='click' closeOnClickOutside={true} class="flex items-center gap-2">
         {@const context = getContext('expandable')}
         <Expandable.Trigger class="transition-none gap-0!">
         <div
         title="Mark A"
         class="flex h-9 w-6 items-center justify-center rounded-full text-sm font-bold bg-[var(--rewyt-play-300)]! transition-all tracking-tighter {context.open ? ' opacity-50 w-6! rotate-30' : ''}">
         </div>
         </Expandable.Trigger>
	 <Expandable.Content class="transition-all ease-in-out px-1">
         <div class="flex px-0 items-center transition-opacity {!context.open ? 'opacity-0' : ''}">
         <Button title="Repeat" variant="ghost" size="icon" onclick={onReplay} class="rounded-full bg-[var(--rewyt-play-300)]! size-9">
         <RotateCcw class="size-4.5" />
         </Button>
         <ActionButton
         title="Take screenshot"
         action={() => onScreenshot(explorer.playheadTime)}
         notification={{ message: "Screenshot saved" }}
         variant="ghost"
         size="icon"
         class="rounded-full bg-[var(--rewyt-play-300)]! size-9"
         >
         <Camera class="size-4.5" />
         </ActionButton>
         </div>
         </Expandable.Content>
         </Expandable.Root>
         </div> -->
    
        <div class="play-toolbar__group items-center gap-2!">
        <Expandable.Root trigger='click' closeOnClickOutside={true} class="flex items-center gap-2">
            {@const context = getContext('expandable')}
            <Expandable.Trigger class="transition-none gap-0!">
                <div
                    title="Mark interval"
                    class="flex size-9 w-10 items-center justify-center rounded-full text-sm font-bold bg-[var(--rewyt-interval-200)]/50! transition-all tracking-tighter {context.open ? ' opacity-50 -rotate-30' : ''}">
                    <span class="{context.open ? 'opacity-0' : ''} transition-opacity">AB</span>
                </div>
            </Expandable.Trigger>
	    <Expandable.Content class="transition-all ease-in-out px-1">
                <div class="flex px-0 items-center transition-opacity {!context.open ? 'opacity-0' : ''}">
                    <Button
                        title="Mark A"
                        variant="ghost"
                        size="icon"
                        class="size-9 flex rounded-full text-sm font-bold bg-[var(--rewyt-interval-200)]/50! tracking-wider"
                        onclick={() => {
                            if (explorer.playheadTime !== null)
                            explorer.assignMark("A", explorer.playheadTime);
                        }}
                        >
                        A
                    </Button
                    >
                    <Button
                        title="Mark A"
                        variant="ghost"
                        size="icon"
                        class="size-9 flex rounded-full text-sm font-bold bg-[var(--rewyt-interval-200)]/50! [word-spacing:10px]!"
                        onclick={() => {
                            if (explorer.playheadTime !== null)
                            explorer.assignMark("B", explorer.playheadTime);
                        }}
                        >
                        B
                    </Button
                    >
                </div>
            </Expandable.Content>
        </Expandable.Root>
        

        <!-- <Button
             title="Mark B"
             variant="ghost"
             size="icon"
             class="text-base font-bold"
             onclick={() => {
                     if (explorer.playheadTime !== null)
                     explorer.assignMark("B", explorer.playheadTime);
                     }}>B</Button
             > -->
        <div class="flex items-center transition-all ease-in-out">
            <Expandable.Root open={true} trigger='click' closeOnClickOutside={true} class="items-center">
                {@const isOpen = getContext('expandable').open}
                <Expandable.Trigger class="justify-end! transition-transform ease-in-out {isOpen ? '-rotate-30' : ''}">
                    <Button
                        title="Change zoom"
                        variant="ghost"
                        size="icon"
                        class="relative bg-[var(--color-view)]! text-xs font-black justify-center rounded-full h-9! w-10">
                        <span class="flex z-20 tracking-wider">{zoomKey}</span>
                    </Button>
            </Expandable.Trigger>
	    <Expandable.Content>
                <div class="flex px-2 items-center bg-neutral-200/0 h-9">
                    <TimelineViewControl />
                </div>
            </Expandable.Content>
            </Expandable.Root>
        </div>
        </div>
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                {#snippet child({ props })}
                    <Button {...props} title="Settings" variant="ghost" size="lg" class="rounded-full bg-neutral-200">
                        <Settings />
                    </Button>
                {/snippet}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" class="w-64 rounded-2xl!">
                <DropdownMenu.Group>
                    <DropdownMenu.Label
                        class="cursor-pointer text-xs font-medium text-muted-foreground"
                    >Rewinding</DropdownMenu.Label
                              >
                    <DropdownMenu.Item
                        class="flex w-full items-center justify-between"
                        onSelect={(e) => e.preventDefault()}
                        >
                        <Label
                            for="pauseafterrewind-toggle"
                            class="cursor-pointer font-normal">Pause after rewind</Label
                                                                                 >
                        <Switch
                            id="pauseafterrewind-toggle"
                            checked={explorer.pauseAfterRewind}
                            onCheckedChange={(v) => explorer.setPauseAfterRewind(v)}
                            />
                    </DropdownMenu.Item>
                </DropdownMenu.Group>

                <DropdownMenu.Separator />

                <DropdownMenu.Group>
                    <DropdownMenu.Label
                        class="cursor-pointer text-xs font-medium text-muted-foreground"
                    >Timeline</DropdownMenu.Label
                             >
                    <DropdownMenu.CheckboxItem
                        checked={!explorer.centeredOnMidnight}
                        onCheckedChange={() => explorer.setCenteredOnMidnight(false)}
                        class="cursor-pointer"
                        >
                        Center on noon
                    </DropdownMenu.CheckboxItem>
                    <DropdownMenu.CheckboxItem
                        checked={explorer.centeredOnMidnight}
                        onCheckedChange={() => explorer.setCenteredOnMidnight(true)}
                        class="cursor-pointer"
                        >
                        Center on midnight
                    </DropdownMenu.CheckboxItem>
                </DropdownMenu.Group>
            </DropdownMenu.Content>
        </DropdownMenu.Root>

        <Dialog.Root bind:open={timezoneDialogOpen}>
            <Dialog.Content class="max-w-sm [&_button[data-dialog-close]]:hidden">
                <Dialog.Header>
                    <Dialog.Title>Timezone</Dialog.Title>
                </Dialog.Header>

                <Select.Root type="single" bind:value={pendingOffsetValue}>
                    <Select.Trigger class="w-full">
                        {pendingOffsetValue}
                    </Select.Trigger>
                    <Select.Content class="z-1000 max-h-72">
                        {#each UTC_OFFSETS as offset}
                            <Select.Item value={offset.value} label={offset.label}>
                                <span class="tabular-nums">{offset.label}</span>
                                {#if playheadSnapshot !== null}
                                    <span class="ml-auto text-gray-400 tabular-nums">
                                        {formatSnapshotTime(offset.offsetMinutes)}
                                    </span>
                                {/if}
                            </Select.Item>
                        {/each}
                    </Select.Content>
                </Select.Root>

                <Dialog.Footer>
                    <Button variant="ghost" onclick={cancelTimezone}>Cancel</Button>
                    <Button variant="ghost" onclick={confirmTimezone}>OK</Button>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Root>

    </div>

  <!-- Right -->
  <div class="relative flex flex-row w-full justify-end gap-1 bg-neutral-200/0 rounded-2xl px-2 h-9">

  </div>
</div>

<style>
 @reference "tailwindcss";

 .play-toolbar {
     @apply inline-flex h-10! flex-row items-center gap-0 rounded-xl px-3;
 }

 .play-toolbar :global(button[data-slot="button"]) {
     @apply size-9 rounded-full bg-[var(--rewyt-play-light)] hover:bg-[var(--rewyt-play-light)]/50;
 }

 .play-toolbar__group {
     @apply flex items-center gap-0 h-10;
 }
</style>
