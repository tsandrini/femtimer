import { defineStore } from "pinia";
import { ref, watch } from "vue";

const STORAGE_KEY = "femtimer-widget-states";

/**
 * Widget state persistence store
 * Maintains widget state across page switches and component unmounts
 * Persists to localStorage for survival across page reloads
 * State is keyed by widget instanceId
 */
export const useWidgetStateStore = defineStore("widgetState", () => {
  // Load initial state from localStorage
  function loadFromStorage(): Map<string, Record<string, unknown>> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.warn("Failed to load widget states from localStorage:", error);
    }
    return new Map();
  }

  // Save state to localStorage
  function saveToStorage(states: Map<string, Record<string, unknown>>): void {
    try {
      const obj = Object.fromEntries(states);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (error) {
      console.warn("Failed to save widget states to localStorage:", error);
    }
  }

  // Map of instanceId -> widget state
  const widgetStates = ref<Map<string, Record<string, unknown>>>(
    loadFromStorage(),
  );

  // Watch for changes and persist to localStorage
  watch(
    widgetStates,
    (newStates) => {
      saveToStorage(newStates);
    },
    { deep: true },
  );

  /**
   * Get the state for a widget instance
   * Returns undefined if no state exists
   */
  function getState<T extends Record<string, unknown>>(
    instanceId: string,
  ): T | undefined {
    return widgetStates.value.get(instanceId) as T | undefined;
  }

  /**
   * Set the entire state for a widget instance
   */
  function setState<T extends Record<string, unknown>>(
    instanceId: string,
    state: T,
  ): void {
    widgetStates.value.set(instanceId, state);
  }

  /**
   * Update partial state for a widget instance
   * Merges with existing state
   */
  function updateState<T extends Record<string, unknown>>(
    instanceId: string,
    partialState: Partial<T>,
  ): void {
    const existing = widgetStates.value.get(instanceId) || {};
    widgetStates.value.set(instanceId, { ...existing, ...partialState });
  }

  /**
   * Delete state for a widget instance
   * Useful for cleanup when widgets are permanently removed
   */
  function deleteState(instanceId: string): void {
    widgetStates.value.delete(instanceId);
  }

  /**
   * Clear all widget state
   * Useful for testing or reset scenarios
   */
  function clearAll(): void {
    widgetStates.value.clear();
  }

  return {
    widgetStates,
    getState,
    setState,
    updateState,
    deleteState,
    clearAll,
  };
});
