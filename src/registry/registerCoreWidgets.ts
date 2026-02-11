import type { WidgetRegistry } from "@/types/registry";

import { solveHistoryWidgetRegistration } from "@/widgets/history";
import { scrambleWidgetRegistration } from "@/widgets/scramble";
import { statsCardWidgetRegistration } from "@/widgets/stats";
// Widget registrations will be imported as they are created
import { timerWidgetRegistration } from "@/widgets/timer";

/**
 * Register all core widgets with the registry
 */
export function registerCoreWidgets(registry: WidgetRegistry): void {
  // Timer category
  registry.register(timerWidgetRegistration);
  registry.register(scrambleWidgetRegistration);

  // Stats category
  registry.register(statsCardWidgetRegistration);
  registry.register(solveHistoryWidgetRegistration);
}
