<script setup lang="ts">
import { usePageEvent, usePageEvents } from "@/composables/usePageEvents";
import { useWidgetStateStore } from "@/stores/widgetState";
import {
  DEFAULT_CATEGORY_ID,
  DEFAULT_SCRAMBLE_TYPE_ID,
  SCRAMBLE_CATEGORIES,
  getEventCode,
  getTypesForCategory,
} from "@/types/scrambles";
import type { BaseWidgetConfig } from "@/types/widgets";
import {
  CheckmarkOutline,
  CopyOutline,
  RefreshOutline,
} from "@vicons/ionicons5";
import { randomScrambleForEvent } from "cubing/scramble";
import { NButton, NIcon, NSelect, NText } from "naive-ui";
import { computed, onMounted, ref, watch } from "vue";

export interface ScrambleWidgetConfig extends BaseWidgetConfig {
  categoryId: string;
  scrambleTypeId: string;
  fontSize: "small" | "medium" | "large";
}

const props = defineProps<{
  instanceId: string;
  config: ScrambleWidgetConfig;
  isEditMode: boolean;
}>();

const emit = defineEmits<{
  (e: "scrambleGenerated", scramble: string): void;
  (e: "updateConfig", config: Partial<ScrambleWidgetConfig>): void;
}>();

// Page-level event bus for cross-widget communication
const pageEvents = usePageEvents();

// Widget state persistence
const widgetStateStore = useWidgetStateStore();

interface ScrambleWidgetState extends Record<string, unknown> {
  scramble: string;
  isGenerating: boolean;
}

// Load persisted state or use defaults
const persistedState = widgetStateStore.getState<ScrambleWidgetState>(
  props.instanceId,
);

// Listen for solveFinished event to generate next scramble
usePageEvent("solveFinished", () => {
  generateScramble();
});

// Listen for requests to re-emit current scramble (for late-mounting widgets)
usePageEvent("requestCurrentScramble", () => {
  if (scramble.value && scramble.value !== "Generating...") {
    const eventCode = getEventCode(
      currentCategoryId.value,
      currentScrambleTypeId.value,
    );
    pageEvents?.emit("scrambleGenerated", {
      scramble: scramble.value,
      eventCode,
    });
  }
});

const scramble = ref(persistedState?.scramble ?? "Generating...");
const isGenerating = ref(persistedState?.isGenerating ?? false);
const justCopied = ref(false);

// Save state to store whenever it changes
function saveState() {
  widgetStateStore.setState<ScrambleWidgetState>(props.instanceId, {
    scramble: scramble.value,
    isGenerating: isGenerating.value,
  });
}

// Watch for state changes and persist
watch([scramble, isGenerating], saveState);

// Font size mapping
const fontSizeMap = {
  small: "1rem",
  medium: "1.25rem",
  large: "1.5rem",
};

// Category select options
const categoryOptions = computed(() =>
  SCRAMBLE_CATEGORIES.map((cat) => ({
    label: cat.name,
    value: cat.id,
  })),
);

// Scramble type select options based on current category
const scrambleTypeOptions = computed(() => {
  const types = getTypesForCategory(
    props.config.categoryId ?? DEFAULT_CATEGORY_ID,
  );
  return types.map((t) => ({
    label: t.name,
    value: t.id,
  }));
});

// Current category ID with fallback
const currentCategoryId = computed(
  () => props.config.categoryId ?? DEFAULT_CATEGORY_ID,
);

// Current scramble type ID with fallback
const currentScrambleTypeId = computed(
  () => props.config.scrambleTypeId ?? DEFAULT_SCRAMBLE_TYPE_ID,
);

function handleCategoryChange(categoryId: string) {
  // When category changes, reset to first scramble type in that category
  const types = getTypesForCategory(categoryId);
  const firstTypeId = types[0]?.id ?? DEFAULT_SCRAMBLE_TYPE_ID;

  emit("updateConfig", {
    categoryId,
    scrambleTypeId: firstTypeId,
  });
}

function handleScrambleTypeChange(scrambleTypeId: string) {
  emit("updateConfig", { scrambleTypeId });
}

async function generateScramble() {
  isGenerating.value = true;
  scramble.value = "Generating...";

  try {
    const eventCode = getEventCode(
      currentCategoryId.value,
      currentScrambleTypeId.value,
    );
    const result = await randomScrambleForEvent(eventCode);
    scramble.value = result.toString();

    // Emit via component event (for direct parent communication)
    emit("scrambleGenerated", scramble.value);

    // Emit via page event bus (for cross-widget communication)
    pageEvents?.emit("scrambleGenerated", {
      scramble: scramble.value,
      eventCode,
    });
  } catch {
    scramble.value = "Error generating scramble";
  } finally {
    isGenerating.value = false;
  }
}

async function copyScramble() {
  if (scramble.value && scramble.value !== "Generating...") {
    await navigator.clipboard.writeText(scramble.value);
    justCopied.value = true;
    setTimeout(() => {
      justCopied.value = false;
    }, 1500);
  }
}

// Regenerate when category or scramble type changes
watch(
  [() => props.config.categoryId, () => props.config.scrambleTypeId],
  () => {
    generateScramble();
  },
);

onMounted(() => {
  // If we have a persisted scramble, emit it immediately
  if (persistedState?.scramble && scramble.value !== "Generating...") {
    const eventCode = getEventCode(
      currentCategoryId.value,
      currentScrambleTypeId.value,
    );
    pageEvents?.emit("scrambleGenerated", {
      scramble: scramble.value,
      eventCode,
    });
  } else {
    // Generate a new scramble if we don't have a persisted one
    generateScramble();
  }
});
</script>

<template>
  <div class="scramble-widget">
    <div class="scramble-selects" v-if="!isEditMode">
      <NSelect
        :value="currentCategoryId"
        :options="categoryOptions"
        size="small"
        class="category-select"
        @update:value="handleCategoryChange"
      />
      <NSelect
        :value="currentScrambleTypeId"
        :options="scrambleTypeOptions"
        size="small"
        class="type-select"
        @update:value="handleScrambleTypeChange"
      />
    </div>

    <NText
      class="scramble-text"
      :style="{ fontSize: fontSizeMap[config.fontSize] }"
    >
      {{ scramble }}
    </NText>

    <div class="scramble-actions" v-if="!isEditMode">
      <NButton
        quaternary
        circle
        size="small"
        :loading="isGenerating"
        @click="generateScramble"
      >
        <template #icon>
          <NIcon><RefreshOutline /></NIcon>
        </template>
      </NButton>
      <NButton
        quaternary
        circle
        size="small"
        :class="{ 'copy-success': justCopied }"
        @click="copyScramble"
      >
        <template #icon>
          <NIcon>
            <CheckmarkOutline v-if="justCopied" />
            <CopyOutline v-else />
          </NIcon>
        </template>
      </NButton>
    </div>
  </div>
</template>

<style scoped>
.scramble-widget {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  gap: 12px;
  padding: 12px;
}

.scramble-selects {
  display: flex;
  gap: 8px;
  width: 100%;
  max-width: 400px;
}

.category-select {
  flex: 0 0 100px;
}

.type-select {
  flex: 1;
}

.scramble-text {
  font-family: "JetBrains Mono", monospace;
  letter-spacing: 0.05em;
  text-align: center;
  word-break: break-word;
}

.scramble-actions {
  display: flex;
  gap: 8px;
}

.copy-success {
  color: var(--color-primary);
  opacity: 0.8;
}
</style>
