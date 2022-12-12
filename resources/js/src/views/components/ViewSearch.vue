<template>
  <div class = 'test-panel' ref = "el">
    <VirtualPanel
      :store = "state.jsonStore"
      :defaultItemHeight = "100"
      :emptyText="emptyText"
      :buildGridDataFn = "buildGridDataFn"
      ref = "virtualPanelComp"
    >
      <template #header-slot>
        <div class = 'header-search-tool-wrapper'>
          <div class = 'tools-info'>
            <div class ='file-select-wrapper' v-if = "false">
              <SelectDropUi class='file-select'
              :itemHeight = "450"
              :minWidth = "150"
              :selectOpts="state.fileSelectOpts"
              @selectedEvt="onChangeFile "/>
            </div>
            Total : {{ state.total }}
            <span class ='marker-info'> 마커적용된 항목 : {{ getMarkerSize }} </span>
          </div>
          <div class = 'tools-btns'>
            <button class ='btn-normal' v-for = "button in toolsButtons" :key = "button" @click.stop="button.clickAction()">
              {{ button.label }}
            </button>
            <button class ='btn-normal' @click.stop="onGoListPage">
              <div class="btnDiv">
                <fileListIcon :width ="15" :height = "15" iconColor="white"></fileListIcon>
                <div class="btn-content">추출 파일 리스트</div>
              </div>
            </button>
            <button class ='btn-normal' @click.stop.prevent="onOpenMakerSelectModal">
              <div class="btnDiv">
                <markerIcon :width ="15" :height = "15" iconColor="white"></markerIcon>
                <div class="btn-content">마커적용</div>
              </div>
            </button>
          </div>
        </div>
      </template>
      <template #content-row-template = "{data, dataIndex}">
        <div class = 'content-row-wrapper' :aria-data-id="data.id">
          <div class = 'content-row_content-number'> {{ dataIndex + 1 }} </div>
          <div class = 'content-row_content-wrapper'>
            <div class = 'content-row_content-checkbox'>
              <input type="checkbox" v-model="data.isChecked" />
            </div>
            <div class = 'content-row_content_body-wrapper'>
              <div class = 'content-row_content_body'>
                <template v-if= "searchType !== 'actor'">
                  <div class = 'label '>
                    <span class ='stt-type'>
                      {{ getTypeText }}
                    </span>
                  </div>
                </template>
                <template v-else>
                    <div class ='image-wrapper' :style = "getImage(faceDatas[0])"/>
                </template>
                <div>
                  <div class ='tc-file-name-info'>
                    <span class ='tc-file-name' @click.stop="onSelectFile(data)"> {{ data.fileNm }}</span>
                   </div>
                  <div class = 'tc-info'>
                    <div><span class = 'tc-label'> IN </span> <span class = "tc-txt"> {{ getFrameRate(data.framerate, data.st_frame) }} </span></div>
                    <div><span class = 'tc-label'> OUT </span> <span class = "tc-txt"> {{ getFrameRate(data.framerate, data.end_frame) }} </span></div>
                    <div><span class = 'tc-label'> RT </span> <span class = "tc-txt"> {{ getFrameRate(data.framerate, data.end_frame - data.st_frame) }} </span></div>
                  </div>
                </div>
              </div>
              <template v-if= "searchType !== 'actor'">
                <div class = 'content-row_content_body' v-if ="searchType !== 'people'">
                  <div class = 'label'> 내용 </div>
                  <div class = 'content'> {{ data.contents }} </div>
                </div>
              </template>
            </div>
            <div class = 'content-row_tools'>
              <div v-tooltip="'cut'">
                <RazorIcon class ='icon' v-bind:disabled="state.isMarkBtnDisabled"  @click.stop.prevent = "onRazerItem($event, data)" />
              </div>
            </div>
            <div class = 'content-row_tools' :class = "isMarkedCss(data)" @click.stop.prevent="setMark(data)"> 
              <div v-tooltip="'mark'">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24">
                <path d="M9 21.035l-9-8.638 2.791-2.87 6.156 5.874 12.21-12.436 2.843 2.817z"/>
                </svg>
                
              </div>
            </div>
            <div class = 'content-row_tools'> 
              <div v-tooltip="'delete'">
                <CloseBtnIcon @click.stop.prevent = "onDeleteItem($event, data)" /> 
              </div>
            </div>
          </div>
        </div>
      </template>
    </VirtualPanel>
  </div>
  <teleport to="body">
    <MarkerSelectModal v-if="state.isOpenMakerSelectModal"
      @closeAction = "onCloseAction"
      @acceptAction = "onAcceptMarkerColorSelect"
    >
    </MarkerSelectModal>
    <MarkerProcessModal v-if="state.isOpenMarkerProcessModal"
      @closeAction = "onCloseActionMarkerProcessModal"
      :percent="state.markerProcessPercent"
    />
  </teleport>
</template>
<script lang="ts">
import { computed, defineComponent, inject, nextTick, onMounted, reactive, ref, Ref, watch } from 'vue';
import VirtualPanel from '@/components/ui/vitualpanel/VitualPanel.vue';
import useTiemcode from '@/composition/useTimeCode';
import CloseBtnIcon from '@/components/icons/closeBtnIcon.vue';
import { useRouter } from 'vue-router';
import usePremiereApi , { IMarkerInfo } from '@/composition/usePremiereApi';
import ViewNaviTop from '@/views/navigator/ViewNavTop.vue';
import MarkerSelectModal from '@/views/modal/MarkerSelectModal.vue';
import MarkerProcessModal from '@/views/modal/MarkerProcessModal.vue';
import useCommon from '@/composition/useCommon';
import useCustomEvent from '@/composition/useCustomEvent';
import SelectDropUi from '@/components/ui/selectdrop/SelectDrop.vue';
import _, { isBoolean } from 'lodash';
import Store from '@/composition/lib/storeClass';
import fileListIcon from '@/components/icons/fileListIcon.vue';
import markerIcon from '@/components/icons/markerIcon.vue';
import RazorIcon from '@/components/icons/razorIcon.vue';
import 'floating-vue/dist/style.css';


export default defineComponent({
  name: 'viewSearch',
  components: {
    VirtualPanel,
    CloseBtnIcon,
    ViewNaviTop,
    MarkerSelectModal,
    MarkerProcessModal,
    SelectDropUi,
    fileListIcon,
    markerIcon,
    RazorIcon
  },
  props: {
    store: {
      type: Object,
      default: null,
    },
    searchType: {
      type: String,
      default: 'text',
    },
    toolsButtons: {
      type: Array(Object),
      default: [],
    },
    serachWord: {
      type: String,
      default: '',
    },
    autoLoad: {
      type: Boolean,
      default: true,
    },
    emptyText: {
      type: String,
      default : "검색된 데이터가 없습니다."
    },
    faceDatas: {
      type: Array(Object),
      default: [],
    }
  },

  setup(props) {
    const _state: any | undefined = inject('state');
    const _extractMarker = inject('extractMarker') as Ref<Map<string, object>>;
    const { selectItem,
      openItemInSourceMonitor,
      makeMarker,
      deleteMarker,
      sendEventMessage, razorClipItem, setInOutPointInProjectItem } = usePremiereApi();
    const { disPacthEvent } = useCustomEvent();
    const searchInputEl = ref<HTMLInputElement>();
    const el = ref<HTMLElement>();
    const virtualPanelComp = ref<InstanceType<typeof VirtualPanel>>();
    const state = reactive({
      isMarkBtnDisabled: false,
      searchValue: '',
      total: 0,
      jsonStore: {} as any,
      test: useCommon.getApiTest() === 'true' ?? false,
      datasMap: new Map<string, any>(),
      markerMap: new Map<string, any>(),
      searchWord: '',
      isSearchBtnDisabled: false,
      transitionElList: new Map<number, any>(),
      useDeleteTransition: true,
      isOpenMakerSelectModal: false,
      selectedMarkerColorType: '',
      isOpenMarkerProcessModal: false,
      markerProcessPercent: 0,
      searchContentIds: [],
      fileSelectOpts: {
        title: '파일 그룹',
        items: []
      },
      datas: [],
      selectedFilter: 'all',
    });

    const getTypeText = computed(() => {
      if (props.searchType === 'text') {
        return '대사';
      } else if(props.searchType === 'actor') {
        return '인물'
      } else if(props.searchType === 'subtitle') {
        return '자막'
      }
    })

    const router = useRouter();
    const isMarkedCss = computed(() => (data: any) => data.marker === true ? 'mark-on' : 'mark-off');
    const setStateTotal = (total: number) => {
      state.total = total;
    }

    const onStoreaLoad = (store: any) => {
      if (Number.isInteger(store?.responseData.total)) {
        setStateTotal(store?.responseData.total);
      }

      console.log('onStoreaLoad');
      state.isSearchBtnDisabled = false;
    }

    const onStoreBeforeLoad = (store: any) => {
      console.log('onStoreBeforeLoad');
      state.isSearchBtnDisabled = true;
    }

    const getFrameRate = (frameRate: number, frame: number) => {
      return new useTiemcode(frameRate).getTimeCodeByFrame(frame).toString();
    }

    const getFileName = (key: string) => state.datasMap.get(key)?.name ?? '';

    const onGoListPage = () => {
      // router.back(-1);
      router.push({
        name: 'Export List',
        query: {
          refresh: 1
        }
      });
    }

    const onSearchTxtClear = () => {
      state.searchWord = '';
      searchInputEl.value.focus();
    }

    const makeStore = () => {
      const ids = state.searchContentIds;
      const faceStore = {
        params: {
          content_ids: ids,
        },
        method: {
          get: 'post',
        },
        events: {
          'storeload': onStoreaLoad,
          'storebeforeload': onStoreBeforeLoad,
          'storeerror': onStoreError,
        },
        autoLoad: props.autoLoad,
      }

      const store = {
        type: 'json',
        url: `${useCommon.getApiUrl()}/${state.searchValue}/search`,
        params: { // Object
          page: 1,
          per_page: 100000,
          content_ids: ids,
          search_word: '',
          search_columns: ['contents'],
        },
        paging: {
          page: 'currentPage',
          perPage: 'page',
          total: 'total',
        },
        method: {
          get: 'post',
        },
        events: {
          'storeload': onStoreaLoad,
          'storebeforeload': onStoreBeforeLoad,
          'storeerror': onStoreError,
        },
        autoLoad: props.autoLoad,
      }

      if (props.searchType === 'actor') {
       state.jsonStore = _.merge(faceStore, props.store);
      } else {
        state.jsonStore = _.merge(store, props.store);
      }
    }

    const onStoreError = (self: any , args: any) => {
      if (args && String(args).indexOf('parse URL') > -1) {
        console.error('데이터 접근이 실패 하였습니다.');
      }
    }

    const onCheckedItem = (row: any) => {
      row.isChecked = row.isChecked;
    }

    const onSearch = () => {
      console.log('searchStart');
      if (state.isSearchBtnDisabled === false) {
        (virtualPanelComp.value.store.params as any).search_word = state.searchWord;
        storeLoad();
      }
    }

    const storeLoad = () => {
      if (virtualPanelComp.value) {
        virtualPanelComp.value.storeLoad()
      }
    }

    const setSearchValue = () => {
      if(props.searchType === 'subtitle') {
        state.searchValue = 'ocr'
      } else if(props.searchType === 'text') {
        state. searchValue = 'stt'
      }
    }


    const setStoreParams = (param, value) => {
      console.log(virtualPanelComp.value);
      if (virtualPanelComp.value) {
        (virtualPanelComp.value.state.store as Store).setParams(param, value);
      }
    }

    const init = () => {
      state.datasMap = new Map<string, any>(); // 초기화
      let contents_ids: string[] = [];
      _state.datas.forEach((item) => {
        contents_ids.push(item.datas[0].id);
        state.datasMap.set(item.datas[0].id, item.datas[0]);
      });

      if (state.test) {
        state.datasMap.clear();
        contents_ids = ['J5687T580552', 'J5687T580553', 'J5687T580554'];
        _state.datas.forEach((item, i) => {
          const sbsId = contents_ids[i%3];
          state.datasMap.set(sbsId, item.datas[0]);
        });
      }

      state.searchContentIds = contents_ids;

      setSearchValue();
      makeStore();
    }

    const onSelectFile = async (data: any) => {
      const id = data.content_id;
      const nodeId = state.datasMap.get(id)?.nodeId;
      if (!nodeId) return;
      const result = await selectItem(nodeId);
      if (result.success === true) {
        const { inPoint , outPoint } = getInOutPoint(data);
        const openItemResult = await openItemInSourceMonitor(nodeId, inPoint, outPoint);
      }
    }

    const onDeleteItem = (event: MouseEvent, data: any) => {
      const transitionElList = [];
      if (state.useDeleteTransition === true) {
        const itemList = el.value.getElementsByClassName("vue-recycle-scroller__item-view");
        state.transitionElList.clear();
        Array.from(itemList).forEach((child) => {
          const contentRow = child.getElementsByClassName('content-row-wrapper');
          if (contentRow && contentRow[0]){
            const dataId = contentRow[0].getAttribute('aria-data-id');
            state.transitionElList.set(Number(dataId), child);
          }
        });
        const item = state.transitionElList.get(data.id);
        if (item){
          // 클릭한 높이 보다 아래 것들만 적용 해보자
          // const transformY = item.style.transform.replace('translateY(').reaplce('px)');
          item.style.transform = `translateX(200%) ${item.style.transform}`;
          item.classList.add('item-trasition');
          state.transitionElList.forEach((value, key) => {
            if (key > Number(data.id)) {
              if (value.style.transform && (value.style.transform.indexOf('-999') === -1)) {
                value.classList.add('item-trasition');
                transitionElList.push(value);
              }
            }
          })

          setTimeout(() => {
            item.classList.add('event-none');
          },50);
        }
        setTimeout(()=> {
          transitionElList.forEach((child) => {
            child.classList.remove('item-trasition')
          });
        },400);
      }

      setTimeout(()=> {
        const result = virtualPanelComp.value.deleteItem(data.id);
        if (result === false) {
          console.error("삭제 아이템을 찾지 못하였습니다.");
        } else {
          if (state.markerMap.has(data.id)) {
            state.markerMap.delete(data.id);
          }

          const fileInfo = state.datasMap.get(data.content_id);
          if (fileInfo) {
            fileInfo.cnt = fileInfo.cnt - 1 < 0 ? 0 : fileInfo.cnt - 1;
            state.datasMap.set(data.content_id, fileInfo);
          }
        }
        buildFileSelectOpts();
      }, 50);
    }

    const getInOutPoint = (data: any) => {
      return {
        inPoint: (data.st_frame / Number(data.framerate)).toFixed(6),
        outPoint: (data.end_frame / Number(data.framerate)).toFixed(6),
      }
    }

    const addMarker = async (data: any, colorType: string = '0', markerName: string = ''): Promise<object> => {
      const resultInfo = {
        success: false,
        msg: '',
      }

      if (data.content_id && data.marker === false) {
        const nodeId = state.datasMap.get(data.content_id)?.nodeId ?? null;
        if (nodeId) {
          const { inPoint , outPoint } = getInOutPoint(data);
          const markResult = await makeMarker(nodeId, {
            inMs: inPoint,
            outMs: outPoint,
            name: markerName,
            comments: data.contents,
            colorType: colorType,
          });

          if (markResult.success === true) {
            resultInfo.success = true;
            state.markerMap.set(data.id, data);
            data.marker = true;
            _extractMarker.value.set(data.content_id, markResult.data.markers);
            const insertMarker = findMarker(_extractMarker.value.get(data.content_id) as any[], Number(inPoint).toFixed(2), Number(outPoint).toFixed(2));
            if (insertMarker) {
              data.guid = insertMarker.guid;
            }
          } else {
            resultInfo.success = false;
            resultInfo.msg = "마커 API 호출 내부 Error";
          }
        } else {
          resultInfo.msg = "nodeId를 찾지 못함";
        }
      }

      return new Promise((resolve, reject) => {
        resolve(resultInfo);
      });
    }

    const removeMarker = async(data:any):Promise<object> => {
      const resultInfo = {
        success: false,
        msg: '',
      }

      if (data.marker === true) {
        const nodeId = state.datasMap.get(data.content_id)?.nodeId ?? null;
        const markResult = await deleteMarker(nodeId, data.guid);
        if (markResult.success === true) {
          data.marker = false;
          data.guid = null;
          _extractMarker.value.set(data.content_id, markResult.data.markers);
          resultInfo.success = true;
        }
      }

      return new Promise((resolve, reject) => {
        resolve(resultInfo);
      });
    }

    const setMark = (data: any, colorType: string = '0', markerName: string = '') => {
      if (data.marker === true) {
        removeMarker(data).then((result: any) => {
          console.log("result", result);
          if (result.success === true) {
            sendEventMessage('마커가 삭제되었습니다.');
          } else {
            sendEventMessage('마커가 삭제에 실패하였습니다.', 'error');
          }
        });
      } else {
        const selectedColorType = _state.selectedColor ?? 0;
        addMarker(data, selectedColorType, markerName).then((result: any) => {
          if (result.success === true) {
            sendEventMessage('마커가 추가되었습니다.');
          } else {
            sendEventMessage('마커가 추가에 실패하였습니다.', 'error');
          }
        });
      }
    }

    const getCheckedItems = () => virtualPanelComp.value.drawDatas.filter((data) => data.isChecked === true);

    const onOpenMakerSelectModal = () => {
      if (getCheckedItems().length > 0) {
        state.isOpenMakerSelectModal = true;
      } else {
        disPacthEvent('popUpMessage', {msg: '선택된 항목이 없습니다.'});
      }
    }
    const onCloseAction = () => state.isOpenMakerSelectModal = false;
    const onAcceptMarkerColorSelect = (colorType: string, markerName: string = '') =>{
      state.selectedMarkerColorType = colorType;
      const checkedDatas = getCheckedItems();
      if (checkedDatas && checkedDatas.length) {
        // alert(checedDatas.length);
        state.isOpenMarkerProcessModal = true;
        nextTick(() => {
          let failCnt = 0;
          checkedDatas.forEach(async (checkedData, i) => {
            const res: any = await addMarker(checkedData, colorType, markerName);
            if (res.success === false) {
              failCnt++;
              console.log("res > ",i, res)
            }
            state.markerProcessPercent =  Math.round( (i+1) / checkedDatas.length) * 100;
          });

          if (failCnt === 0 ) {
            sendEventMessage('마커가 추가되었습니다.');
          } else {
            sendEventMessage('마커가 추가에 실패하였습니다.', 'error');
          }
        });
      }
    }

    const onCloseActionMarkerProcessModal = () => {
      state.isOpenMarkerProcessModal = false;
    }

    const getImage = (data: any) => {
      return {
        'background-image': `url(${data.url})`,
      }
    }

    const buildFileSelectOpts = (total?: number) => {
      state.fileSelectOpts.items = [];
      state.fileSelectOpts.items = [{
        id: 'all',
        label : `전체(${total ?? virtualPanelComp.value.getInitTotal()})`,
        value: 'all',
        selected : state.selectedFilter === 'all',
      }];

      state.datasMap.forEach((datas, key) => {
        if (datas.cnt > 0) {
          state.fileSelectOpts.items.push({
            id: key,
            label: `${datas.name} (${datas.cnt ?? 0})`,
            value: key,
            selected: state.selectedFilter === key,
          });
        }
        // console.log(state.fileSelectOpts.items)
      });
    }

    const findMarker = (markerList: any[], startSec: string, endSec: string) => {
      const existMarker = (markerList as any[]).find((markerInfo) => {
        if(markerInfo.start.seconds.toFixed(2) === startSec &&
        markerInfo.end.seconds.toFixed(2) === endSec
        ) return true;
      });

      return existMarker;
    }

    const getMarker = (content_id, frameRate, startFrame, endFrame) => {
      // console.log("content_id, frameRate, startFrame, endFrame ", content_id, frameRate, startFrame, endFrame);
      if (_extractMarker && _extractMarker.value.size > 0) {
        const startSec = (startFrame / frameRate).toFixed(2);
        const endSec = (endFrame / frameRate).toFixed(2);
        const markerList = _extractMarker.value.get(content_id);
        if (markerList) {
          return findMarker(markerList as any[], startSec, endSec);
        }
        return undefined;
      }
      return undefined;
    }

    const onRazerItem = (event: MouseEvent, data: any) => {
      if(state.isMarkBtnDisabled === false) {
        razorItem(event, data);
      }
    }

    const razorItem = async (event: MouseEvent, data: any) => {
      if (data.content_id) {
        const { inPoint , outPoint } = getInOutPoint(data);
        const nodeId = state.datasMap.get(data.content_id)?.nodeId ?? null;

        state.isMarkBtnDisabled = true;
        const datas = await razorClipItem(nodeId, inPoint, outPoint);
        state.isMarkBtnDisabled = false;
        
        if (datas.success === false) {
          let errMsg = '자르기에 실패하였습니다.';
          if (datas.msg.indexOf('Razor') > -1) {
            errMsg = '자르기 대상 클립을 찾지 못하였습니다.';
          } else if (datas.msg.indexOf('NodeID') > -1) {
            errMsg = 'BIN에서 대상 아이템을 찾지 못하였습니다.';
          }
          nextTick(() => sendEventMessage(errMsg, 'error'));
        } else {
          const successItems = datas.data.razorItems.filter((item) => item.success === true);
          const msg = `자르기에 성공 하였습니다. ( ${successItems.length} / ${datas.data.razorItems.length})`;
          nextTick(() => sendEventMessage(msg));
        }
        
        console.log("datas ", datas);
      }
    }

    const buildGridDataFn = (datas: any) => {
      console.log("buildGridDataFn ", _extractMarker.value);
      datas.forEach(data => {
        const fileInfo = state.datasMap.get(data.content_id);
        if (fileInfo) {
          fileInfo.cnt = (fileInfo.cnt ?? 0) + 1;
          state.datasMap.set(data.content_id, fileInfo);
          data.fileNm = fileInfo.name;
        } else {
          console.error("data.content_id :", data.content_id);
        }

        const dataMarker = getMarker(data.content_id, Number(data.framerate), Number(data.st_frame), Number(data.end_frame));
        if(dataMarker){
          data.marker = true;
          data.guid = dataMarker.guid;
        } else {
          data.marker = false;
        }
      });

      buildFileSelectOpts(datas.length);
      state.datas = datas;
      return datas;
    }

    const onChangeFile = (selectedFileItem: any) => {
      state.selectedFilter = selectedFileItem.id;
      virtualPanelComp.value.filterDatas('content_id', selectedFileItem.id);
    }

    const getMarkerSize = computed(() => state.datas.filter((data)=>data.marker === true).length);

    onMounted(() => {
      console.log("toolsButtons:", props.toolsButtons)
      init();
      watch(
        () => _state.datas.length,
        () => {
          init()
        },{deep: true}
      )

      watch(
        () => props.serachWord,
        () => {
          state.searchWord = props.serachWord;
        }
      )

      watch(
        () => virtualPanelComp.value.drawDatas.length,
        () => {
          setStateTotal(virtualPanelComp.value.drawDatas.length);
        }, {
          deep: true
        }
      )

      watch(
        () => props.store,
        () => {
          makeStore();
        }
      )
    })


    return {
      searchInputEl,
      virtualPanelComp,
      state,
      getFrameRate,
      getFileName,
      onGoListPage,
      onSelectFile,
      onCheckedItem,
      onSearchTxtClear,
      onSearch,
      onDeleteItem,
      onOpenMakerSelectModal,
      onCloseAction,
      onAcceptMarkerColorSelect,
      onCloseActionMarkerProcessModal,
      isMarkedCss,
      getMarkerSize,
      setMark,
      el,
      getTypeText,
      storeLoad,
      makeStore,
      getImage,
      buildGridDataFn,
      onChangeFile,
      setStoreParams,
      onRazerItem,
    }

  },
})
</script>
<style lang="scss">

.image-wrapper{
  width:75px;
  height:75px;
  background-repeat: no-repeat;
  background-size:contain;
}

.item-trasition {
  transition:all 0.5s;
}

.item-trasition-remove {
  // pointer-events: none;
  transform: translateX(200%) !important;
}

.event-none {
  pointer-events: none;
}

.item-trasition-hide {
  opacity: 0;
}

.vue-recycle-scroller__item-view {
  // transition: all 0.2s;
}

button[disabled]{
  opacity: 0.2;
  cursor: not-allowed;
}

input:focus , input:active {
  border:0;
  outline: none;
}

.search-wrapper{
  display: flex;
  // border:1px solid #e2e2e2;
  height:100%;
  align-items: center;

  .search-input-wrapper {
    display: flex;
    align-items: center;
    position: relative;

    .input-clear-btn {
      position: absolute;
      right: 20px;
      top:15px;
      opacity: 0.8;
      fill:#666;
      cursor: pointer;
      transition: 0.5s;

      &:hover {
        fill:#fff;
      }
    }
  }

  .search-input {
    border:1px solid #999;
    // background-color:  #6600a5;
    background: transparent;
    border-radius: 5px;
    padding: 5px 40px 5px 5px;
    text-indent: 5px;
    margin-right: 10px;
    height: 45px;
    width: 100%;
    color: #e2e2e2;
    font-size: 20px;

    &:placeholder-shown + .input-clear-btn{
      opacity: 0;
      pointer-events: none;
    }
  }

  .search-btn {
    width: 100px;
    height: 45px;
    font-size: 16px;
  }
}

  $marker-color: rgb(145 255 0);

  .test-panel {
    position: relative;
    height:100%;
    overflow: hidden;
    .header-search-tool-wrapper {
      display: flex;
      align-items: center;
      min-height: 60px;
      max-height:60px;
      margin:0px 10px;

      .tools-info {
        display: flex;
        flex:1;
        align-items: center;

        .marker-info {
          font-size:13px;
          padding-left: 15px;
        }

        .file-select-wrapper {
          margin-left: 10px;
          margin-right: 10px;
          border:1px solid #666;

          .select-ui-btn {
            font-size:0.9rem;
          }

          .select-ui-item {
            font-size: 0.8rem;
          }
        }
      }

    }
  }
  .content-row-wrapper {
    display: flex;
    width:100%;
    padding:5px 5px 0px 5px;

    .content-row_content-number {
      width : 50px;
      min-width: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .content-row_content-wrapper {
      display: flex;
      margin:10px;
      // border: 1px solid #999;
      width:100%;
      border-radius: 5px;
      background-color: #3a3a3a;

      .content-row_content-checkbox {
        margin: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .content-row_tools {
        display: flex;
        justify-content: center;
        width: 50px;
        min-width: 50px;
        padding: 10px;
        align-items: center;
        opacity: 0.6;
        transition: 0.2s;
        cursor: pointer;
        &:hover{
          opacity: 0.8;
        }

        &.mark-off {
          fill:#999;
          position: relative;
          &:hover {
            fill: #fff;
          }
        }

        &.mark-on {
          fill: $marker-color;
          &::after {
            content: '';
            position: absolute;
            width:20px;
            height:20px;
            border:3px solid $marker-color;
            border-radius: 20px;
          }
        }

        .icon {
          fill: #999;
          &:hover {
            fill: #fff;
          }
        }
      }
    }

    .content-row_content_body-wrapper {
      display: flex;
      margin: 10px;
      flex-direction: column;
      flex:1;

      .content-row_content_body {
        display: flex;
        line-height: 1.4em;
        text-align: justify;
        padding:5px;

          .tc-file-name-info {
            height: 25px;
            .tc-file-name {
              cursor: pointer;
              transition: 0.2s;
              &:hover {
                font-size:20px;
              }
            }
          }

        .tc-info {
          display: flex;
          // justify-content: center;
          align-items: center;
          font-size:12px;

          .tc-label {
            font-size:14px;
          }

          .tc-txt {
            font-size:12px;
            margin:0px 10px;
            color:#ccc;
          }
        }

        .label {
          min-width: 100px;
          display: flex;
          justify-content: center;
          align-items: center;

          .stt-type {
            display: flex;
            justify-content: center;
            align-items: center;
            background: rgb(111, 0, 255);
            padding:5px 25px;
            border-radius: 5px;
          }
        }

        .content {
          padding: 10px;
          background-color: #000;
          border-radius: 5px;
        }
      }
    }
  }

  .virtual-panel-wrapper {
    position: relative;
    height:100%;
    display: flex;
    flex-direction: column;

    .virtual-panel-header-wrapper {
      min-height : 60px;
    }

    .virtual-panel-body-wrapper {
      height:100%;
      overflow: hidden;

      .virtual-body-slot-template-wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
        overflow: hidden;
      }
    }
  }

  .v-popper__wrapper {
    .v-popper__inner {
      background: rgb(111, 0, 255);
    }

    .v-popper__arrow-inner {
      visibility: visible;
      border-color: rgb(111, 0, 255);
    }

    .v-popper__arrow-outer {
      border-color: rgb(111, 0, 255);
    }
  }

</style>
