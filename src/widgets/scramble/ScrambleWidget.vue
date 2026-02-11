<script setup lang="ts">
import type { BaseWidgetConfig } from "@/types/widgets";
import { CopyOutline, RefreshOutline } from "@vicons/ionicons5";
import { randomScrambleForEvent } from "cubing/scramble";
import { NButton, NIcon, NText } from "naive-ui";
import { onMounted, ref, watch } from "vue";

export interface ScrambleWidgetConfig extends BaseWidgetConfig {
  scrambleType: string;
  fontSize: "small" | "medium" | "large";
}

const props = defineProps<{
  instanceId: string;
  config: ScrambleWidgetConfig;
  isEditMode: boolean;
}>();

const emit = defineEmits<(e: "scrambleGenerated", scramble: string) => void>();

const scramble = ref("Generating...");
const isGenerating = ref(false);

// Font size mapping
const fontSizeMap = {
  small: "1rem",
  medium: "1.25rem",
  large: "1.5rem",
};

async function generateScramble() {
  isGenerating.value = true;
  scramble.value = "Generating...";

  try {
    const result = await randomScrambleForEvent(props.config.scrambleType);
    scramble.value = result.toString();
    emit("scrambleGenerated", scramble.value);
  } catch {
    scramble.value = "Error generating scramble";
  } finally {
    isGenerating.value = false;
  }
}

async function copyScramble() {
  if (scramble.value && scramble.value !== "Generating...") {
    await navigator.clipboard.writeText(scramble.value);
  }
}

// Regenerate when scramble type changes
watch(
  () => props.config.scrambleType,
  () => {
    generateScramble();
  },
);

onMounted(() => {
  generateScramble();
});

// Expose method for parent components to trigger new scramble
defineExpose({
  generateScramble,
  currentScramble: scramble,
});
</script>

<template>
  <div class="scramble-widget">
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
      <NButton quaternary circle size="small" @click="copyScramble">
        <template #icon>
          <NIcon><CopyOutline /></NIcon>
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
</style>
