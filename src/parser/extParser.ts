import * as babelParser from '@babel/parser';
import traverse from '@babel/traverse';
import { parseComponent } from '../mappings/componentMapper';
import { ComponentConfig } from '../types/ComponentTypes';
import { isObjectExpression } from '@babel/types';

/**
 * Parses ExtJS source code and extracts the component configuration.
 * Supports:
 *   - Ext.create(...)
 *   - new Ext.Component(...)
 *   - Raw object declarations with xtype (e.g., const t = { xtype: ... })
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

  // Fallback: check for raw object literal assigned to variable (e.g., const t = { xtype: ... })
  if (!config) {
    traverse(ast, {
      VariableDeclarator(path) {
        if (isObjectExpression(path.node.init)) {
          const result = parseComponent(path.node.init);
          // Only treat it as valid if it has a known xtype
          if (result && result.type !== 'Unknown') {
            config = result;
          }
        }
      },
    });
  }

  return config;
}