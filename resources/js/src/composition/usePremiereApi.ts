
/** usePremierer Api */
import {
  IParent
} from '@/interfaces';

interface IMarkerInfo {
  inMs: string,
  outMs: string,
  name: string,
  comments: string,
  colorType: string,
}

const usePremiereApi = () => {

  const getAllFileNameInBin = async() => {
    const extractExtensions = [];
    console.log((parent as IParent)._GP_CONF._EXTRACT_EXTENSIONS);
    const result = await (parent as IParent).premiereApiInterface?.execApi('getAllFileNameInBin', [(parent as IParent)._GP_CONF._EXTRACT_EXTENSIONS]);
    return jsonParser(result);
  }

  const getExtractId = async(params: any, opts: any) => {
    try{
      const result = await (parent as IParent).premiereApiInterface?.execApi('getExtractId', [params, opts]);
      return jsonParser(result);
    } catch(err) {
      return jsonParser(err as string);
    }
  }

  const getExtractPercent = () => {
    if ((parent as IParent).premiereApiInterface) {
      const worker =  (parent as IParent).premiereApiInterface.getWorker();
      return worker?.getProcessPercent() ?? 0;
    }

    return 0;
  }

  const getWorker = () => {
    if ((parent as IParent).premiereApiInterface) {
      return (parent as IParent).premiereApiInterface.getWorker();
    }

    return undefined;
  }

  const selectItem = async(id: string) => {
    try{
      const result = await (parent as IParent).premiereApiInterface?.execApi('selectNodeIdInGetFileList', [id]);
      return jsonParser(result);
    } catch(err) {
      return jsonParser(err as string);
    }
  }

  const openItemInSourceMonitor = async(id: string, inPoint: string, outPoint: string) => {
    try{
      const result = await (parent as IParent).premiereApiInterface?.execApi('openItemInSourceMonitorByNodeId', [id, inPoint, outPoint]);
      return jsonParser(result);
    } catch(err) {
      return jsonParser(err as string);
    }
  }

  const makeMarker = async(id: string, markerInfo: IMarkerInfo) => {
    try{
      const jsonMaerkerInfo  = JSON.stringify(markerInfo);
      const result = await (parent as IParent).premiereApiInterface?.execApi('setMarkerByNodeIdInGetFileList', [id, jsonMaerkerInfo]);

      return jsonParser(result);
    } catch(err) {
      return jsonParser(err as string);
    }
  }

  const deleteMarker = async(id: string, markerGuid: string) => {
    try{
      const result = await (parent as IParent).premiereApiInterface?.execApi('deleteMarkerByNodeIdInGetFileList', [id, markerGuid]);

      return jsonParser(result);
    } catch(err) {
      return jsonParser(err as string);
    }
  }

  const updateGroup = async(groupId: string) => {
    try {
      const result = await (parent as IParent).premiereApiInterface?.execApi('updateGroup', [groupId]);
      return jsonParser(result);
    } catch(err) {
      return jsonParser(err as string);
    }
  }

  const getReadSettingGroup = async() => {
    try{
      const result = await (parent as IParent).premiereApiInterface?.execApi('getReadSettingGroup', []);
      return jsonParser(result);
    } catch(err) {
      return jsonParser(err as string);
    }
  }

  const setInOutPointInProjectItem = async(id: string, inPoint: string, outPoint: string) => {
    try{
      const result = await (parent as IParent).premiereApiInterface?.execApi('setInOutPointInProjectItem', [id, inPoint, outPoint]);
      return jsonParser(result);
    } catch(err) {
      return jsonParser(err as string);
    }
  }

  const sendEventMessage = async(msg: string, type:string = 'info') => {
    try{
      const result = await (parent as IParent).premiereApiInterface?.execApi('sendEventMessage', [msg, type]);
      return jsonParser(result);
    } catch(err) {
      return jsonParser(err as string);
    }
  }

  const razorClipItem = async(id: string, inPoint: string, outPoint: string) => {
    try{
      const result = await (parent as IParent).premiereApiInterface?.execApi('razorClipInOutPointByNodeId', [id, inPoint, outPoint]);
      return jsonParser(result);
    } catch(err) {
      return jsonParser(err as string);
    }
  }

  //setMarkerByNodeIdInGetFileList

  const jsonParser = (jsonString: string) => {
    let rtnObject: any = {};
    try {
      const jsonDatas = JSON.parse(jsonString);
      rtnObject = jsonDatas;

    } catch(e) {
      rtnObject.success = false;
      rtnObject.msg = 'String Json Parser Error';
    }

    return rtnObject;
  }

  return {
    openItemInSourceMonitor,
    getAllFileNameInBin,
    sendEventMessage,
    getExtractId,
    getExtractPercent,
    getWorker,
    selectItem,
    makeMarker,
    deleteMarker,
    updateGroup,
    getReadSettingGroup,
    setInOutPointInProjectItem,
    razorClipItem,
  }
}

export {
  IMarkerInfo
}

export default usePremiereApi;
