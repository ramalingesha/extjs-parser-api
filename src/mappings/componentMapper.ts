import { ReactComponentMapping } from "../types/ComponentTypes";

const EVENT_MAP: Record<string, string> = {
  change: 'onChange',
  blur: 'onBlur',
  focus: 'onFocus',
  select: 'onSelect',
  click: 'onClick',
  keyup: 'onKeyUp',
  keydown: 'onKeyDown'
};

export function mapExtInputComponent(ext: any): ReactComponentMapping | null {
  if (!ext || typeof ext !== 'object' || !ext.xtype) return null;

  const { xtype, name, fieldLabel, emptyText, value, id, listeners = {} } = ext;

  const props: Record<string, any> = {
    ...(name && { name }),
    ...(emptyText && { placeholder: emptyText }),
    ...(value !== undefined && { value }),
    id: id || name
  };

  const events: Record<string, any> = {};

  for (const [event, handler] of Object.entries(listeners)) {
    const reactEvent = EVENT_MAP[event.toLowerCase()];
    if (reactEvent) {
      events[reactEvent] = handler;
    }
  }

  let tag = '';
  switch (xtype) {
    case 'textfield': tag = 'InputText'; break;
    case 'textarea': tag = 'InputTextarea'; break;
    case 'numberfield': tag = 'InputNumber'; break;
    case 'datefield': tag = 'Calendar'; break;
    case 'combobox': tag = 'Dropdown'; props.options = '[]'; break;
    default: return null;
  }

  return { tag, props, events, label: fieldLabel };
}