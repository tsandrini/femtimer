<script setup lang="ts">
import type { BaseWidgetConfig } from "@/types/widgets";
import { NDataTable, NEmpty, NText } from "naive-ui";
import { computed, h } from "vue";

export interface SolveHistoryWidgetConfig extends BaseWidgetConfig {
  maxItems: number;
  showScramble: boolean;
  showDate: boolean;
}

const props = defineProps<{
  instanceId: string;
  config: SolveHistoryWidgetConfig;
  isEditMode: boolean;
}>();

// Placeholder data - will be connected to real data later
const solves = computed(
  () =>
    [] as Array<{
      id: number;
      time: number;
      scramble: string;
      timestamp: Date;
      penalty: "none" | "+2" | "dnf";
    }>,
);

// Format time in seconds
function formatTime(ms: number, penalty: "none" | "+2" | "dnf"): string {
  if (penalty === "dnf") return "DNF";

  const adjustedMs = penalty === "+2" ? ms + 2000 : ms;

  if (adjustedMs < 60000) {
    const timeStr = (adjustedMs / 1000).toFixed(2);
    return penalty === "+2" ? `${timeStr}+` : timeStr;
  }
  const minutes = Math.floor(adjustedMs / 60000);
  const seconds = ((adjustedMs % 60000) / 1000).toFixed(2);
  const timeStr = `${minutes}:${seconds.padStart(5, "0")}`;
  return penalty === "+2" ? `${timeStr}+` : timeStr;
}

// Format date
function formatDate(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

type SolveRow = (typeof solves.value)[0];

// Table columns - using any[] to allow flexible column definitions
const columns = computed(() => {
  // biome-ignore lint/suspicious/noExplicitAny: NDataTable requires flexible column types
  const cols: any[] = [
    {
      title: "#",
      key: "index",
      width: 50,
      render: (_row: SolveRow, index: number) =>
        h(NText, { depth: 3 }, () => index + 1),
    },
    {
      title: "Time",
      key: "time",
      width: 100,
      render: (row: SolveRow) =>
        h(
          NText,
          {
            class: "time-cell",
            style:
              row.penalty === "dnf" ? { color: "var(--color-text-muted)" } : {},
          },
          () => formatTime(row.time, row.penalty),
        ),
    },
  ];

  if (props.config.showScramble) {
    cols.push({
      title: "Scramble",
      key: "scramble",
      ellipsis: { tooltip: true },
      render: (row: SolveRow) =>
        h(NText, { depth: 3, class: "scramble-cell" }, () => row.scramble),
    });
  }

  if (props.config.showDate) {
    cols.push({
      title: "Time",
      key: "timestamp",
      width: 80,
      render: (row: SolveRow) =>
        h(NText, { depth: 3 }, () => formatDate(row.timestamp)),
    });
  }

  return cols;
});

const displaySolves = computed(() => {
  return solves.value.slice(0, props.config.maxItems);
});
</script>

<template>
  <div class="solve-history-widget">
    <template v-if="solves.length > 0">
      <NDataTable
        :columns="columns"
        :data="displaySolves"
        :bordered="false"
        :single-line="false"
        size="small"
        flex-height
        class="history-table"
      />
    </template>
    <template v-else>
      <NEmpty description="No solves yet" size="small" />
    </template>
  </div>
</template>

<style scoped>
.solve-history-widget {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.history-table {
  flex: 1;
}

.time-cell {
  font-family: "JetBrains Mono", monospace;
  font-variant-numeric: tabular-nums;
}

.scramble-cell {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.75rem;
}
</style>
