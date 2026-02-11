import type { WidgetRegistration } from "@/types/registry";
import SolveHistoryWidget from "./SolveHistoryWidget.vue";

export const solveHistoryWidgetRegistration: WidgetRegistration = {
  metadata: {
    id: "solve-history",
    name: "Solve History",
    description: "Shows recent solves in a scrollable list",
    icon: "ListOutline",
    category: "stats",
    defaultConfig: {
      title: "Recent Solves",
      showHeader: true,
      borderless: false,
      maxItems: 50,
      showScramble: true,
      showDate: false,
    },
    defaultSize: { width: 4, height: 4 },
    minSize: { width: 3, height: 2 },
    configSchema: {
      fields: [
        {
          key: "maxItems",
          label: "Max items to show",
          type: "number",
          default: 50,
          min: 5,
          max: 200,
          step: 5,
        },
        {
          key: "showScramble",
          label: "Show scramble",
          type: "boolean",
          default: true,
        },
        {
          key: "showDate",
          label: "Show time",
          type: "boolean",
          default: false,
        },
      ],
    },
  },
  component: SolveHistoryWidget,
};
