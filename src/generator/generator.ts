import { ReactComponentMapping } from '../types/ComponentTypes';

export function generateJSXCode(component: ReactComponentMapping, indent = 0): string {
  const { tag, props = {}, events = {}, label, children = [] } = component;
  const id = props.id || props.name || 'field';

  const pad = '  '.repeat(indent);

  const propStr = Object.entries(props)
    .filter(([key]) => key !== 'children')
    .map(([key, value]) =>
      typeof value === 'string' && !value.startsWith('{') && !value.includes('{')
        ? `${key}="${value}"`
        : `${key}={${value}}`
    ).join(' ');

  const eventStr = Object.entries(events)
    .map(([key, handler]) => `${key}={${handler}}`)
    .join(' ');

  const attrs = [propStr, eventStr].filter(Boolean).join(' ').trim();
  const openingTag = `<${tag}${attrs ? ' ' + attrs : ''}>`;
  const closingTag = `</${tag}>`;

  const childContent = props.children
    ? props.children
    : children.map(child => generateJSXCode(child, indent + 1)).join('\n');

  const isInput = ['InputText', 'InputTextarea', 'InputNumber', 'Calendar', 'Dropdown'].includes(tag);

  if (label && isInput) {
    return `${pad}<div className="p-field">
${pad}  <label htmlFor="${id}">${label}</label>
${pad}  <${tag} ${attrs} />
${pad}</div>`;
  }

  if (children.length || props.children) {
    return `${pad}${openingTag}
${childContent}
${pad}${closingTag}`;
  }

  return `${pad}<${tag} ${attrs} />`;
}