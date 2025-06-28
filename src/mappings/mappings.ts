export const componentTagMap: Record<string, string> = {
  panel: 'Panel',
  form: 'Form',
  fieldset: 'Fieldset',
  textfield: 'InputText',
  textarea: 'Textarea',
  numberfield: 'InputNumber',
  datefield: 'Calendar',
  checkbox: 'Checkbox',
  combobox: 'Dropdown',
  radiogroup: 'RadioGroup',
  htmleditor: 'Editor',
  grid: 'DataTable',
  tabpanel: 'TabView',
};

/**
 * Maps an ExtJS component xtype to its corresponding React component tag name.
 *
 * @param xtype - The xtype string from ExtJS (e.g., 'textfield')
 * @returns The React component tag name (e.g., 'InputText')
 */
export function mapXtypeToReactTag(xtype: string): string {
  return componentTagMap[xtype.toLowerCase()] || 'div';
}