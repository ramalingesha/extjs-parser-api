/**
 * Defines the intermediate structure for mapping ExtJS components to React JSX.
 */
export interface ComponentConfig {
  /** Type of component (e.g., 'textfield', 'panel') */
  type: string;

  /** React JSX tag name (e.g., 'InputText', 'Panel') */
  tag: string;

  /** Props assigned to the component */
  props: Record<string, any>;

  /** Optional label, button text, etc. */
  label?: string;

  /** Event handlers (onClick, onChange, etc.) */
  events?: Record<string, string>;

  /** Nested child components */
  items?: ComponentConfig[];
}