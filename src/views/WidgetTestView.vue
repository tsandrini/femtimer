<script setup lang="ts">
import { getWidgetRegistry } from "@/registry";
import WidgetWrapper from "@/widgets/WidgetWrapper.vue";
import { NDivider, NSwitch, NText } from "naive-ui";
import { computed, ref, type Component } from "vue";

const registry = getWidgetRegistry();
const allWidgets = computed(() => registry.getAll());

const isEditMode = ref(false);

// Track instances for each widget type
const widgetInstances = ref<
  Record<string, { config: Record<string, unknown> }>
>({});

// Initialize instances for all registered widgets
for (const widget of allWidgets.value) {
  widgetInstances.value[widget.metadata.id] = {
    config: { ...widget.metadata.defaultConfig },
  };
}

// Get component for a widget type
function getComponent(typeId: string): Component | undefined {
  return registry.get(typeId)?.component;
}
</script>

<template>
  <div class="widget-test-view">
    <div class="test-header">
      <NText tag="h1" class="test-title">Widget Test Page</NText>
      <div class="test-controls">
        <NText depth="3">Edit Mode</NText>
        <NSwitch v-model:value="isEditMode" />
      </div>
    </div>

    <NDivider />

    <div class="widget-grid">
      <div
        v-for="widget in allWidgets"
        :key="widget.metadata.id"
        class="widget-test-item"
        :style="{
          '--widget-width': widget.metadata.defaultSize.width,
          '--widget-height': widget.metadata.defaultSize.height,
        }"
      >
        <div class="widget-meta">
          <NText strong>{{ widget.metadata.name }}</NText>
          <NText depth="3" class="widget-id">{{ widget.metadata.id }}</NText>
          <NText depth="3" class="widget-size">
            {{ widget.metadata.defaultSize.width }}x{{
              widget.metadata.defaultSize.height
            }}
          </NText>
        </div>

        <div class="widget-preview">
          <WidgetWrapper
            :config="widgetInstances[widget.metadata.id].config"
            :is-edit-mode="isEditMode"
          >
            <component
              :is="getComponent(widget.metadata.id)"
              :instance-id="`test-${widget.metadata.id}`"
              :config="widgetInstances[widget.metadata.id].config"
              :is-edit-mode="isEditMode"
            />
          </WidgetWrapper>
        </div>
      </div>
    </div>

    <NDivider title-placement="left">
      <NText depth="3">Combined Layout Preview</NText>
    </NDivider>

    <div class="combined-preview">
      <div class="preview-grid">
        <!-- Timer widget - large center -->
        <div class="preview-cell" style="grid-area: timer">
          <WidgetWrapper
            :config="widgetInstances['timer'].config"
            :is-edit-mode="isEditMode"
          >
            <component
              :is="getComponent('timer')"
              instance-id="preview-timer"
              :config="widgetInstances['timer'].config"
              :is-edit-mode="isEditMode"
            />
          </WidgetWrapper>
        </div>

        <!-- Scramble widget - top -->
        <div class="preview-cell" style="grid-area: scramble">
          <WidgetWrapper
            :config="{ ...widgetInstances['scramble'].config, showHeader: true, title: 'Scramble' }"
            :is-edit-mode="isEditMode"
          >
            <component
              :is="getComponent('scramble')"
              instance-id="preview-scramble"
              :config="widgetInstances['scramble'].config"
              :is-edit-mode="isEditMode"
            />
          </WidgetWrapper>
        </div>

        <!-- Stats widget - bottom -->
        <div class="preview-cell" style="grid-area: stats">
          <WidgetWrapper
            :config="{ ...widgetInstances['stats-card'].config, showHeader: true, title: 'Statistics' }"
            :is-edit-mode="isEditMode"
          >
            <component
              :is="getComponent('stats-card')"
              instance-id="preview-stats"
              :config="widgetInstances['stats-card'].config"
              :is-edit-mode="isEditMode"
            />
          </WidgetWrapper>
        </div>

        <!-- History widget - right side -->
        <div class="preview-cell" style="grid-area: history">
          <WidgetWrapper
            :config="{ ...widgetInstances['solve-history'].config, showHeader: true, title: 'History' }"
            :is-edit-mode="isEditMode"
          >
            <component
              :is="getComponent('solve-history')"
              instance-id="preview-history"
              :config="widgetInstances['solve-history'].config"
              :is-edit-mode="isEditMode"
            />
          </WidgetWrapper>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.widget-test-view {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.test-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.test-title {
  font-size: 1.5rem;
  margin: 0;
}

.test-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.widget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.widget-test-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.widget-meta {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.widget-id {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.75rem;
}

.widget-size {
  font-size: 0.75rem;
}

.widget-preview {
  height: calc(var(--widget-height, 2) * 80px);
  min-height: 120px;
  border: 1px dashed var(--border-color-muted, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  overflow: hidden;
}

.combined-preview {
  margin-top: 24px;
}

.preview-grid {
  display: grid;
  grid-template-areas:
    "scramble scramble history"
    "timer timer history"
    "timer timer history"
    "stats stats history";
  grid-template-columns: 1fr 1fr 300px;
  grid-template-rows: auto 1fr 1fr auto;
  gap: 16px;
  height: 600px;
}

.preview-cell {
  border: 1px dashed var(--border-color-muted, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  overflow: hidden;
}
</style>
