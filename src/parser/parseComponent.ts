import * as t from '@babel/types';
import { ComponentConfig } from '../types/ComponentTypes';
import { mapXtypeToReactTag } from '../mappings/mappings';

/**
 * Parses an ObjectExpression representing an ExtJS component config.
 * Extracts xtype, props, items, and maps to a ComponentConfig.
 */
export function parseComponent(node: t.ObjectExpression): ComponentConfig {
  const config: ComponentConfig = {
    type: 'Unknown',
    tag: '',
    props: {},
    items: [],
  };

  for (const prop of node.properties) {
    if (!t.isObjectProperty(prop) || !t.isIdentifier(prop.key)) continue;
    const key = prop.key.name;

    if (key === 'items' && t.isArrayExpression(prop.value)) {
      config.items = prop.value.elements
        .map((el) => (t.isObjectExpression(el) ? parseComponent(el) : null))
        .filter((c): c is ComponentConfig => !!c);
    } else {
      config.props[key] = prop.value;
    }
  }

  // Set type and tag based on xtype
  const xtypeNode = config.props['xtype'];
  if (xtypeNode && t.isStringLiteral(xtypeNode)) {
    const xtype = xtypeNode.value;
    config.type = xtype;
    config.tag = mapXtypeToReactTag(xtype);

    // Remove xtype from props so it doesn't render in JSX
    delete config.props['xtype'];
  }

  return config;
}