<script setup lang="ts">
import { usePageEvents } from "@/composables/usePageEvents";
import type { BaseWidgetConfig } from "@/types/widgets";
import { NText } from "naive-ui";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

export interface TimerWidgetConfig extends BaseWidgetConfig {
  holdTime: number;
  hideTimeWhileRunning: boolean;
  autoNextScramble: boolean;
}

const props = defineProps<{
  instanceId: string;
  config: TimerWidgetConfig;
  isEditMode: boolean;
}>();

const emit =
  defineEmits<(e: "solve", time: number, scramble: string) => void>();

// Page-level event bus for cross-widget communication
const pageEvents = usePageEvents();

type TimerState = "idle" | "holding" | "ready" | "running" | "stopped";

const state = ref<TimerState>("idle");
const currentTimeMs = ref(0);
const lastSolveTime = ref<number | null>(null);

let holdTimeout: ReturnType<typeof setTimeout> | null = null;
let timerStartTime = 0;
let animationFrameId: number | null = null;

// Format time for display
const formattedTime = computed(() => {
  const ms = currentTimeMs.value;
  if (ms < 60000) {
    return (ms / 1000).toFixed(2);
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(2);
  return `${minutes}:${seconds.padStart(5, "0")}`;
});

// Display time (may be hidden while running)
const displayTime = computed(() => {
  if (props.config.hideTimeWhileRunning && state.value === "running") {
    return "...";
  }
  return formattedTime.value;
});

// Dynamic hint text based on state
const hintText = computed(() => {
  if (props.isEditMode) {
    return "Timer disabled in edit mode";
  }
  switch (state.value) {
    case "idle":
      return "Press and hold SPACE to start";
    case "holding":
      return "Keep holding...";
    case "ready":
      return "Release to start!";
    case "running":
      return "Press SPACE to stop";
    case "stopped":
      return "Press SPACE for next solve";
    default:
      return "";
  }
});

// Timer display color based on state
const timerColorClass = computed(() => {
  switch (state.value) {
    case "holding":
      return "timer-holding";
    case "ready":
      return "timer-ready";
    default:
      return "";
  }
});

// Start the timer animation loop
function startTimer() {
  timerStartTime = performance.now();
  state.value = "running";

  // Emit timerStarted event
  pageEvents?.emit("timerStarted");

  function updateTimer() {
    currentTimeMs.value = performance.now() - timerStartTime;
    animationFrameId = requestAnimationFrame(updateTimer);
  }
  animationFrameId = requestAnimationFrame(updateTimer);
}

// Stop the timer
function stopTimer() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  currentTimeMs.value = performance.now() - timerStartTime;
  lastSolveTime.value = currentTimeMs.value;
  state.value = "stopped";

  // Emit solve event
  emit("solve", currentTimeMs.value, ""); // scramble will be provided by parent

  // Emit solveFinished event via page event bus if autoNextScramble is enabled
  if (props.config.autoNextScramble) {
    pageEvents?.emit("solveFinished", { time: currentTimeMs.value });
  }
}

// Reset for next solve
function resetForNextSolve() {
  currentTimeMs.value = 0;
  state.value = "idle";
}

// Handle key down
function handleKeyDown(e: KeyboardEvent) {
  if (props.isEditMode) return;
  if (e.code !== "Space" || e.repeat) return;
  e.preventDefault();

  if (state.value === "running") {
    stopTimer();
    return;
  }

  if (state.value === "stopped") {
    resetForNextSolve();
    return;
  }

  if (state.value === "idle") {
    state.value = "holding";

    holdTimeout = setTimeout(() => {
      state.value = "ready";
      pageEvents?.emit("timerReady");
    }, props.config.holdTime);
  }
}

// Handle key up
function handleKeyUp(e: KeyboardEvent) {
  if (props.isEditMode) return;
  if (e.code !== "Space") return;
  e.preventDefault();

  if (holdTimeout) {
    clearTimeout(holdTimeout);
    holdTimeout = null;
  }

  if (state.value === "ready") {
    startTimer();
  } else if (state.value === "holding") {
    // Released too early, go back to idle
    state.value = "idle";
  }
}

// Watch for edit mode changes - reset timer if entering edit mode
watch(
  () => props.isEditMode,
  (isEdit) => {
    if (isEdit && state.value === "running") {
      stopTimer();
    }
  },
);

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
  if (holdTimeout) clearTimeout(holdTimeout);
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
});
</script>

<template>
  <div class="timer-widget">
    <div class="timer-container">
      <div :class="['timer-display', timerColorClass]">
        {{ displayTime }}
      </div>
      <NText depth="3" class="timer-hint">
        {{ hintText }}
      </NText>
    </div>
  </div>
</template>

<style scoped>
.timer-widget {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.timer-display {
  font-size: clamp(3rem, 10vw, 8rem);
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-weight: 300;
  font-variant-numeric: tabular-nums;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  user-select: none;
  transition: opacity 0.1s ease;
  line-height: 1;
}

.timer-display.timer-holding {
  opacity: 0.5;
}

.timer-display.timer-ready {
  opacity: 1;
  -webkit-text-fill-color: #4ade80;
  background: none;
}

.timer-hint {
  font-size: 0.875rem;
}
</style>
