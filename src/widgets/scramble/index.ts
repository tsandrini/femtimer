import type { WidgetRegistration } from "@/types/registry";
import ScrambleWidget from "./ScrambleWidget.vue";

export const scrambleWidgetRegistration: WidgetRegistration = {
  metadata: {
    id: "scramble",
    name: "Scramble",
    description:
      "Displays the current scramble with copy and regenerate options",
    icon: "ShuffleOutline",
    category: "display",
    defaultConfig: {
      title: "Scramble",
      showHeader: false,
      borderless: false,
      scrambleType: "333",
      fontSize: "medium",
    },
    defaultSize: { width: 6, height: 2 },
    minSize: { width: 3, height: 1 },
    configSchema: {
      fields: [
        {
          key: "scrambleType",
          label: "Scramble Type",
          type: "select",
          default: "333",
          options: [
            { label: "3x3x3", value: "333" },
            { label: "2x2x2", value: "222" },
            { label: "4x4x4", value: "444" },
            { label: "5x5x5", value: "555" },
            { label: "6x6x6", value: "666" },
            { label: "7x7x7", value: "777" },
            { label: "Pyraminx", value: "pyram" },
            { label: "Megaminx", value: "minx" },
            { label: "Skewb", value: "skewb" },
            { label: "Square-1", value: "sq1" },
            { label: "Clock", value: "clock" },
            { label: "3x3 BLD", value: "333bf" },
            { label: "3x3 OH", value: "333oh" },
          ],
        },
        {
          key: "fontSize",
          label: "Font Size",
          type: "select",
          default: "medium",
          options: [
            { label: "Small", value: "small" },
            { label: "Medium", value: "medium" },
            { label: "Large", value: "large" },
          ],
        },
      ],
    },
  },
  component: ScrambleWidget,
};
