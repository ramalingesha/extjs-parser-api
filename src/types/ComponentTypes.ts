/**
 * Represents a generic component configuration parsed from ExtJS.
 */
export interface ComponentConfig {
  /**
   * The xtype or component type (e.g., 'textfield', 'panel')
   */
  type: string;

  /**
   * Key-value pairs representing component properties.
   * Values are stored as raw Babel AST nodes for later conversion.
   */
  props: Record<string, any>;

  /**
   * Optional list of child components (nested items)
   */
  items?: ComponentConfig[];
}