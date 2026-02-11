<script setup lang="ts">
import { getWidgetRegistry } from "@/registry";
import type { WidgetCategory } from "@/types/widgets";
import {
  AppsOutline,
  BuildOutline,
  ExtensionPuzzleOutline,
  PieChartOutline,
  StatsChartOutline,
  TimeOutline,
} from "@vicons/ionicons5";
import { NCard, NDrawer, NDrawerContent, NEmpty, NIcon, NText } from "naive-ui";
import { computed, type Component } from "vue";

defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "select", typeId: string): void;
}>();

const registry = getWidgetRegistry();
const allWidgets = computed(() => registry.getAll());

const categoryLabels: Record<WidgetCategory, string> = {
  timer: "Timer",
  display: "Display",
  stats: "Statistics",
  charts: "Charts",
  utility: "Utility",
  training: "Training",
};

const categoryIcons: Record<WidgetCategory, Component> = {
  timer: TimeOutline,
  display: AppsOutline,
  stats: StatsChartOutline,
  charts: PieChartOutline,
  utility: BuildOutline,
  training: ExtensionPuzzleOutline,
};

const groupedWidgets = computed(() => {
  const groups: Partial<Record<WidgetCategory, typeof allWidgets.value>> = {};
  for (const widget of allWidgets.value) {
    const category = widget.metadata.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category]!.push(widget);
  }
  return groups;
});

function handleSelect(typeId: string) {
  emit("select", typeId);
  emit("update:show", false);
}
</script>

<template>
  <NDrawer
    :show="show"
    :width="360"
    placement="right"
    @update:show="$emit('update:show', $event)"
  >
    <NDrawerContent title="Add Widget" closable>
      <div class="widget-picker">
        <template v-if="allWidgets.length === 0">
          <NEmpty description="No widgets available" />
        </template>

        <template v-else>
          <div
            v-for="(widgets, category) in groupedWidgets"
            :key="category"
            class="category-group"
          >
            <div class="category-header">
              <NIcon size="18" :component="categoryIcons[category as WidgetCategory]" />
              <NText strong>{{ categoryLabels[category as WidgetCategory] }}</NText>
            </div>

            <div class="widget-list">
              <NCard
                v-for="widget in widgets"
                :key="widget.metadata.id"
                class="widget-option"
                hoverable
                size="small"
                @click="handleSelect(widget.metadata.id)"
              >
                <div class="widget-option-content">
                  <div class="widget-info">
                    <NText strong class="widget-name">{{ widget.metadata.name }}</NText>
                    <NText depth="3" class="widget-description">
                      {{ widget.metadata.description }}
                    </NText>
                  </div>
                  <div class="widget-size">
                    <NText depth="3" class="size-label">
                      {{ widget.metadata.defaultSize.width }}x{{
                        widget.metadata.defaultSize.height
                      }}
                    </NText>
                  </div>
                </div>
              </NCard>
            </div>
          </div>
        </template>
      </div>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
.widget-picker {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.category-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);
}

.widget-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.widget-option {
  cursor: pointer;
  transition: border-color 0.2s;
}

.widget-option:hover {
  border-color: var(--color-primary);
}

.widget-option-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.widget-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.widget-name {
  font-size: 0.875rem;
}

.widget-description {
  font-size: 0.75rem;
  line-height: 1.4;
}

.widget-size {
  flex-shrink: 0;
}

.size-label {
  font-size: 0.75rem;
  font-family: "JetBrains Mono", monospace;
}
</style>
