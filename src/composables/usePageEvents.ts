import type { PageEventHandler, PageEventName } from "@/types/events";
import { inject, onUnmounted, provide } from "vue";

const PAGE_EVENTS_KEY = Symbol("pageEvents");

type EventHandlers = Map<PageEventName, Set<PageEventHandler<PageEventName>>>;

export interface PageEventBus {
  emit: <E extends PageEventName>(
    event: E,
    ...args: PageEvents[E] extends undefined ? [] : [PageEvents[E]]
  ) => void;
  on: <E extends PageEventName>(event: E, handler: PageEventHandler<E>) => void;
  off: <E extends PageEventName>(
    event: E,
    handler: PageEventHandler<E>,
  ) => void;
}

// Need to import this for the emit signature
import type { PageEvents } from "@/types/events";

/**
 * Creates and provides a page-level event bus.
 * Call this in the page/container component (e.g., PageEditor).
 */
export function providePageEvents(): PageEventBus {
  const handlers: EventHandlers = new Map();

  const bus: PageEventBus = {
    emit<E extends PageEventName>(
      event: E,
      ...args: PageEvents[E] extends undefined ? [] : [PageEvents[E]]
    ) {
      const eventHandlers = handlers.get(event);
      if (eventHandlers) {
        for (const handler of eventHandlers) {
          if (args.length > 0) {
            (handler as (payload: PageEvents[E]) => void)(args[0]);
          } else {
            (handler as () => void)();
          }
        }
      }
    },

    on<E extends PageEventName>(event: E, handler: PageEventHandler<E>) {
      if (!handlers.has(event)) {
        handlers.set(event, new Set());
      }
      handlers.get(event)!.add(handler as PageEventHandler<PageEventName>);
    },

    off<E extends PageEventName>(event: E, handler: PageEventHandler<E>) {
      const eventHandlers = handlers.get(event);
      if (eventHandlers) {
        eventHandlers.delete(handler as PageEventHandler<PageEventName>);
      }
    },
  };

  provide(PAGE_EVENTS_KEY, bus);
  return bus;
}

/**
 * Injects the page-level event bus.
 * Call this in widget components to emit or subscribe to events.
 * Returns null if no event bus is provided (e.g., in standalone widget testing).
 */
export function usePageEvents(): PageEventBus | null {
  return inject<PageEventBus | null>(PAGE_EVENTS_KEY, null);
}

/**
 * Helper hook to subscribe to an event with automatic cleanup.
 * Automatically unsubscribes when the component is unmounted.
 */
export function usePageEvent<E extends PageEventName>(
  event: E,
  handler: PageEventHandler<E>,
): void {
  const bus = usePageEvents();
  if (!bus) return;

  bus.on(event, handler);

  onUnmounted(() => {
    bus.off(event, handler);
  });
}
