import { ReactComponentMapping } from "../types/ComponentTypes";

export function generateJSXCode(component: ReactComponentMapping): string {
  const { tag, props = {}, events = {}, label } = component;

  const id = props.id || props.name || 'field';
  if (!props.id) {
    props.id = id;
  }

  const propStr = Object.entries(props)
    .map(([key, value]) =>
      typeof value === 'string' && !value.startsWith('{')
        ? `${key}="${value}"`
        : `${key}={${value}}`
    )
    .join(' ');

  const eventStr = Object.entries(events)
    .map(([key, handler]) => `${key}={${handler}}`)
    .join(' ');

  const parts = [propStr, eventStr].filter(Boolean).join(' ');
  const inputLine = `<${tag} ${parts} />`;

  if (label) {
    return [
      `<div className="p-field">`,
      `  <label htmlFor="${id}">${label}</label>`,
      `  ${inputLine}`,
      `</div>`
    ].join('\n');
  }

  return inputLine.trim();
}