import { defineStore } from "pinia";
import { ref } from "vue";

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
}

export interface Theme {
  name: string;
  isDark: boolean;
  colors: ThemeColors;
}

// Default Femtimer theme - pink/purple feminine palette
export const femtimerTheme: Theme = {
  name: "femtimer",
  isDark: true,
  colors: {
    primary: "#f98fed", // Vibrant magenta-pink
    primaryHover: "#fea1de", // Lighter pink on hover
    secondary: "#c37ef0", // Purple
    accent: "#de89fd", // Light purple
    background: "#18181c", // Dark background
    surface: "#242428", // Slightly lighter surface
    text: "#ffffff",
    textMuted: "#a0a0a8",
  },
};

export const useSettingsStore = defineStore("settings", () => {
  const currentTheme = ref<Theme>(femtimerTheme);
  const useDarkMode = ref(true);

  function setTheme(theme: Theme) {
    currentTheme.value = theme;
    applyTheme(theme);
  }

  function toggleDarkMode() {
    useDarkMode.value = !useDarkMode.value;
    // Future: implement light mode variant
  }

  function applyTheme(theme: Theme) {
    const root = document.documentElement;
    const { colors } = theme;

    root.style.setProperty("--color-primary", colors.primary);
    root.style.setProperty("--color-primary-hover", colors.primaryHover);
    root.style.setProperty("--color-secondary", colors.secondary);
    root.style.setProperty("--color-accent", colors.accent);
    root.style.setProperty("--color-background", colors.background);
    root.style.setProperty("--color-surface", colors.surface);
    root.style.setProperty("--color-text", colors.text);
    root.style.setProperty("--color-text-muted", colors.textMuted);
  }

  // Initialize theme on store creation
  function initTheme() {
    applyTheme(currentTheme.value);
  }

  return {
    currentTheme,
    useDarkMode,
    setTheme,
    toggleDarkMode,
    applyTheme,
    initTheme,
  };
});
