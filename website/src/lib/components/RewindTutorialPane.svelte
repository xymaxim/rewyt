<script lang="ts">
  import {
    ArrowLeft,
    ArrowRight,
    Check,
    ChevronLeft,
    ChevronRight,
    Circle,
  } from "lucide-svelte";
  import type { Explorer } from "@rewyt-frontend/lib/explorer.svelte";
  import { ZOOM_LEVELS } from "@rewyt-frontend/lib/types";

  let {
    explorer,
    lastRewindSource,
    lastRewindTarget,
  }: {
    explorer: Explorer;
    lastRewindSource: "timeline" | "button" | null;
    lastRewindTarget: number | null;
  } = $props();

  type Part = { text: string; b?: boolean };
  type Substep = { parts: Part[]; met: () => boolean };
  type Tutorial = {
    title: string;
    description: string;
    success: string;
    steps: { substeps: Substep[] }[];
  };

  const plain = (text: string): Part => ({ text });
  const bold = (text: string): Part => ({ text, b: true });

  const tutorialClickTime = "12:00";
  const tutorialSliderTime = "03:00";
  const zoom1hTime = "03:14";
  const zoom10mTime = "03:14:15";

  const targetDayStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate() - 3,
  ).getTime();
  const targetDayLabel = new Date(targetDayStart).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    },
  );

  let tutorialOpen = $state(true);
  let tutorialIndex = $state(0);

  function pad(n: number): string {
    return String(n).padStart(2, "0");
  }

  function localHms(ts: number): string {
    const d = new Date(ts);
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  function isTargetDay(ts: number): boolean {
    const d = new Date(ts);
    const t = new Date(targetDayStart);
    return (
      d.getFullYear() === t.getFullYear() &&
      d.getMonth() === t.getMonth() &&
      d.getDate() === t.getDate()
    );
  }

  const onTargetDay = $derived(
    explorer.selectedTime != null && isTargetDay(explorer.selectedTime),
  );

  const selectedHms = $derived(
    explorer.selectedTime != null ? localHms(explorer.selectedTime) : null,
  );

  const selectedAt = (hms: string) =>
    onTargetDay && selectedHms?.slice(0, hms.length) === hms;

  const rewoundBy = (source: "timeline" | "button", hms: string) =>
    lastRewindSource === source &&
    lastRewindTarget != null &&
    isTargetDay(lastRewindTarget) &&
    localHms(lastRewindTarget).slice(0, 5) === hms;

  const zoomIs = (key: "1h" | "10m") => explorer.zoomLevel === ZOOM_LEVELS[key];

  const tutorials: Tutorial[] = [
    {
      title: "Rewind by clicking the timeline",
      description:
        "Click on the timeline to rewind and play from the moment in one action.",
      success: `Great!`,
      steps: [
        {
          substeps: [
            {
              parts: [
                plain("Go to "),
                bold(targetDayLabel),
                plain(" with the days slider"),
              ],
              met: () => onTargetDay,
            },
          ],
        },
        {
          substeps: [
            {
              parts: [plain("Click the timeline at "), bold(tutorialClickTime)],
              met: () => rewoundBy("timeline", tutorialClickTime),
            },
          ],
        },
      ],
    },
    {
      title: "Rewind by pressing the rewind button",
      description: "Choose a moment on the timeline before rewinding to it",
      success: `Great!`,
      steps: [
        {
          substeps: [
            {
              parts: [
                plain("Drag the rewind slider to "),
                bold(tutorialSliderTime),
                plain(` on ${targetDayLabel}`),
              ],
              met: () => selectedAt(tutorialSliderTime),
            },
          ],
        },
        {
          substeps: [
            {
              parts: [plain("Click the rewind button")],
              met: () => rewoundBy("button", tutorialSliderTime),
            },
          ],
        },
      ],
    },
    {
      title: "Navigate by zooming in",
      description: "Zoom in on the timeline to navigate with greater precision",
      success: `Great!`,
      steps: [
        {
          substeps: [
            {
              parts: [
                plain("Go to "),
                bold(targetDayLabel),
                plain(" with the days slider,"),
              ],
              met: () => onTargetDay,
            },
            {
              parts: [plain("select "), bold(tutorialSliderTime)],
              met: () => selectedAt(tutorialSliderTime),
            },
          ],
        },
        {
          substeps: [
            {
              parts: [plain("Zoom to "), bold("1h"), plain(",")],
              met: () => zoomIs("1h"),
            },
            {
              parts: [plain("select "), bold(zoom1hTime)],
              met: () => selectedAt(zoom1hTime),
            },
          ],
        },
        {
          substeps: [
            {
              parts: [plain("Zoom to "), bold("10m"), plain(",")],
              met: () => zoomIs("10m"),
            },
            {
              parts: [plain("select "), bold(zoom10mTime)],
              met: () => selectedAt(zoom10mTime),
            },
          ],
        },
      ],
    },
  ];

  const progress = $derived.by(() => {
    const substeps = tutorials.map((tut) =>
      tut.steps.map((step) => step.substeps.map((sub) => sub.met())),
    );
    return {
      substeps,
      steps: substeps.map((steps) => steps.map((subs) => subs.every(Boolean))),
      starts: substeps.map((steps) => steps.map((subs) => subs[0])),
    };
  });

  let done = $state(tutorials.map((tut) => tut.steps.map(() => false)));
  let started = $state(tutorials.map((tut) => tut.steps.map(() => false)));

  $effect(() => {
    progress.steps.forEach((steps, ti) =>
      steps.forEach((met, si) => {
        if (met) done[ti][si] = true;
      }),
    );
    progress.starts.forEach((steps, ti) =>
      steps.forEach((met, si) => {
        if (met) started[ti][si] = true;
      }),
    );
  });

  const tutorialsView = $derived.by(() =>
    tutorials.map((tut, ti) => {
      const steps = tut.steps.map((step, si) => {
        const isLast = si === tut.steps.length - 1;
        const frozen = isLast
          ? done[ti][si]
          : started[ti][si + 1] && done[ti][si];
        return {
          complete: progress.steps[ti][si] || frozen,
          substeps: step.substeps.map((sub, xi) => ({
            parts: sub.parts,
            seen: progress.substeps[ti][si][xi] || frozen,
          })),
        };
      });
      return {
        title: tut.title,
        description: tut.description,
        success: tut.success,
        steps,
        allDone: steps.every((s) => s.complete),
      };
    }),
  );

  const current = $derived(tutorialsView[tutorialIndex]);
  const currentDone = $derived(current.allDone);
</script>

{#snippet stepMarker(complete: boolean)}
  {#if complete}
    <span
      class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-white"
    >
      <Check size={14} strokeWidth={3} />
    </span>
  {:else}
    <Circle size={20} class="text-muted-foreground mt-0.5 shrink-0" />
  {/if}
{/snippet}

<div class="mt-10 flex w-full flex-col items-start">
  <button
    type="button"
    class="flex w-full items-center justify-between gap-2 text-left hover:cursor-pointer"
    onclick={() => (tutorialOpen = !tutorialOpen)}
  >
    <span class="flex flex-col items-start">
      <span class="text-lg font-semibold text-[var(--color-selected-darker)]">
        {tutorialOpen ? "Hide the tour" : "Take the tour"}
      </span>
      <span class="text-muted-foreground">
        Learn how to rewind and jump through the timeline
      </span>
    </span>
    {#if tutorialOpen}
      <ArrowLeft size={28} class="shrink-0" />
    {:else}
      <ArrowRight size={28} class="shrink-0" />
    {/if}
  </button>

  {#if tutorialOpen}
    <div class="mt-3 w-full rounded-2xl bg-neutral-200/50 p-4 text-left">
      <div class="flex gap-1.5">
        {#each [0, 1, 2] as i (i)}
          <span
            class="h-1.5 flex-1 rounded-full"
            class:bg-[var(--color-selected-dark)]={i <= tutorialIndex}
            class:bg-neutral-300={i > tutorialIndex}
          ></span>
        {/each}
      </div>

      <div class="mt-2 text-sm font-semibold">
        Tutorial {tutorialIndex + 1} of 3
      </div>

      <div>
        <div class="flex items-center justify-between text-lg font-semibold">
          <span>{current.title}</span>
        </div>
        <p class="text-muted-foreground mt-1 text-sm">{current.description}</p>
        <ol class="mt-2 flex flex-col gap-2">
          {#each current.steps as step, si (si)}
            <li class="flex items-start gap-3">
              {@render stepMarker(step.complete)}
              <span>
                {#each step.substeps as sub, xi (xi)}
                  {#if xi > 0}&nbsp;{/if}
                  <span
                    class:text-muted-foreground={sub.seen}
                    class:line-through={sub.seen}
                  >
                    {#each sub.parts as part, pi (pi)}
                      {#if part.b}<b>{part.text}</b>{:else}{part.text}{/if}
                    {/each}
                  </span>
                {/each}
              </span>
            </li>
          {/each}
        </ol>
        {#if currentDone}
          <p class="mt-2 text-sm font-medium text-green-700">
            {current.success}
          </p>
        {/if}
      </div>

      <div class="mt-4 flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous tutorial"
          class="flex size-10 items-center justify-center rounded-full bg-neutral-200/80 hover:bg-neutral-300 disabled:pointer-events-none disabled:opacity-40"
          disabled={tutorialIndex === 0}
          onclick={() => (tutorialIndex -= 1)}
        >
          <ChevronLeft />
        </button>

        <button
          type="button"
          aria-label="Next tutorial"
          class="flex size-10 items-center justify-center rounded-full bg-neutral-200/80 hover:bg-neutral-300 disabled:pointer-events-none disabled:opacity-40"
          disabled={tutorialIndex === 2}
          onclick={() => (tutorialIndex += 1)}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  {/if}
</div>
