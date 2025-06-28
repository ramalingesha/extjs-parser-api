import { ComponentConfig } from '../types/ComponentTypes';
import { mapXtypeToReactTag } from '../mappings/mappings';
import * as t from '@babel/types';

/**
 * Converts a ComponentConfig into JSX code.
 *
 * @param component - The parsed component configuration
 * @returns A string of JSX representing the React component
 */
export function generateJSX(component: ComponentConfig): string {
  const { type, props, items } = component;

  const tag = mapXtypeToReactTag(type);
  const propEntries: string[] = [];

  for (const key in props) {
    const node = props[key];
    if (!node) continue;

    // Convert string literals and identifiers to JSX props
    if (t.isStringLiteral(node)) {
      propEntries.push(`${key}="${node.value}"`);
    } else if (t.isNumericLiteral(node)) {
      propEntries.push(`${key}={${node.value}}`);
    } else if (t.isBooleanLiteral(node)) {
      propEntries.push(`${key}={${node.value}}`);
    } else if (t.isIdentifier(node)) {
      propEntries.push(`${key}={${node.name}}`);
    } else if (t.isObjectExpression(node)) {
      propEntries.push(`${key}={{...}}`); // Placeholder for objects
    }
  }

  const propString = propEntries.length > 0 ? ' ' + propEntries.join(' ') : '';

  if (items && items.length > 0) {
    const children = items.map(generateJSX).join('\n');
    return `<${tag}${propString}>\n${children}\n</${tag}>`;
  }

  return `<${tag}${propString} />`;
}