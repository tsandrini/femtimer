<script setup lang="ts">
import { usePageEvents } from "@/composables/usePageEvents";
import { useWidgetStateStore } from "@/stores/widgetState";
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

// Widget state persistence
const widgetStateStore = useWidgetStateStore();

type TimerState = "idle" | "holding" | "ready" | "running" | "stopped";

interface TimerWidgetState extends Record<string, unknown> {
  state: TimerState;
  currentTimeMs: number;
  lastSolveTime: number | null;
  timerStartTime: number;
}

// Load persisted state or use defaults
const persistedState = widgetStateStore.getState<TimerWidgetState>(
  props.instanceId,
);

const state = ref<TimerState>(persistedState?.state ?? "idle");
const currentTimeMs = ref(persistedState?.currentTimeMs ?? 0);
const lastSolveTime = ref<number | null>(persistedState?.lastSolveTime ?? null);

// Track the current scramble and event code for the solve (NOT persisted)
const currentScramble = ref<string>("");
const currentEventCode = ref<string>("333");

let holdTimeout: ReturnType<typeof setTimeout> | null = null;
let timerStartTime = persistedState?.timerStartTime ?? 0;
let animationFrameId: number | null = null;

// Save state to store whenever it changes (excluding scramble - not persisted)
function saveState() {
  widgetStateStore.setState<TimerWidgetState>(props.instanceId, {
    state: state.value,
    currentTimeMs: currentTimeMs.value,
    lastSolveTime: lastSolveTime.value,
    timerStartTime,
  });
}

// Watch for state changes and persist (excluding scramble)
watch([state, currentTimeMs, lastSolveTime], saveState, { deep: true });

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
  saveState(); // Persist timerStartTime

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
  emit("solve", currentTimeMs.value, currentScramble.value);

  // Emit solveFinished event via page event bus with scramble info
  if (props.config.autoNextScramble) {
    pageEvents?.emit("solveFinished", {
      time: currentTimeMs.value,
      scramble: currentScramble.value,
      eventCode: currentEventCode.value,
    });
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

// Listen for scramble events to track the current scramble
pageEvents?.on("scrambleGenerated", ({ scramble, eventCode }) => {
  currentScramble.value = scramble;
  currentEventCode.value = eventCode;
});

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

  // Resume timer animation if it was running when unmounted
  if (state.value === "running" && timerStartTime > 0) {
    function updateTimer() {
      currentTimeMs.value = performance.now() - timerStartTime;
      animationFrameId = requestAnimationFrame(updateTimer);
    }
    animationFrameId = requestAnimationFrame(updateTimer);
  }

  // Request current scramble in case we missed the scrambleGenerated event during mount
  pageEvents?.emit("requestCurrentScramble");
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
