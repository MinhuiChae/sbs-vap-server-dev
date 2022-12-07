import {
  IStoreMethodList,
  IStoreOption
} from '@/interfaces/ui/iStore';

import useFetch from '@/composition/useFetch';

interface IObject {
  [key: string]: any;
}

class Store {
  private url: string = '';
  private params: IObject = {};
  private async: boolean = true; // 기본은 async
  private method: IStoreMethodList = {
    get: 'get',
    post: 'post',
    delete: 'delete',
    update: 'put',
  };
  private timeout: number = 0;

  private responseData: any;
  private events: any;

  private paging: any;

  private keyProperty: string = 'id'; //default ID

  // baseUrl = '/actor/group/{group}/actors/{id}
  private baseParams: object = {};

  private methodUrl: any;

  constructor(args: IStoreOption) {
    this.url = args.url;
    this.params = args.params ?? {};
    if (args.timeout) {
      this.timeout = args.timeout;
    }

    if (args.method){
      this.method.get = args.method.get ?? 'get';
      this.method.post = args.method.post ?? 'post';
      this.method.delete = args.method.delete ?? 'delete';
      this.method.update = args.method.update ?? 'put';
    }

    if (args.events) {
      this.events = args.events;
    }

    if (args.paging) {
      this.paging = args.paging;
    }

    if (args.keyProperty) {
      this.keyProperty = args.keyProperty;
    }

    if (args.baseParams) {
      this.baseParams = args.baseParams;
    }

    // this.methodUrl.get = args.methodUrl.get ?? this.url;
    // this.methodUrl.post = args.methodUrl.post ?? this.url;
    // this.methodUrl.delete = args.methodUrl.delete ?? this.url;
    // this.methodUrl.update = args.methodUrl.update ?? this.url;
  }

  getKeyProperty(): string {
    return this.keyProperty;
  }

  getBaseParam(params: object) {
    this.baseParams = params;
  }

  async request(url: string, method: string, body?: string): Promise<any>{
    const fetchParams: RequestInit = {
      method: method,
      body: body,
    };
    (method === 'get' ? delete fetchParams.body : '');
    return useFetch(url, fetchParams);
  }

  save(datas: any) {
    return new Promise((resolve, reject) => {
      this.request(this.buildQuery(this.method.post as string), this.method.post as string, JSON.stringify(datas))
      .then((response) => {
        this.responseData = response;
        console.log("this.responseData", this.responseData)
        resolve(response);
        this.emitEvent('storeload', response);
      }).catch((response) => {
        reject(response);
        this.emitEvent('storeerror', response);
      });
    });
  }

  delete(keyValue: any) {
    // 만약 delete post 면
    const baseParams = {};
    baseParams[this.keyProperty] = keyValue;
    return new Promise((resolve, reject) => {
      this.request(this.buildQuery(this.method.delete as string, baseParams), this.method.delete as string)
      .then((response) => {
        this.responseData = response;
        delete this.baseParams[this.keyProperty];
        resolve(response);
        // this.emitEvent('storeload', response);
      }).catch((response) => {
        delete this.baseParams[this.keyProperty];
        reject(response);
        this.emitEvent('storeerror', response);
      });
    });

  }

  update(keyValue: any, params: any) {
    const baseParams = {};
    baseParams[this.keyProperty] = keyValue;

    return new Promise((resolve, reject) => {
      this.request(this.buildQuery(this.method.update as string, baseParams), this.method.update as string, JSON.stringify(params)).then((response) => {
        this.responseData = response;
        resolve(response);
        this.emitEvent('storeload', response);
      }).catch((response) => {
        reject(response);
      });
    });
  }

  findItemByKey(id: string): object | undefined {
    return this.responseData.find((data) => data[this.keyProperty] === id);
  }

  load(): Promise<any> {
    this.emitEvent('storebeforeload',);
    return new Promise((resolve, reject) => {
      this.request(this.buildQuery(this.method.get as string), this.method.get as string ,this.buildBody(this.method.get as string))
      .then((response) => {
        this.responseData = response;
        resolve(response);
        this.emitEvent('storeload', response);
      }).catch((response) => {
        reject(response);
        this.emitEvent('storeerror', response);
      });
    });
  }

  emitEvent(eventNm: string, args: any = null) {
    if (this.events && this.events[eventNm] && this.events[eventNm] instanceof Function) {
      this.events[eventNm](this, args);
    }
  }

  setParams(param: string, value: any) {
    this.params[param] = value;
  }

  getParams(): object {
    return this.params;
  }

  getDatas(): object {
    return this.responseData;
  }

  getPagingPage(): string {
    return this.paging ? this.paging['page'] : 'page';
  }

  getPagingPerPage(): string {
    return this.paging ? this.paging['perPage'] : 'perPage';
  }

  getPagingTotal(): string {
    return this.paging ? this.paging['total'] : 'total';
  }

  getParamsQueryString(): string {
    let queryStringArr = [];
    for (const [key, value] of Object.entries(this.params)) {
      if (value) {
        queryStringArr.push(`${key}=${value}`);
      }
    }
    return queryStringArr.length > 0 ? queryStringArr.join("&") : '';
  }

  replaceBaseParamValue(param: string, queryParams?: object) {
    const baseParams = queryParams ?? this.baseParams;
    return baseParams[param] ?? '';
  }

  buildUrl(queryParams?: object): string {
    let url = this.url;
    const urlParams = url.match(/{(.*?)}/g);

    if (urlParams && urlParams.length > 0) {
      urlParams.forEach((urlParam) => {
        const param = urlParam.replace('{', '').replace('}', '');
        url = url.replace(`{${param}}`, this.replaceBaseParamValue(param, queryParams));
      });
    }

    if (url.lastIndexOf('/') === url.length - 1) {
      url = url.substring(0, url.length -1);
    }

    return url;
  }

  buildQuery(type: string, queryParams?: object): string {
    if (type === 'post' || type === 'update') {
      return this.buildUrl(queryParams);
    } else {
      // get 이나
      return `${this.buildUrl(queryParams)}?${this.getParamsQueryString()}`;
    }
  }

  buildBody(type: string): string {
    if (type === 'post') {
      return JSON.stringify(this.params);
    }
    return '';
  }

  deleteItem(id: string) {

  }
}

export default Store;
