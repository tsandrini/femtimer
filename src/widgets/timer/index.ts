import type { WidgetRegistration } from "@/types/registry";
import TimerWidget from "./TimerWidget.vue";

export const timerWidgetRegistration: WidgetRegistration = {
  metadata: {
    id: "timer",
    name: "Timer",
    description: "Main cubing timer with hold-to-start functionality",
    icon: "TimerOutline",
    category: "timer",
    defaultConfig: {
      title: "Timer",
      showHeader: false,
      borderless: true,
      holdTime: 300,
      hideTimeWhileRunning: false,
    },
    defaultSize: { width: 6, height: 3 },
    minSize: { width: 4, height: 2 },
    configSchema: {
      fields: [
        {
          key: "holdTime",
          label: "Hold time (ms)",
          type: "number",
          default: 300,
          min: 0,
          max: 1000,
          step: 50,
          description: "How long to hold space before timer is ready",
        },
        {
          key: "hideTimeWhileRunning",
          label: "Hide time while solving",
          type: "boolean",
          default: false,
          description: "Hide the time display during a solve",
        },
      ],
    },
  },
  component: TimerWidget,
};
