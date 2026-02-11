/**
 * Scramble type and category definitions for the scramble widget.
 *
 * Categories group related scramble types together (e.g., WCA, 3x3 CFOP, Pyraminx).
 * Scramble types define individual scramble algorithms with their cubing.js event codes.
 */

/**
 * Individual scramble type definition.
 */
export interface ScrambleType {
  /** Unique identifier for this scramble type */
  id: string;
  /** Display name shown in the UI */
  name: string;
  /** Event code for cubing.js randomScrambleForEvent() */
  eventCode: string;
  /** Optional description */
  description?: string;
}

/**
 * Scramble category containing related scramble types.
 */
export interface ScrambleCategory {
  /** Unique identifier for this category */
  id: string;
  /** Display name shown in the UI */
  name: string;
  /** Scramble types belonging to this category */
  types: ScrambleType[];
}

/**
 * WCA standard events category.
 * Contains all official World Cube Association events.
 */
export const WCA_CATEGORY: ScrambleCategory = {
  id: "wca",
  name: "WCA",
  types: [
    { id: "222", name: "2x2x2", eventCode: "222" },
    { id: "333", name: "3x3x3", eventCode: "333" },
    { id: "444", name: "4x4x4", eventCode: "444" },
    { id: "555", name: "5x5x5", eventCode: "555" },
    { id: "666", name: "6x6x6", eventCode: "666" },
    { id: "777", name: "7x7x7", eventCode: "777" },
    { id: "333bf", name: "3x3 Blindfolded", eventCode: "333bf" },
    { id: "333oh", name: "3x3 One-Handed", eventCode: "333oh" },
    { id: "clock", name: "Clock", eventCode: "clock" },
    { id: "minx", name: "Megaminx", eventCode: "minx" },
    { id: "pyram", name: "Pyraminx", eventCode: "pyram" },
    { id: "skewb", name: "Skewb", eventCode: "skewb" },
    { id: "sq1", name: "Square-1", eventCode: "sq1" },
  ],
};

// Future categories can be added here:
// export const CFOP_CATEGORY: ScrambleCategory = { ... }
// export const ROUX_CATEGORY: ScrambleCategory = { ... }
// export const PYRAMINX_CATEGORY: ScrambleCategory = { ... }

/**
 * All available scramble categories.
 * Add new categories here as they are implemented.
 */
export const SCRAMBLE_CATEGORIES: ScrambleCategory[] = [WCA_CATEGORY];

/**
 * Default scramble category ID.
 */
export const DEFAULT_CATEGORY_ID = "wca";

/**
 * Default scramble type ID within the WCA category.
 */
export const DEFAULT_SCRAMBLE_TYPE_ID = "333";

/**
 * Find a category by its ID.
 */
export function findCategory(categoryId: string): ScrambleCategory | undefined {
  return SCRAMBLE_CATEGORIES.find((cat) => cat.id === categoryId);
}

/**
 * Find a scramble type within a category by its ID.
 */
export function findScrambleType(
  categoryId: string,
  typeId: string,
): ScrambleType | undefined {
  const category = findCategory(categoryId);
  return category?.types.find((t) => t.id === typeId);
}

/**
 * Get the event code for a category/type combination.
 * Returns the default (333) if not found.
 */
export function getEventCode(categoryId: string, typeId: string): string {
  const scrambleType = findScrambleType(categoryId, typeId);
  return scrambleType?.eventCode ?? "333";
}

/**
 * Get the available scramble types for a given category.
 * Returns empty array if category not found.
 */
export function getTypesForCategory(categoryId: string): ScrambleType[] {
  const category = findCategory(categoryId);
  return category?.types ?? [];
}
