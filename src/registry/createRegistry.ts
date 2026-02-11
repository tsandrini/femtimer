import type { WidgetRegistration, WidgetRegistry } from "@/types/registry";
import type { WidgetCategory } from "@/types/widgets";

/**
 * Create a new widget registry instance
 */
export function createWidgetRegistry(): WidgetRegistry {
  const registrations = new Map<string, WidgetRegistration>();

  return {
    register(registration: WidgetRegistration) {
      const { id } = registration.metadata;
      if (registrations.has(id)) {
        console.warn(
          `Widget "${id}" is already registered. Overwriting previous registration.`,
        );
      }
      registrations.set(id, registration);
    },

    unregister(typeId: string) {
      if (!registrations.has(typeId)) {
        console.warn(`Widget "${typeId}" is not registered.`);
        return;
      }
      registrations.delete(typeId);
    },

    get(typeId: string) {
      return registrations.get(typeId);
    },

    getAll() {
      return Array.from(registrations.values());
    },

    getByCategory(category: WidgetCategory) {
      return Array.from(registrations.values()).filter(
        (r) => r.metadata.category === category,
      );
    },

    has(typeId: string) {
      return registrations.has(typeId);
    },
  };
}
