export const componentMap: Record<string, { name: string; import: string }> = {
  panel: { name: 'Panel', import: 'primereact/panel' },
  tabpanel: { name: 'TabView', import: 'primereact/tabview' },
  grid: { name: 'AgGridReact', import: 'ag-grid-react' },
  gridpanel: { name: 'AgGridReact', import: 'ag-grid-react' },
  form: { name: 'form', import: '' }, // native element
  button: { name: 'Button', import: 'primereact/button' }
};