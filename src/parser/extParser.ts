import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export function parseExtJSCode(fileContent: string): any[] {
  const ast = parse(fileContent, {
    sourceType: 'script',
    plugins: ['jsx']
  });

  const instanceMap = new Map<string, any>();
  const assignments: { target: string; prop: string; value: any }[] = [];

  traverse(ast, {
    VariableDeclarator(path) {
      const { id, init } = path.node;

      if (
        t.isIdentifier(id) &&
        t.isNewExpression(init) &&
        t.isMemberExpression(init.callee)
      ) {
        const callee = init.callee;
        const xtype = t.isIdentifier(callee.property)
          ? callee.property.name.toLowerCase()
          : 'unknown';

        const config: any = { xtype };

        instanceMap.set(id.name, config);
      }
    },

    AssignmentExpression(path) {
      const { left, right } = path.node;
      if (
        t.isMemberExpression(left) &&
        t.isIdentifier(left.object) &&
        t.isIdentifier(left.property)
      ) {
        const varName = left.object.name;
        const key = left.property.name;

        const value = extractValue(right, instanceMap);
        if (instanceMap.has(varName)) {
          const existing = instanceMap.get(varName);
          if (key === 'items' && Array.isArray(value)) {
            existing.items = value.map(v => (typeof v === 'string' ? instanceMap.get(v) || { ref: v } : v));
          } else {
            existing[key] = value;
          }
        }
      }
    },

    CallExpression(path) {
      const { node } = path;

      if (
        t.isMemberExpression(node.callee) &&
        t.isIdentifier(node.callee.object, { name: 'Ext' }) &&
        t.isIdentifier(node.callee.property, { name: 'create' })
      ) {
        const args = node.arguments;
        if (args.length >= 2 && t.isStringLiteral(args[0]) && t.isObjectExpression(args[1])) {
          const xtype = args[0].value.split('.').pop()?.toLowerCase();
          const config = extractComponentConfig(args[1]);
          config.xtype = xtype;
          instanceMap.set(`_anonymous_${instanceMap.size}`, config);
        }
      }
    }
  });

  // Return only top-level components (not ones nested in others)
  const all = Array.from(instanceMap.values());
  const nested = new Set();

  for (const comp of all) {
    if (Array.isArray(comp.items)) {
      comp.items.forEach((child: unknown) => nested.add(child));
    }
  }

  const roots = all.filter(comp => !nested.has(comp));
  return roots;
}

function extractComponentConfig(obj: t.ObjectExpression): any {
  const config: Record<string, any> = {};

  for (const prop of obj.properties) {
    if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
      const key = prop.key.name;
      const val = prop.value;

      config[key] = extractValue(val as t.Expression);
    }
  }

  return config;
}

function extractValue(val: t.Expression, instanceMap?: Map<string, any>): any {
  if (t.isStringLiteral(val)) return val.value;
  if (t.isNumericLiteral(val)) return val.value;
  if (t.isIdentifier(val)) {
    return instanceMap?.get(val.name) || val.name;
  }
  if (t.isArrayExpression(val)) {
    return val.elements.map(el => {
      if (t.isObjectExpression(el)) return extractComponentConfig(el);
      if (t.isIdentifier(el)) return instanceMap?.get(el.name) || el.name;
      return '[expression]';
    });
  }
  if (t.isObjectExpression(val)) return extractComponentConfig(val);
  return '[expression]';
}