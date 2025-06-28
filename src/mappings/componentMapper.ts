import { ObjectExpression, isIdentifier, isObjectProperty, isStringLiteral } from '@babel/types';
import { ComponentConfig } from '../types/ComponentTypes';

/**
 * Extracts key-value pairs from an ObjectExpression AST node and returns a ComponentConfig.
 *
 * @param node - Babel AST ObjectExpression node representing ExtJS component config
 * @returns Parsed ComponentConfig with raw key-value pairs
 */
export function parseComponent(node: ObjectExpression): ComponentConfig {
  const config: ComponentConfig = {
    type: 'Unknown',
    props: {},
    items: [],
  };

  node.properties.forEach((prop) => {
    if (!isObjectProperty(prop)) return;

    let key: string;

    if (isIdentifier(prop.key)) {
      key = prop.key.name;
    } else if (isStringLiteral(prop.key)) {
      key = prop.key.value;
    } else {
      return; // Skip unknown key types
    }

    const valueNode = prop.value;

    (config.props as any)[key] = valueNode;

    if (key === 'xtype' && isStringLiteral(valueNode)) {
      config.type = valueNode.value;
    }

    if (key === 'items' && valueNode.type === 'ArrayExpression') {
      config.items = valueNode.elements.map((el) => {
        if (el && el.type === 'ObjectExpression') {
          return parseComponent(el);
        }
        return null;
      }).filter(Boolean) as ComponentConfig[];
    }
  });

  return config;
}