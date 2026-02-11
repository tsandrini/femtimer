<script setup lang="ts">
import type { BaseWidgetConfig } from "@/types/widgets";
import { NGi, NGrid, NText } from "naive-ui";
import { computed } from "vue";

export interface StatsCardWidgetConfig extends BaseWidgetConfig {
  showStats: string[]; // Which stats to display
  layout: "horizontal" | "grid";
}

const props = defineProps<{
  instanceId: string;
  config: StatsCardWidgetConfig;
  isEditMode: boolean;
}>();

// Placeholder stats - will be connected to real data later
const stats = computed(() => ({
  count: 0,
  best: null as number | null,
  worst: null as number | null,
  mean: null as number | null,
  ao5: null as number | null,
  ao12: null as number | null,
  ao50: null as number | null,
  ao100: null as number | null,
}));

// Format time in seconds
function formatTime(ms: number | null): string {
  if (ms === null) return "-";
  if (ms < 60000) {
    return (ms / 1000).toFixed(2);
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(2);
  return `${minutes}:${seconds.padStart(5, "0")}`;
}

// Stat labels
const statLabels: Record<string, string> = {
  count: "Solves",
  best: "Best",
  worst: "Worst",
  mean: "Mean",
  ao5: "ao5",
  ao12: "ao12",
  ao50: "ao50",
  ao100: "ao100",
};

const visibleStats = computed(() => {
  return props.config.showStats.map((key) => ({
    key,
    label: statLabels[key] || key,
    value:
      key === "count"
        ? stats.value.count.toString()
        : formatTime(
            stats.value[key as keyof typeof stats.value] as number | null,
          ),
  }));
});
</script>

<template>
  <div class="stats-card-widget" :class="{ 'layout-grid': config.layout === 'grid' }">
    <template v-if="config.layout === 'grid'">
      <NGrid :cols="Math.min(visibleStats.length, 4)" :x-gap="12" :y-gap="12">
        <NGi v-for="stat in visibleStats" :key="stat.key">
          <div class="stat-item">
            <NText depth="3" class="stat-label">{{ stat.label }}</NText>
            <NText class="stat-value">{{ stat.value }}</NText>
          </div>
        </NGi>
      </NGrid>
    </template>
    <template v-else>
      <div class="stats-horizontal">
        <div v-for="stat in visibleStats" :key="stat.key" class="stat-item">
          <NText depth="3" class="stat-label">{{ stat.label }}</NText>
          <NText class="stat-value">{{ stat.value }}</NText>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.stats-card-widget {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 12px;
}

.stats-horizontal {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 60px;
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.25rem;
  font-family: "JetBrains Mono", monospace;
  font-variant-numeric: tabular-nums;
}
</style>
