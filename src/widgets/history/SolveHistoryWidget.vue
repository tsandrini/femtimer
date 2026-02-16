<script setup lang="ts">
import { usePageEvent } from "@/composables/usePageEvents";
import { type Solve, db } from "@/services/database";
import { usePagesStore } from "@/stores/pages";
import type { BaseWidgetConfig } from "@/types/widgets";
import { NDataTable, NEmpty, NInput, NText } from "naive-ui";
import { computed, h, onMounted, ref, watch } from "vue";

export interface SolveHistoryWidgetConfig extends BaseWidgetConfig {
  maxItems: number;
  showScramble: boolean;
  showDate: boolean;
  showComment: boolean;
  showPageName: boolean;
  filterByCurrentPage: boolean;
}

const props = defineProps<{
  instanceId: string;
  config: SolveHistoryWidgetConfig;
  isEditMode: boolean;
}>();

const pagesStore = usePagesStore();
const currentPageId = computed(() => pagesStore.currentPageId);

// Link IDs for scoped communication
const linkIds = computed(() => props.config.linkIds || []);

// Store solves in a ref
const allSolves = ref<Solve[]>([]);

// Load solves from database (reverse chronological - most recent first)
async function loadSolves() {
  allSolves.value = await db.solves.orderBy("timestamp").reverse().toArray();
}

// Filter solves based on config
const solves = computed(() => {
  let filtered = allSolves.value;

  // Filter by current page if enabled
  if (props.config.filterByCurrentPage && currentPageId.value) {
    filtered = filtered.filter((s) => s.pageId === currentPageId.value);
  }

  return filtered;
});

// Track which comment is being edited
const editingCommentId = ref<number | null>(null);
const editingCommentValue = ref("");

function startEditComment(solve: Solve) {
  editingCommentId.value = solve.id;
  editingCommentValue.value = solve.comment || "";
}

async function saveComment(solveId: number) {
  await db.solves.update(solveId, { comment: editingCommentValue.value });
  editingCommentId.value = null;
  editingCommentValue.value = "";
  await loadSolves(); // Refresh the list
}

function cancelEditComment() {
  editingCommentId.value = null;
  editingCommentValue.value = "";
}

// Get page name by ID
function getPageName(pageId?: string): string {
  if (!pageId) return "—";
  const page = pagesStore.pages.find((p) => p.id === pageId);
  return page?.name || "Unknown";
}

// Load solves on mount
onMounted(() => {
  loadSolves();
});

// Listen for solveSaved event and reload (ensures DB write is complete) for all links
const solveSavedHandler = () => {
  loadSolves();
};
for (const linkId of linkIds.value) {
  usePageEvent("solveSaved", solveSavedHandler, { linkId });
}

// Watch for filter config changes
watch(
  () => props.config.filterByCurrentPage,
  () => {
    // Solves will be re-filtered automatically by the computed property
  },
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

type SolveRow = Solve;

// Table columns - using any[] to allow flexible column definitions
const columns = computed(() => {
  // biome-ignore lint/suspicious/noExplicitAny: NDataTable requires flexible column types
  const cols: any[] = [
    {
      title: "#",
      key: "id",
      width: 50,
      render: (row: SolveRow) => h(NText, { depth: 3 }, () => row.id),
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

  if (props.config.showComment) {
    cols.push({
      title: "Comment",
      key: "comment",
      width: 200,
      render: (row: SolveRow) => {
        if (editingCommentId.value === row.id) {
          return h(NInput, {
            value: editingCommentValue.value,
            size: "small",
            placeholder: "Add comment...",
            onUpdateValue: (val: string) => {
              editingCommentValue.value = val;
            },
            onBlur: () => saveComment(row.id),
            onKeyup: (e: KeyboardEvent) => {
              if (e.key === "Enter") saveComment(row.id);
              if (e.key === "Escape") cancelEditComment();
            },
          });
        }
        return h(
          "div",
          {
            class: "comment-cell",
            onClick: () => !props.isEditMode && startEditComment(row),
          },
          h(
            NText,
            { depth: row.comment ? 1 : 3 },
            () => row.comment || "Add comment...",
          ),
        );
      },
    });
  }

  if (props.config.showPageName) {
    cols.push({
      title: "Page",
      key: "pageId",
      width: 120,
      render: (row: SolveRow) =>
        h(NText, { depth: 3 }, () => getPageName(row.pageId)),
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

.comment-cell {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.comment-cell:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>
