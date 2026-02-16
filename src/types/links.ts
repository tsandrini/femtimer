/**
 * Widget Linking System
 *
 * Links allow widgets to communicate only with other widgets in the same link group.
 * This enables multiple independent widget groups on a single page.
 *
 * Examples:
 * - Global link: Show all solves across all pages
 * - Page link "3x3": Timer + Scramble + History for 3x3 training
 * - Page link "2x2": Timer + Scramble + History for 2x2 practice
 */

export type LinkScope = "global" | "page";

export interface Link {
	/** Unique identifier (UUID) */
	id: string;

	/** Display name shown in UI */
	name: string;

	/** Scope of the link */
	scope: LinkScope;

	/** Timestamp when link was created */
	createdAt: number;

	/** Optional color for visual differentiation */
	color?: string;
}

/** Default global link ID - optional global communication channel */
export const DEFAULT_GLOBAL_LINK_ID = "global-default";

/** Helper to create a new link */
export function createLink(
	name: string,
	scope: LinkScope,
	id?: string,
): Link {
	return {
		id: id || crypto.randomUUID(),
		name,
		scope,
		createdAt: Date.now(),
	};
}

/** Helper to get default global link */
export function getDefaultGlobalLink(): Link {
	return {
		id: DEFAULT_GLOBAL_LINK_ID,
		name: "Global",
		scope: "global",
		createdAt: 0,
	};
}
