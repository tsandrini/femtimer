/**
 * Page-level event system types
 *
 * Events are scoped to a page and allow widgets to communicate
 * without tight coupling. Widgets emit events and other widgets
 * can subscribe to react to them.
 */

export interface PageEvents {
  // Timer events
  timerReady: undefined;
  timerStarted: undefined;
  solveFinished: { time: number };

  // Scramble events
  scrambleGenerated: { scramble: string; eventCode: string };
}

export type PageEventName = keyof PageEvents;

export type PageEventPayload<E extends PageEventName> = PageEvents[E];

export type PageEventHandler<E extends PageEventName> =
  PageEvents[E] extends undefined
    ? () => void
    : (payload: PageEvents[E]) => void;
