/**
 * Widget registry type definitions
 */

import type { Component } from "vue";
import type { SolveFilter } from "./pages";
import type {
  BaseWidgetConfig,
  WidgetCategory,
  WidgetTypeMetadata,
} from "./widgets";

/**
 * Props that all widget components receive
 */
export interface WidgetComponentProps<
  TConfig extends BaseWidgetConfig = BaseWidgetConfig,
> {
  instanceId: string;
  config: TConfig;
  isEditMode: boolean;
  filter?: SolveFilter;
}

/**
 * Events that widget components can emit
 */
export interface WidgetComponentEmits {
  (e: "update:config", config: Record<string, unknown>): void;
  (e: "requestResize", size: { width: number; height: number }): void;
}

/**
 * Complete widget registration entry
 */
export interface WidgetRegistration {
  metadata: WidgetTypeMetadata;
  component: Component;
  configComponent?: Component; // Optional custom config UI
}

/**
 * Widget registry interface
 */
export interface WidgetRegistry {
  /**
   * Register a widget type
   */
  register(registration: WidgetRegistration): void;

  /**
   * Unregister a widget type
   */
  unregister(typeId: string): void;

  /**
   * Get a widget registration by type ID
   */
  get(typeId: string): WidgetRegistration | undefined;

  /**
   * Get all registered widgets
   */
  getAll(): WidgetRegistration[];

  /**
   * Get widgets filtered by category
   */
  getByCategory(category: WidgetCategory): WidgetRegistration[];

  /**
   * Check if a widget type is registered
   */
  has(typeId: string): boolean;
}
