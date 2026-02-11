/**
 * Page system type definitions
 */

import type { WidgetInstance } from "./widgets";

/**
 * Grid configuration for a page layout
 */
export interface GridConfig {
  columns: number; // Number of columns (default: 12)
  rowHeight: number; // Height of each row in pixels (default: 80)
  gap: number; // Gap between cells in pixels (default: 16)
  padding: number; // Padding around the grid (default: 16)
}

/**
 * Default grid configuration
 */
export const DEFAULT_GRID_CONFIG: GridConfig = {
  columns: 12,
  rowHeight: 80,
  gap: 16,
  padding: 16,
};

/**
 * Filter configuration for solve data
 */
export interface SolveFilter {
  pageId?: string; // Filter to solves made on this page
  scrambleTypes?: string[]; // Filter by scramble type
  tags?: string[]; // Filter by user tags
  sessionIds?: number[]; // Filter by session
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

/**
 * A user-created or template page
 */
export interface Page {
  id: string; // UUID
  name: string;
  icon: string; // Icon name from @vicons/ionicons5
  description?: string;
  isTemplate: boolean; // true = predefined template, false = user page
  isEditable: boolean; // Can user modify this page?
  sortOrder: number; // Position in sidebar

  // Grid configuration
  gridConfig: GridConfig;

  // Widgets on this page
  widgets: WidgetInstance[];

  // Default filters for widgets on this page
  defaultFilter?: SolveFilter;

  // Default scramble type when starting timer on this page
  defaultScrambleType?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Page templates that users can start from
 */
export type PageTemplateId =
  | "classic-timer"
  | "bld-setup"
  | "algorithm-trainer"
  | "stats-dashboard"
  | "minimal";

/**
 * Minimal data needed to create a new page
 */
export interface CreatePageInput {
  name: string;
  icon?: string;
  fromTemplate?: PageTemplateId;
}
