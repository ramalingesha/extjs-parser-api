/**
 * Resolves each item in an `items` array, replacing variable identifiers with their full component config
 * using the central component store.
 */

import * as t from '@babel/types';
import { ComponentConfig } from '../types/ComponentTypes';
import { componentStore } from '../parser/componentStore';
import { parseComponent } from '../mappings/componentMapper';

/**
 * Recursively resolves identifier-based items from the store and parses inline objects
 */
export function resolveItems(itemsNode: t.Expression | t.ArrayExpression): ComponentConfig[] {
  const resolved: ComponentConfig[] = [];

  if (!t.isArrayExpression(itemsNode)) return resolved;

  for (const element of itemsNode.elements) {
    if (t.isIdentifier(element)) {
      // Lookup variable name from the store
      const resolvedComponent = componentStore.get(element.name);
      if (resolvedComponent) {
        resolved.push(resolvedComponent);
      }
    } else if (t.isObjectExpression(element)) {
      const parsed = parseComponent(element);
      if (parsed && parsed.type !== 'Unknown') {
        resolved.push(parsed);
      }
    } else {
      // Unsupported structure; could log or skip
      continue;
    }
  }

  return resolved;
}
