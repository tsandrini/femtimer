<script setup lang="ts">
import type { BaseWidgetConfig } from "@/types/widgets";
import { SettingsOutline } from "@vicons/ionicons5";
import { NButton, NCard, NIcon, NText } from "naive-ui";

defineProps<{
  config: BaseWidgetConfig;
  isEditMode?: boolean;
}>();

defineEmits<(e: "configure") => void>();
</script>

<template>
  <NCard
    class="widget-wrapper"
    :class="{ borderless: config.borderless }"
    :bordered="!config.borderless"
    content-style="padding: 0; height: 100%;"
  >
    <template #header v-if="config.showHeader && config.title">
      <div class="widget-header">
        <NText class="widget-title">{{ config.title }}</NText>
        <div v-if="isEditMode" class="widget-actions">
          <NButton quaternary circle size="tiny" @click="$emit('configure')">
            <template #icon>
              <NIcon size="14"><SettingsOutline /></NIcon>
            </template>
          </NButton>
        </div>
      </div>
    </template>
    <div class="widget-content">
      <slot />
    </div>
  </NCard>
</template>

<style scoped>
.widget-wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.widget-wrapper.borderless {
  background: transparent;
}

.widget-wrapper.borderless :deep(.n-card__content) {
  background: transparent;
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
}

.widget-title {
  font-size: 0.875rem;
  font-weight: 500;
}

.widget-actions {
  display: flex;
  gap: 4px;
}

.widget-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
</style>
