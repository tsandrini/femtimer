import { defineStore } from "pinia";
import { computed, ref } from "vue";

export type TimerState = "idle" | "holding" | "ready" | "running" | "stopped";

export interface TimerSettings {
  holdToStart: boolean;
  holdTime: number;
  inspection: boolean;
  inspectionTime: number;
  hideTime: boolean;
}

export const useTimerStore = defineStore("timer", () => {
  const state = ref<TimerState>("idle");
  const currentTime = ref(0);
  const scramble = ref("");
  const cubeEvent = ref("333");

  const settings = ref<TimerSettings>({
    holdToStart: true,
    holdTime: 300,
    inspection: true,
    inspectionTime: 15,
    hideTime: false,
  });

  const formattedTime = computed(() => {
    const ms = currentTime.value;
    if (ms < 60000) {
      return (ms / 1000).toFixed(2);
    }
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(2);
    return `${minutes}:${seconds.padStart(5, "0")}`;
  });

  function reset() {
    state.value = "idle";
    currentTime.value = 0;
  }

  function setState(newState: TimerState) {
    state.value = newState;
  }

  function setTime(time: number) {
    currentTime.value = time;
  }

  function setScramble(newScramble: string) {
    scramble.value = newScramble;
  }

  function setCubeEvent(event: string) {
    cubeEvent.value = event;
  }

  function updateSettings(newSettings: Partial<TimerSettings>) {
    settings.value = { ...settings.value, ...newSettings };
  }

  return {
    state,
    currentTime,
    scramble,
    cubeEvent,
    settings,
    formattedTime,
    reset,
    setState,
    setTime,
    setScramble,
    setCubeEvent,
    updateSettings,
  };
});
