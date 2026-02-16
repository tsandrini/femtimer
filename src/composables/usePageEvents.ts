import type { PageEventHandler, PageEventName } from "@/types/events";
import { inject, onUnmounted, provide } from "vue";

const PAGE_EVENTS_KEY = Symbol("pageEvents");

// Structure: Map<eventName, Map<linkId, Set<handlers>>>
type EventHandlers = Map<
  PageEventName,
  Map<string, Set<PageEventHandler<PageEventName>>>
>;

export interface PageEventEmitOptions {
  linkId?: string; // undefined = all links receive the event
}

export interface PageEventListenOptions {
  linkId?: string; // undefined = listen to all links
}

export interface PageEventBus {
  emit: <E extends PageEventName>(
    event: E,
    payload: PageEvents[E] extends undefined ? undefined : PageEvents[E],
    options?: PageEventEmitOptions,
  ) => void;
  on: <E extends PageEventName>(
    event: E,
    handler: PageEventHandler<E>,
    options?: PageEventListenOptions,
  ) => void;
  off: <E extends PageEventName>(
    event: E,
    handler: PageEventHandler<E>,
    options?: PageEventListenOptions,
  ) => void;
}

// Need to import this for the emit signature
import type { PageEvents } from "@/types/events";

/**
 * Creates and provides a page-level event bus with link-based filtering.
 * Call this in the page/container component (e.g., PageEditor).
 */
export function providePageEvents(): PageEventBus {
  const handlers: EventHandlers = new Map();

  const bus: PageEventBus = {
    emit<E extends PageEventName>(
      event: E,
      payload: PageEvents[E] extends undefined ? undefined : PageEvents[E],
      options?: PageEventEmitOptions,
    ) {
      const linkHandlers = handlers.get(event);
      if (!linkHandlers) return;

      const emitLinkId = options?.linkId;

      // If linkId is specified, call handlers for that link or wildcard
      // If linkId is undefined, this is an error (widgets should always specify linkId)
      // For backward compatibility, treat undefined as broadcast, but this shouldn't happen
      for (const [linkId, handlerSet] of linkHandlers) {
        const shouldCall = emitLinkId
          ? linkId === emitLinkId || linkId === "*" // Exact match or wildcard
          : linkId === "*"; // Undefined linkId: only call wildcard listeners

        if (shouldCall) {
          for (const handler of handlerSet) {
            if (payload !== undefined) {
              (handler as (payload: PageEvents[E]) => void)(payload);
            } else {
              (handler as () => void)();
            }
          }
        }
      }
    },

    on<E extends PageEventName>(
      event: E,
      handler: PageEventHandler<E>,
      options?: PageEventListenOptions,
    ) {
      if (!handlers.has(event)) {
        handlers.set(event, new Map());
      }
      const linkHandlers = handlers.get(event)!;
      const linkId = options?.linkId ?? "*"; // Default: listen to all links

      if (!linkHandlers.has(linkId)) {
        linkHandlers.set(linkId, new Set());
      }
      linkHandlers.get(linkId)!.add(handler as PageEventHandler<PageEventName>);
    },

    off<E extends PageEventName>(
      event: E,
      handler: PageEventHandler<E>,
      options?: PageEventListenOptions,
    ) {
      const linkHandlers = handlers.get(event);
      if (!linkHandlers) return;

      const linkId = options?.linkId ?? "*";
      const handlerSet = linkHandlers.get(linkId);
      if (handlerSet) {
        handlerSet.delete(handler as PageEventHandler<PageEventName>);
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
 * @param event - The event to listen for
 * @param handler - The event handler
 * @param options - Optional linkId to filter events (undefined = listen to all)
 */
export function usePageEvent<E extends PageEventName>(
  event: E,
  handler: PageEventHandler<E>,
  options?: PageEventListenOptions,
): void {
  const bus = usePageEvents();
  if (!bus) return;

  bus.on(event, handler, options);

  onUnmounted(() => {
    bus.off(event, handler, options);
  });
}
