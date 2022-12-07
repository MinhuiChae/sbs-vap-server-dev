interface IStoreMethodList {
  get?: string,
  post?: string,
  delete?: string,
  update?: string,
}

interface IPagingOption {
  page: string,
  perPage: string,
  total: string,
}

interface IStoreEventList {
  storebeforeload?: Function,
  storeload?: Function,
  storeerror?: Function,
}

interface IStoreOption {
  url: string,
  params?: object,
  method?: IStoreMethodList,
  timeout?: number,
  paging?: IPagingOption,
  events?: IStoreEventList,
  autoLoad?: boolean,
  keyProperty?: string,
  baseParams?: object,
  methodUrl?: any,
}

interface IGridStore extends IStoreOption {
  type?: string,
}

export {
  IStoreMethodList,
  IStoreOption,
  IGridStore,
  IStoreEventList
}
