import {
  IStoreMethodList,
  IStoreOption
} from '@/interfaces/ui/iStore';
import Store from './storeClass';

class JsonStore extends Store {
  constructor(args: IStoreOption) {
    super(args);
  }
}


export default JsonStore;
