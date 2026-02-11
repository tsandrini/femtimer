import type { WidgetRegistration } from "@/types/registry";
import StatsCardWidget from "./StatsCardWidget.vue";

export const statsCardWidgetRegistration: WidgetRegistration = {
  metadata: {
    id: "stats-card",
    name: "Stats Card",
    description: "Displays session statistics like ao5, ao12, best time, etc.",
    icon: "StatsChartOutline",
    category: "stats",
    defaultConfig: {
      title: "Session Stats",
      showHeader: false,
      borderless: false,
      showStats: ["ao5", "ao12", "ao100", "mean"],
      layout: "horizontal",
    },
    defaultSize: { width: 6, height: 1 },
    minSize: { width: 3, height: 1 },
    configSchema: {
      fields: [
        {
          key: "showStats",
          label: "Statistics to show",
          type: "multiselect",
          default: ["ao5", "ao12", "ao100", "mean"],
          options: [
            { label: "Solve count", value: "count" },
            { label: "Best time", value: "best" },
            { label: "Worst time", value: "worst" },
            { label: "Mean", value: "mean" },
            { label: "ao5", value: "ao5" },
            { label: "ao12", value: "ao12" },
            { label: "ao50", value: "ao50" },
            { label: "ao100", value: "ao100" },
          ],
        },
        {
          key: "layout",
          label: "Layout",
          type: "select",
          default: "horizontal",
          options: [
            { label: "Horizontal", value: "horizontal" },
            { label: "Grid", value: "grid" },
          ],
        },
      ],
    },
  },
  component: StatsCardWidget,
};
