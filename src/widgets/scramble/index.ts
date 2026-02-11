import type { WidgetRegistration } from "@/types/registry";
import {
  DEFAULT_CATEGORY_ID,
  DEFAULT_SCRAMBLE_TYPE_ID,
} from "@/types/scrambles";
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
      categoryId: DEFAULT_CATEGORY_ID,
      scrambleTypeId: DEFAULT_SCRAMBLE_TYPE_ID,
      fontSize: "medium",
    },
    defaultSize: { width: 6, height: 2 },
    minSize: { width: 3, height: 1 },
    configSchema: {
      fields: [
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
