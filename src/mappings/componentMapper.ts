import { ReactComponentMapping } from '../types/ComponentTypes';

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

  const {
    xtype, name, fieldLabel, emptyText, value, id, text, boxLabel, listeners = {}, items = []
  } = ext;

  const props: Record<string, any> = {
    ...(name && { name }),
    ...(emptyText && { placeholder: emptyText }),
    ...(value !== undefined && { value }),
    ...(boxLabel && { children: boxLabel }),
    id: id || name || `field-${Math.random().toString(36).slice(2)}`
  };

  if (text && xtype === 'button') {
    props.children = text;
  }

  const events: Record<string, any> = {};
  for (const [event, handler] of Object.entries(listeners)) {
    const reactEvent = EVENT_MAP[event.toLowerCase()];
    if (reactEvent) events[reactEvent] = handler;
  }

  let tag = '';
  let children: ReactComponentMapping[] = [];

  switch (xtype) {
    case 'textfield': tag = 'InputText'; break;
    case 'textarea': tag = 'InputTextarea'; break;
    case 'numberfield': tag = 'InputNumber'; break;
    case 'datefield': tag = 'Calendar'; break;
    case 'combobox': tag = 'Dropdown'; props.options = '[]'; break;
    case 'checkbox': tag = 'Checkbox'; break;
    case 'button': tag = 'Button'; break;
    case 'radiogroup':
      tag = 'div';
      children = (items || []).map((item: any) => ({
        tag: 'RadioButton',
        props: {
          name: item.name,
          value: item.inputValue,
          children: item.boxLabel
        }
      }));
      break;
    case 'panel': tag = 'div'; break;
    case 'formpanel': tag = 'form'; break;
    default: return null;
  }

  if (xtype !== 'radiogroup' && Array.isArray(items)) {
    children = items.map(mapExtInputComponent).filter((c): c is ReactComponentMapping => !!c);
  }

  return { tag, props, events, label: fieldLabel, children };
}