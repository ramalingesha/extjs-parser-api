export function flattenComponents(components: any[]): any[] {
  const result: any[] = [];

  function walk(comp: any) {
    if (comp.xtype) {
      result.push(comp);
    }

    if (Array.isArray(comp.items)) {
      for (const item of comp.items) {
        if (typeof item === 'object') {
          walk(item);
        }
      }
    }
  }

  for (const c of components) {
    walk(c);
  }

  return result;
}