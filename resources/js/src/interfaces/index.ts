interface IParent extends Window {
  premiereApiInterface: any,
  _GP_CONF: any,
}

interface IDefineColumn {
  name: string,
  type: string,
  title: string,
  class?: string,
  width?: number,
  textAlign?: string,
  dataIndex?: string,
  renderer?: Function,
  icon?: string,
}

interface ITreeNodeData {
  isChecked: boolean,
  isExpanded: boolean,
  isFolder: boolean,
  isCollapsed: boolean,
  deepLevel: number,
  parent: any,
  [key: string]: any,
}

interface IRadioGroupData {
  label: string,
  value: any,
  name: string,
  selected: boolean,
}

interface ISelectDropItemOpt {
  id: string | number,
  label: string,
  selected: boolean,
  [key: string]: any,
}


export {
  IDefineColumn,
  IParent,
  ITreeNodeData,
  IRadioGroupData,
  ISelectDropItemOpt,
}
