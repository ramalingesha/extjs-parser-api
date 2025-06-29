import * as t from '@babel/types';

/**
 * Converts a Babel AST literal or identifier to JSX prop string.
 * Returns null if unsupported.
 */
export function formatJSXPropValue(node: t.Node): string | null {
  if (t.isStringLiteral(node)) {
    return `\"${node.value}\"`;
  }
  if (t.isNumericLiteral(node)) {
    return `{${node.value}}`;
  }
  if (t.isBooleanLiteral(node)) {
    return `{${node.value}}`;
  }
  if (t.isIdentifier(node)) {
    return `{${node.name}}`; // useful for variables or handlers
  }
  if (t.isArrayExpression(node)) {
    const values = node.elements.map(el => {
      if (t.isStringLiteral(el)) return `\"${el.value}\"`;
      if (t.isNumericLiteral(el)) return `${el.value}`;
      return 'null';
    });
    return `{[${values.join(', ')}]}`;
  }
  // Could add more types here (ObjectExpression, etc.)
  return null;
}