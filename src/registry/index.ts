import type { WidgetRegistry } from "@/types/registry";
import { createWidgetRegistry } from "./createRegistry";
import { registerCoreWidgets } from "./registerCoreWidgets";

// Singleton registry instance
let registry: WidgetRegistry | null = null;

/**
 * Get the global widget registry instance.
 * Creates and initializes the registry on first call.
 */
export function getWidgetRegistry(): WidgetRegistry {
  if (!registry) {
    registry = createWidgetRegistry();
    registerCoreWidgets(registry);
  }
  return registry;
}

/**
 * Reset the registry (mainly for testing)
 */
export function resetWidgetRegistry(): void {
  registry = null;
}

// Re-export for convenience
export { createWidgetRegistry };
