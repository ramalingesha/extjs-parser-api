/**
 * Central store for collecting component configurations declared via variables.
 * Enables resolving references like `field`, `panel`, etc. when used in nested items.
 */
import { ComponentConfig } from '../types/ComponentTypes';

class ComponentStore {
  private store: Record<string, ComponentConfig> = {};

  /**
   * Register a named component (e.g., from `const field = new Ext.form.TextField();`)
   * @param name - variable name
   * @param config - parsed component config
   */
  add(name: string, config: ComponentConfig) {
    this.store[name] = config;
  }

  /**
   * Lookup a component by variable name
   */
  get(name: string): ComponentConfig | undefined {
    return this.store[name];
  }

  /**
   * Returns all stored components
   */
  getAll(): Record<string, ComponentConfig> {
    return this.store;
  }

  /**
   * Reset the store
   */
  clear() {
    this.store = {};
  }
}

export const componentStore = new ComponentStore();