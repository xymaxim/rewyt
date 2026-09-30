<script lang="ts">
  import {
    CircleCheckBig,
    ChevronLeft,
    ChevronRight,
    Circle,
  } from "lucide-svelte";
  import type { Explorer } from "@rewyt-frontend/lib/explorer.svelte";
  import { ZOOM_LEVELS } from "@rewyt-frontend/lib/types";

  export type TourFocus =
    "timeline" | "daysSlider" | "daySlider" | "zoom" | "timeInput";

  let {
    explorer,
    lastRewindSource,
    lastRewindTarget,
    isTimeInputOpen,
    onFocusChange,
  }: {
    explorer: Explorer;
    lastRewindSource: "timeline" | "button" | "input" | null;
    lastRewindTarget: number | null;
    isTimeInputOpen: boolean;
    onFocusChange: (focus: TourFocus[] | null) => void;
  } = $props();

  type Part = { text: string; b?: boolean };
  type Substep = { parts: Part[]; met: () => boolean };
  type Tutorial = {
    title: string;
    description: string;
    success: string;
    steps: { substeps: Substep[]; focus: TourFocus[] }[];
  };

  const plain = (text: string): Part => ({ text });
  const bold = (text: string): Part => ({ text, b: true });

  const tutorialClickTime = "12:00";
  const tutorialSliderTime = "03:00";
  const zoom1hTime = "03:14";
  const zoom10mTime = "03:14:15";
  const inputRewindTime = "09:23:56";

  const targetDayStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate() - 3,
  ).getTime();
  const targetDayLabel = new Date(targetDayStart).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

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

  const rewoundBy = (source: "timeline" | "button" | "input", hms: string) =>
    lastRewindSource === source &&
    lastRewindTarget != null &&
    isTargetDay(lastRewindTarget) &&
    localHms(lastRewindTarget).slice(0, hms.length) === hms;

  const zoomIs = (key: "1h" | "10m") => explorer.zoomLevel === ZOOM_LEVELS[key];

  const tutorials: Tutorial[] = [
    {
      title: "Rewind by clicking the timeline",
      description: "Click on the timeline to rewind and play in one action.",
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
          focus: ["timeline", "daysSlider"],
        },
        {
          substeps: [
            {
              parts: [plain("Click the timeline at "), bold(tutorialClickTime)],
              met: () => rewoundBy("timeline", tutorialClickTime),
            },
          ],
          focus: ["timeline"],
        },
      ],
    },
    {
      title: "Rewind by pressing the rewind button",
      description: "Choose a moment on the timeline first, then rewind to it.",
      success: `Great!`,
      steps: [
        {
          substeps: [
            {
              parts: [
                plain("Drag the rewind slider to "),
                bold(tutorialSliderTime),
              ],
              met: () => selectedAt(tutorialSliderTime),
            },
          ],
          focus: ["timeline"],
        },
        {
          substeps: [
            {
              parts: [plain("Click the rewind button")],
              met: () => rewoundBy("button", tutorialSliderTime),
            },
          ],
          focus: ["timeline"],
        },
      ],
    },
    {
      title: "Navigate by zooming in",
      description: "Zoom in on the timeline to pick a moment more precisely.",
      success: `Great!`,
      steps: [
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
          focus: ["timeline", "zoom"],
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
          focus: ["timeline", "zoom"],
        },
      ],
    },
    {
      title: "Rewind by entering an exact time",
      description: "Type an exact time and rewind to it.",
      success: `Great!`,
      steps: [
        {
          substeps: [
            {
              parts: [plain("Click the pen button to open the time input")],
              met: () => isTimeInputOpen,
            },
          ],
          focus: ["timeInput"],
        },
        {
          substeps: [
            {
              parts: [
                plain("Enter "),
                bold(inputRewindTime),
                plain(" and click Rewind"),
              ],
              met: () => rewoundBy("input", inputRewindTime),
            },
          ],
          focus: ["timeInput"],
        },
      ],
    },
  ];

  const tutorialIndexes = tutorials.map((_tut, i) => i);

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

  const activeFocus = $derived.by<TourFocus[] | null>(() => {
    const i = tutorialsView[tutorialIndex].steps.findIndex(
      (step) => !step.complete,
    );
    return i < 0 ? null : tutorials[tutorialIndex].steps[i].focus;
  });

  $effect(() => {
    onFocusChange(activeFocus);
  });
</script>

{#snippet stepMarker(complete: boolean)}
  <span
    class="text-muted-foreground mt-0.5 flex shrink-0 items-center justify-center"
  >
    {#if complete}
      <CircleCheckBig size={20} />
    {:else}
      <Circle size={20} />
    {/if}
  </span>
{/snippet}

<div class="mt-3 w-full rounded-2xl bg-amber-100 p-4 text-left">
  <div class="flex gap-1">
    {#each tutorialIndexes as i (i)}
      <span
        class="h-1.5 flex-1 rounded-full"
        class:bg-[var(--color-selected-dark)]={i <= tutorialIndex}
        class:bg-neutral-300={i > tutorialIndex}
      ></span>
    {/each}
  </div>

  <div class="mt-2 flex items-center justify-between text-sm font-semibold">
    <span>Tutorial {tutorialIndex + 1} of {tutorials.length}</span>

    <div class="flex items-center gap-2">
      <button
        type="button"
        aria-label="Previous tutorial"
        class="flex size-10 items-center justify-center rounded-full bg-neutral-300 hover:cursor-pointer hover:bg-neutral-200 disabled:pointer-events-none disabled:opacity-0"
        disabled={tutorialIndex === 0}
        onclick={() => (tutorialIndex -= 1)}
      >
        <ChevronLeft />
      </button>

      <button
        type="button"
        aria-label="Next tutorial"
        class="flex size-10 items-center justify-center rounded-full bg-neutral-300 hover:cursor-pointer hover:bg-neutral-200 disabled:pointer-events-none disabled:opacity-0"
        disabled={tutorialIndex === tutorials.length - 1}
        onclick={() => (tutorialIndex += 1)}
      >
        <ChevronRight />
      </button>
    </div>
  </div>

  <div>
    <div class="mt-2 flex items-center justify-between text-xl font-medium">
      <span>{current.title}</span>
    </div>
    <p class="text-muted-foreground">{current.description}</p>
    <ol class="mt-2 mt-4 flex flex-col gap-2">
      {#each current.steps as step, si (si)}
        <li class="flex items-start gap-3">
          {@render stepMarker(step.complete)}
          <span>
            {#each step.substeps as sub, xi (xi)}
              {#if xi > 0}&nbsp;{/if}
              <span
                class:text-muted-foreground={sub.seen}
                class:opacity-50={sub.seen}
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
</div>
