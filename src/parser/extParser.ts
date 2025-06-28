import * as babelParser from '@babel/parser';
import traverse from '@babel/traverse';
import { parseComponent } from '../mappings/componentMapper';
import { ComponentConfig } from '../types/ComponentTypes';

/**
 * Parses ExtJS source code and extracts the component configuration.
 * Supports both `Ext.create(...)` and `new Ext.Component(...)` syntax.
 *
 * @param sourceCode - The raw source code containing ExtJS component definitions.
 * @returns Parsed ComponentConfig if found, otherwise null.
 */
export function parseExtJSCode(sourceCode: string): ComponentConfig | null {
  const ast = babelParser.parse(sourceCode, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  let config: ComponentConfig | null = null;

  traverse(ast, {
    CallExpression(path) {
      // Matches Ext.create('Ext.panel.Panel', { ... })
      const callee = path.node.callee;
      if (
        callee.type === 'MemberExpression' &&
        callee.object.type === 'Identifier' &&
        callee.object.name === 'Ext' &&
        callee.property.type === 'Identifier' &&
        callee.property.name === 'create'
      ) {
        const args = path.node.arguments;
        if (args.length >= 2 && args[1].type === 'ObjectExpression') {
          config = parseComponent(args[1]);
        }
      }
    },

    NewExpression(path) {
      // Matches new Ext.form.Panel({ ... })
      const callee = path.node.callee;
      if (
        callee.type === 'MemberExpression' &&
        callee.object.type === 'MemberExpression' &&
        callee.object.object.type === 'Identifier' &&
        callee.object.object.name === 'Ext'
      ) {
        const args = path.node.arguments;
        if (args.length >= 1 && args[0].type === 'ObjectExpression') {
          config = parseComponent(args[0]);
        }
      }
    },
  });

  return config;
}