import { ComponentConfig } from '../types/ComponentTypes';
import { formatJSXPropValue } from '../utils/formatJSXPropValue';

/**
 * Generates JSX code from a ComponentConfig object
 * Handles:
 *  - Known tag mapping
 *  - All props (not just whitelisted)
 *  - Children rendering
 *  - TODO comments placed before tag
 */
export function generateJSXCode(component: ComponentConfig): string {
  const { tag, type, props = {}, items = [], events = {}, label } = component;

  const propEntries: string[] = [];
  const todoComments: string[] = [];

  // Include all props in JSX
  for (const [key, value] of Object.entries(props)) {
    if (key === 'xtype') continue;

    const formatted = formatJSXPropValue(value);
    if (formatted !== null) {
      propEntries.push(`${key}=${formatted}`);
    } else {
      todoComments.push(`// TODO: Unhandled prop: ${key}`);
    }
  }

  // Include known events
  for (const [eventKey, handler] of Object.entries(events)) {
    propEntries.push(`${eventKey}={${handler}}`);
  }

  const propsString = propEntries.length > 0 ? ' ' + propEntries.join(' ') : '';
  const childrenJSX = items.map(generateJSXCode).join('\n');
  const isSelfClosing = childrenJSX.trim() === '' && !label && (!items || items.length === 0);

  if (isSelfClosing) {
    return `${todoComments.join('\n')}\n<${tag}${propsString} />`;
  }

  return `${todoComments.join('\n')}\n<${tag}${propsString}>\n  ${childrenJSX}\n</${tag}>`;
}