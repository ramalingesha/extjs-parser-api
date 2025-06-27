export interface ExtConfig {
  xtype?: string;
  layout?: string;
  region?: string;
  title?: string;
  items?: ExtConfig[];
  [key: string]: any;
}

export interface ParsedComponent {
  id?: string;
  xtype: string;
  config: ExtConfig;
  children?: ParsedComponent[];
}

export interface ExtComponent {
  xtype: string;
  name?: string;
  fieldLabel?: string;
  emptyText?: string;
  value?: string;
  listeners?: Record<string, string>;
  [key: string]: any;
}

export interface ReactComponentMapping {
  tag: string;
  props?: Record<string, string | number | boolean>;
  events?: Record<string, string>;
  label?: string;
}