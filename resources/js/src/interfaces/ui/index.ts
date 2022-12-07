enum EColumnType {
  'String' = 'string',
  'Checkbox' = 'checkbox',
  'Number' = 'number'
}

enum ETreeItemType {
  'Folder' = 'folder',
  'Item' = 'item'
}

interface IColumn {
  name: string,
  type: EColumnType,
  title: string,
  css?: string,
  style?: string,
  width: string,
  textAlign?: string,
  dataIndex?: string,
}

interface IColumnResizeEventInfo {
  name: string,
  width: number,
  tableWidth?: number,
}

interface ITreeData {
  id: string,
  title: string,
  children: ITreeData[],
  parent: ITreeData,
  type: ETreeItemType,
  datas: any[],
  [key: string]: any
}

interface ISelectUiItemOpts {
  id: string,
  label: string,
  value: any,
  selected: boolean,
  [key: string]: any,
}

interface ISelectUiOpts {
  title: string,
  defaultValue?: any,
  defaultId?: any,
  defaultSelectedItem?: ISelectUiItemOpts | null,
  items: ISelectUiItemOpts[]
}

export {
  EColumnType,
  IColumn,
  IColumnResizeEventInfo,
  ITreeData,
  ETreeItemType,
  ISelectUiOpts,
  ISelectUiItemOpts,
}
