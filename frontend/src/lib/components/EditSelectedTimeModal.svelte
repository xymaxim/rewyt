<script lang="ts">
  import { untrack } from "svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { getExplorerContext } from "../explorer.svelte";
  import { parseTimestamp } from "../utils/dateTimeUtils";
  import { clampViewRange } from "$lib/utils/timelineUtils";

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  const explorer = getExplorerContext();

  let selectedValue = $state<string>("");
  let selectedError = $state<string | null>(null);

  const invalidInputError =
    "Enter a valid timestamp, e.g. 2026-01-02T10:20:30+00:00";
  const outOfRangeError = "Timestamp is outside the available range";

  function toIsoWithOffset(ms: number, offsetMinutes: number): string {
    const shifted = new Date(ms + offsetMinutes * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const abs = Math.abs(offsetMinutes);
    const offH = pad(Math.floor(abs / 60));
    const offM = pad(abs % 60);
    return (
      `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}` +
      `T${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}:${pad(shifted.getUTCSeconds())}` +
      `${sign}${offH}:${offM}`
    );
  }

  $effect(() => {
    if (!open) return;
    untrack(() => {
      selectedValue = toIsoWithOffset(
        explorer.selectedTime ?? Date.now(),
        explorer.timezoneOffset,
      );
      selectedError = null;
    });
  });

  function isOutOfRange(ts: number): boolean {
    const ar = explorer.availableRange;
    return ar !== null && (ts < ar.start || ts > ar.end);
  }

  function submit() {
    const ts = parseTimestamp(selectedValue);
    selectedError = null;

    if (ts === null) {
      selectedError = invalidInputError;
      return;
    }
    if (isOutOfRange(ts)) {
      selectedError = outOfRangeError;
      return;
    }

    explorer.setSelectedTime(ts);
    explorer.setViewRange(
      clampViewRange(
        ts,
        explorer.zoomLevel,
        explorer.days,
        explorer.centeredOnMidnight,
      ),
    );
    open = false;
  }

  function close() {
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="max-w-lg [&_button[data-dialog-close]]:hidden">
    <Dialog.Header>
      <Dialog.Title>Edit selected time</Dialog.Title>
    </Dialog.Header>

    <div class="flex flex-col gap-2">
      <Input
        id="edit-selected-time"
        bind:value={selectedValue}
        placeholder="2026-01-02T10:20:30+00:00"
        class="focus-visible:border-input {selectedError
          ? 'border-destructive'
          : 'border-input'}"
        onkeydown={(e) => {
          if (e.key !== "Enter" || e.repeat) return;
          e.preventDefault();
          e.stopPropagation();
          submit();
        }}
      />
      {#if selectedError}
        <p class="mt-1 text-sm text-destructive">{selectedError}</p>
      {/if}
    </div>

    <Dialog.Footer>
      <Button variant="ghost" onclick={close}>Cancel</Button>
      <Button variant="ghost" onclick={submit}>Save</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
