/**
 * Widget system type definitions
 */

/**
 * Unique identifier for widget types registered in the system
 */
export type WidgetTypeId = string;

/**
 * Widget categories for organization in the palette
 */
export type WidgetCategory =
  | "timer"
  | "display"
  | "stats"
  | "charts"
  | "utility"
  | "training";

/**
 * Grid position and size for a widget instance
 */
export interface GridPosition {
  x: number; // Column start (0-indexed)
  y: number; // Row start (0-indexed)
  width: number; // Number of columns to span
  height: number; // Number of rows to span
}

/**
 * Size constraints for widgets
 */
export interface SizeConstraints {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Base configuration that all widgets share
 */
export interface BaseWidgetConfig {
  title?: string;
  showHeader?: boolean;
  borderless?: boolean;
}

/**
 * A specific instance of a widget on a page
 */
export interface WidgetInstance<TConfig = Record<string, unknown>> {
  id: string; // Unique instance ID (UUID)
  typeId: WidgetTypeId; // Reference to widget type in registry
  position: GridPosition;
  config: TConfig & BaseWidgetConfig;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Metadata about a widget type (for registry)
 */
export interface WidgetTypeMetadata {
  id: WidgetTypeId;
  name: string;
  description: string;
  icon: string; // Icon name from @vicons/ionicons5
  category: WidgetCategory;
  defaultConfig: Record<string, unknown>;
  defaultSize: { width: number; height: number };
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  configSchema?: WidgetConfigSchema;
}

/**
 * Schema for dynamically generating widget config UI
 */
export interface WidgetConfigSchema {
  fields: WidgetConfigField[];
}

/**
 * Field definition for widget configuration
 */
export interface WidgetConfigField {
  key: string;
  label: string;
  type: "boolean" | "number" | "string" | "select" | "multiselect" | "color";
  default: unknown;
  options?: Array<{ label: string; value: unknown }>;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  description?: string;
}
