import * as babelParser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { parseComponent } from '../mappings/componentMapper';
import { ComponentConfig } from '../types/ComponentTypes';
import { componentStore } from './componentStore';
import { resolveItems } from './resolveItems';
import { mapXtypeToReactTag } from '../mappings/mappings';

/**
 * Extracts xtype string from constructor path like Ext.form.Panel or Ext.Button
 */
function extractXtypeFromConstructor(callee: t.NewExpression['callee']): string | null {
  if (!t.isMemberExpression(callee)) return null;

  let parts: string[] = [];
  let current: t.MemberExpression | t.Identifier = callee;

  while (t.isMemberExpression(current)) {
    if (t.isIdentifier(current.property)) {
      parts.unshift(current.property.name);
    }
    current = current.object as any;
  }

  if (t.isIdentifier(current)) {
    parts.unshift(current.name);
  }

  // Expect something like ['Ext', 'form', 'TextField']
  if (parts[0] === 'Ext') {
    return parts.slice(1).join('.').toLowerCase(); // "form.textfield" or just "button"
  }

  return null;
}

/**
 * Parses ExtJS source code and extracts the component configuration.
 * Supports:
 *   - Ext.create(...)
 *   - new Ext.Component(...)
 *   - Raw object declarations with xtype (e.g., const t = { xtype: ... })
 *   - Incremental assignments after `new Ext.Component()`
 *   - Resolving references across variable assignments (via componentStore)
 *
 * @param sourceCode - The raw source code containing ExtJS component definitions.
 * @returns Parsed ComponentConfig if found, otherwise null.
 */
export function parseExtJSCode(sourceCode: string): ComponentConfig | null {
  const ast = babelParser.parse(sourceCode, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });

  componentStore.clear();

  // Step 1: Collect components declared via new Ext.Component()
  traverse(ast, {
    NewExpression(path) {
      const xtype = extractXtypeFromConstructor(path.node.callee);
      if (!xtype) return;

      const parent = path.parent;
      if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
        const varName = parent.id.name;
        const config: ComponentConfig = {
          type: xtype,
          tag: mapXtypeToReactTag(xtype),
          props: {},
          items: [],
        };
        componentStore.add(varName, config);
      }
    },

    // Step 2: Assign props incrementally (e.g., field.name = 'value')
    ExpressionStatement(path) {
      const expr = path.node.expression;
      if (
        t.isAssignmentExpression(expr) &&
        t.isMemberExpression(expr.left) &&
        t.isIdentifier(expr.left.object) &&
        t.isIdentifier(expr.left.property)
      ) {
        const varName = expr.left.object.name;
        const propName = expr.left.property.name;

        let config = componentStore.get(varName);

        // If not already tracked, initialize a new blank config
        if (!config) {
          const inferredXtype = propName === 'handler' ? 'button' : 'unknown';
          config = {
            type: inferredXtype,
            tag: mapXtypeToReactTag(inferredXtype),
            props: {},
            items: [],
          };
          componentStore.add(varName, config);
        }

        if (propName === 'items' && t.isArrayExpression(expr.right)) {
          config.items = resolveItems(expr.right);
        } else {
          config.props[propName] = expr.right;
        }
      }
    },

    // Step 3: Ext.create with inline config
    CallExpression(path) {
      const callee = path.node.callee;
      if (
        t.isMemberExpression(callee) &&
        t.isIdentifier(callee.object) &&
        callee.object.name === 'Ext' &&
        t.isIdentifier(callee.property) &&
        callee.property.name === 'create'
      ) {
        const args = path.node.arguments;
        if (args.length >= 2 && t.isObjectExpression(args[1])) {
          const config = parseComponent(args[1]);
          const parent = path.parent;
          if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
            componentStore.add(parent.id.name, config);
          }
        }
      }
    },

    // Step 4: Raw config objects like `const x = { xtype: ... }`
    VariableDeclarator(path) {
      if (t.isObjectExpression(path.node.init) && t.isIdentifier(path.node.id)) {
        const result = parseComponent(path.node.init);
        if (result && result.type !== 'Unknown') {
          componentStore.add(path.node.id.name, result);
        }
      }
    }
  });

  // Return the component with 'renderTo', or fallback to last defined
  const all = Object.values(componentStore.getAll());
  const root = all.find(c => c.props?.renderTo) || all.at(-1) || null;

  return root;
}