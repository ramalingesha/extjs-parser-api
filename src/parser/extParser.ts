import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export function parseExtJSCode(fileContent: string): any[] {
  const ast = parse(fileContent, {
    sourceType: 'script',
    plugins: ['jsx']
  });

  const components: any[] = [];

  traverse(ast, {
    CallExpression(path) {
      const { node } = path;

      // Match Ext.create(...)
      if (
        t.isMemberExpression(node.callee) &&
        t.isIdentifier(node.callee.object, { name: 'Ext' }) &&
        t.isIdentifier(node.callee.property, { name: 'create' })
      ) {
        const args = node.arguments;

        if (
          args.length >= 2 &&
          t.isStringLiteral(args[0]) &&
          t.isObjectExpression(args[1])
        ) {
          const xtype = args[0].value.split('.').pop()?.toLowerCase(); // e.g., 'textfield'
          const config = extractComponentConfig(args[1]);

          // Set xtype manually
          config.xtype = xtype;

          components.push(config);
        }
      }
    }
  });

  return components;
}

function extractComponentConfig(obj: t.ObjectExpression): any {
  const config: Record<string, any> = {};

  for (const prop of obj.properties) {
    if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
      const key = prop.key.name;

      if (t.isStringLiteral(prop.value)) {
        config[key] = prop.value.value;

      } else if (t.isNumericLiteral(prop.value)) {
        config[key] = prop.value.value;

      } else if (t.isIdentifier(prop.value)) {
        config[key] = prop.value.name;

      } else if (t.isObjectExpression(prop.value)) {
        config[key] = extractComponentConfig(prop.value);

      } else if (t.isArrayExpression(prop.value)) {
        config[key] = prop.value.elements.map((el) => {
          if (t.isObjectExpression(el)) {
            return extractComponentConfig(el);
          } else if (t.isStringLiteral(el)) {
            return el.value;
          } else if (t.isIdentifier(el)) {
            return el.name;
          } else {
            return '[expression]';
          }
        });

      } else {
        config[key] = '[expression]';
      }
    }
  }

  return config;
}