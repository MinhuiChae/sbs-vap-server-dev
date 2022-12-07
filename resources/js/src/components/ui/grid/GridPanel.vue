
<template>
  <div style ="overflow:hidden;position:relative;display:flex;height:100%;width:100%;flex-direction:column;">
    <div class = 'hidden-div-wrapper' ref = "refWrapperEl" />
    <GPanel ref = "gPanelComp"
      :cssPrefix = "getClassPrefix('grid')">
      <template v-if = "useSlot('header-slot')" #header-slot>
        <div :class = "getClassPrefix('header-wrapper')" ref ='headerEl'>
          <slot name = "header-slot" />
        </div>
      </template>
      <template #body-slot v-if = "state.isMounted" >
        <div :class = "getClassPrefix('body-wrapper')">
          <div class = "header-tools-wrapper" ref = "headerToolEl">
          </div>
          <div class = "header-table-wrapper" ref = "headerTableEl" v-if = "useHeader"
            :style = "{'padding-right':`${state.scrollBarWidth}px`}">
            <GridHeaderTable
              :columns = "columns"
              :style = "{'width':`${state.gridWidth}px`}"
              @onChangeCellResize = "onChangeCellResize"
              @selectAll = "selectAll"
            >
              <template v-for = "(slotName, index) of getSlotFilter('end','_row-header-slot')" :key ="index"
                  #[slotName] = "data"
                >
                  <slot :name="slotName" v-bind="data"/>
              </template>
            </GridHeaderTable>
            <div class = 'empty-scoller' v-if = "state.scrollBarWidth > 0"
            :style = "{'width':`${state.scrollBarWidth}px`, 'right':`-${state.scrollLeft}px`}"></div>
          </div>
          <div class = "body-table-wrapper" v-if = "state.isReadyLoadedContent"
            @scroll.stop="onGridContentScroll($event.target.scrollLeft)"
            ref = "bodyTableWrapperEl"
            >
            <template v-if = "state.isStoreLoad">
              <slot name = "content-loading-template">
                <LoadingComp text = "데이터를 불러오고 있습니다."/>
              </slot>
            </template>
            <template v-else-if = "gridDatas.length < 1">
              <slot name = "content-empty-template">
                <div class = 'grid-data-empty-text-wrapper'>
                  데이터가 없습니다.
                </div>
              </slot>
            </template>
            <template v-else>
              <GridContentTable
                ref = "gridContentTableComp"
                :columns = "columns"
                :rowDatas = "gridDatas"
                :style = "{'width':`${state.gridWidth}px`}"
                :useTable= "useTable"
                @hasBodyTableScroll = "hasBodyTableScroll"
                @onRowClick = "onRowClick"
                @onRowDblClick = "onRowDblClick"

              >
                <template v-if = "useSlot('content-row-template')" #content-row-template="rowDatas">
                  <slot name = "content-row-template" v-bind = "rowDatas"/>
                </template>
                <template else-if = "useSlot('content-table-template')" #content-table-template="{datas}">
                  <slot name = "content-table-template" v-bind = "datas"/>
                </template>
                <template v-for = "(slotName, index) of getSlotFilter('end','_cell-slot')" :key ="index"
                  #[slotName] = "data"
                >
                  <slot :name="slotName" v-bind="data"/>
                </template>
              </GridContentTable>
            </template>
          </div>
          <div class = "footer-table-wrapper" ref = "footerTableEl">
            <template v-if = "state.usePagingUi">
              <PagingUi
                :page = "state.paging.page"
                :perPage = "state.paging.perPage"
                :total = "state.paging.total"
                @onChangeCurrentPage = "onChangeCurrentPage"
              />
            </template>
          </div>
        </div>
      </template>
      <template v-if = "useSlot('footer-slot')" #footer-slot>
        <div :class = "getClassPrefix('footer-wrapper')" ref ='footerEl'>
          <slot name = "footer-slot" />
        </div>
      </template>
    </GPanel>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, PropType, reactive, ref, watch, } from 'vue';
import GPanel from '@/components/ui/panel/Panel.vue';
//import GridRow from '@/components/ui/grid/GridRow.vue';
import GridHeaderTable from '@/components/ui/grid/GridHeaderTable.vue';
import GridContentTable from '@/components/ui/grid/GridContentTable.vue';
import PagingUi from '@/components/ui/paging/Paging.vue';
import LoadingComp from '@/components/Loading.vue';
import useContext from '@/composition/useContext';
import useCssApi from '@/composition/useCssApi';
import {
  IColumn, IColumnResizeEventInfo,
} from '@/interfaces/ui';

import {
  IGridStore,
} from '@/interfaces/ui/iStore';

import jsonStore from '@/composition/lib/jsonStoreClass';
import Store from '@/composition/lib/storeClass';
import { AnyMxRecord } from 'dns';

export default defineComponent({
  name: 'GridPanelUi',
  emits: ['extendSelectAll', 'onRowClick', 'onRowDblClick', 'onSelectedItem'],
  components: {
    GPanel,
    GridHeaderTable,
    GridContentTable,
    PagingUi,
    LoadingComp,
  },
  props: {
    cssPrefix: {
      type: String,
      default: '',
      required: false,
    },
    columns: {
      type: Array(Object) as PropType<IColumn[]>,
      default: [],
      required: true,
    },
    fitColumn: {
      type: Boolean,
      default: true,
      required: false,
    },
    datas: {
      type: Array(Object),
      default: [],
      required: false,
    },
    store: {
      type: Object as PropType<IGridStore>,
      required: false,
    },
    useBuildGridData: {
      type: Boolean,
      default: false,
    },
    useHeader: {
      type: Boolean,
      default: true,
    },
    useTable: {
      type: Boolean,
      default: true,
    },
    dataKeyProperty: {
      type: String,
      default: 'id',
    }
  },
  setup(props, context) {
    const gPanelComp = ref<InstanceType<typeof GPanel>>();
    const gridContentTableComp = ref<InstanceType<typeof GridContentTable>>();
    const headerEl = ref<HTMLElement>();
    const footerEl = ref<HTMLElement>();
    const refWrapperEl = ref<HTMLElement>();
    const footerTableEl = ref<HTMLElement>();
    const headerTableEl = ref<HTMLElement>();
    const headerToolEl = ref<HTMLElement>();
    const bodyTableWrapperEl = ref<HTMLElement>();

    const gridDatas = ref<any>([]);

    const { useSlot, getSlotFilter } = useContext(context);
    const { getClassPrefix } = useCssApi(props.cssPrefix);

    const state = reactive({
      isMounted: false,
      isLoaded: false,
      gridHeight: 0,
      gridWidth: 0,
      isReadyLoadedContent: false,
      gridContentHeight: 0,
      scrollBarWidth: 0,
      scrollLeft: 0,
      changeColumnSizeInfo: {
        name: '',
        width: 0,
      } as IColumnResizeEventInfo,
      usePagingUi: false,
      paging: {
        page: 1,
        perPage: 20,
        total: 0,
      },
      store: {},
      isStoreLoad: false,
      isBuildGridRowData: false,
    })

    const initStore = () => {
      const storeOptions: any = props.store;

      if(storeOptions.paging && storeOptions.usePagingUi !== false) {
        state.usePagingUi = true;
      }

      if (storeOptions.type === 'json') {
        state.store = new jsonStore({
          keyProperty: storeOptions.keyProperty,
          url: storeOptions.url,
          params: storeOptions.params,
          method: storeOptions.method,
          paging: storeOptions.paging ?? {},
          events: storeOptions.events ?? {},
        }) as Store;

        if (storeOptions.autoLoad !== false) {
          loadStore();
        }
      }
    }

    const loadStore = () => {
      // 만약 store 가 load 된다면.. loadingImage 를 보여주고
      state.isStoreLoad = true;
      (state.store as Store).load().then((datas: any) => {
        const page = datas[(state.store as Store).getPagingPage()];
        const perPage = datas[(state.store as Store).getPagingPerPage()];
        const total = datas[(state.store as Store).getPagingTotal()];
        buildGridRowData(datas.data, perPage * (page - 1) + 1);
        state.paging.page = page;
        state.paging.perPage = perPage;
        state.paging.total = total;
        state.isStoreLoad = false;
      }).catch(() => {
        state.isStoreLoad = false;
      });
    }

    const randomNumber = (min: number, max: number): number => Math.random() * (max - min) + min;

    const fitGridWidth = computed(() => {
      if (!refWrapperEl.value) return 0;
      return refWrapperEl.value.clientWidth - state.scrollBarWidth - 2;
    });

    const hasBodyTableScroll = (scrollBarWidth: number) => {
      state.scrollBarWidth = scrollBarWidth;
      if (state.gridWidth - scrollBarWidth < fitGridWidth.value) {
        state.gridWidth = state.gridWidth - scrollBarWidth ;
      }

      buildColumns();
      initColumnSize();
      nextTick(()=>initTableSize());
    }

    const onChangeCellResize = (resizeInfo: IColumnResizeEventInfo) => {
      const findColumn = props.columns.find((column) => column.name === resizeInfo.name)
      if (findColumn) {
        findColumn.width = `${resizeInfo.width}px`;
        if (resizeInfo.tableWidth) {
          state.gridWidth = resizeInfo.tableWidth;
        }
      }
    }

    const getDummyData = (id: number) => {
      return {
        id: id,
        name: (Math.random() + 1).toString(36).substring(7),
        age: Math.ceil(randomNumber(1,99)),
      }
    }

    const insertDummyData = () => {
      let i = 0;
      while(i < 50){
        gridDatas.value.push(getDummyData(i));
        i++;
      }
    }

    const initTableSize = () => {
      console.log("initTableSize")
      // column width 조사 ,
      // refWrapperEl 사이즈 조사 비교

      let gridHeight = refWrapperEl.value ? refWrapperEl.value.clientHeight : 0;
      let headerTableHeight = 0;
      let footerTableHeight = 0;
      let headerToolHeight = 0;

      if (headerEl.value) {
        gridHeight -= headerEl.value.clientHeight;
      }

      if (footerEl.value) {
        gridHeight -= footerEl.value.clientHeight;
      }

      if (headerTableEl) {
        headerTableHeight = headerTableEl.value?.clientHeight;
      }

      if (footerTableEl) {
        footerTableHeight = footerTableEl.value?.clientHeight;
      }

      if (headerToolEl && headerToolEl.value) {
        headerToolHeight = headerToolEl.value.clientHeight;
      }


      state.gridHeight = gridHeight;
      //state.gridWidth = refWrapperEl.value.clientWidth - 2;
      state.isLoaded = true;
      state.gridContentHeight = gridHeight - headerToolHeight - headerTableHeight - footerTableHeight;
      state.isReadyLoadedContent = true;
    }

    const gridColumns = ref([]);

    const buildColumns = () => {
      gridColumns.value = JSON.parse(JSON.stringify(props.columns));
    }
    const initColumnSize = () => {
      const emptyWidthColumns:IColumn [] = [];
      let totalColumnWidth = 0;
      gridColumns.value.forEach((column) => {
        if (column.width) {
          if (column.width.indexOf('%') > -1) {
            // 퍼센트가 있는 경우라면 어떻게 책정하지..
            const w = Number(column.width.replace('%',''));
            const pxWidth = fitGridWidth.value * (w / 100);
            column.width = `${pxWidth}px`;
            totalColumnWidth += pxWidth;

          } else if (column.width.toLowerCase().indexOf('px') > -1) {
            const w = Number(column.width.replace('px',''));
            totalColumnWidth += w;
          }
        } else {
          emptyWidthColumns.push(column);
        }
      });

      if (emptyWidthColumns.length > 0) {
        const remainderWidth = fitGridWidth.value - totalColumnWidth;
        const widthPerEmptyColumn = remainderWidth / emptyWidthColumns.length;
        emptyWidthColumns.forEach((column) => {
          column.width = `${widthPerEmptyColumn}px`
          totalColumnWidth += widthPerEmptyColumn;
        });
      }

      state.gridWidth = totalColumnWidth;
      // fit 모드 일경우 다시 계산
    }

    const onGridContentScroll = (scrollLeft: number) => {
      // console.error("scrollLeft ", scrollLeft);
      if (headerTableEl && headerTableEl.value) {
        headerTableEl.value.scrollLeft = scrollLeft;
        state.scrollLeft = scrollLeft;
      }
    }

    const buildGridRowData = (datas?: any, startNumber: number = 1) => {
      const buildDatas = datas ?? props.datas;
      if (props.useBuildGridData === true) {
        buildDatas.forEach((data, i) => {
          data.isChecked = false;
          data.rowNumber = startNumber + i;
        });
      }

      gridDatas.value = buildDatas;
      state.isBuildGridRowData = true;
    }

    const resize = () => {
      state.scrollLeft = 0;
      gridContentTableComp.value.updateBodyTableScroll();
    }

    const onChangeCurrentPage = (page: number) => {
      if (page === state.paging.page) return;
      (state.store as Store).setParams('page', page);
      loadStore();
    }

    const selectAll = (checked: boolean) => {
      if (props.useBuildGridData === true) {
        gridDatas.value.forEach((data) => data.isChecked = checked);
      }
      context.emit('extendSelectAll', checked);
    }

    const onRowClick = (rowData: any) =>  context.emit('onRowClick', rowData);
    const onRowDblClick = (rowData: any) => context.emit('onRowDblClick', rowData);
    const addItem = async (params: any) => await (state.store as Store).save(params);
    const updateItem = async (keyValue: string, params: any) => {
      if (props.store) {
        const findedItem = findItem(keyValue);
        let rtns = {};
        if (findedItem) {
          rtns = await (state.store as Store).update(keyValue, params);
        } else {
          rtns = {
            success: false,
            msg: '아이템을 찾을 수 없음',
          }
        }

        return new Promise((resolve, reject) => {
          resolve(rtns)
        });
      } else {

      }
    }

    const deleteItem = async (keyValue: string) => {
      if (props.store) {
        const findedItem = findItem(keyValue);
        let rtns = {};
        if (findedItem) {
          rtns = await (state.store as Store).delete(keyValue);
        } else {
          rtns = {
            success: false,
            msg: '아이템을 찾을 수 없음',
          }
        }

        return new Promise((resolve, reject) => {
          resolve(rtns)
        });
      } else {

      }
      // await (state.store as Store).delete(params);
    }
    const getSelectedItems = () => gridDatas.value.filter((data) => data.isChecked === true);

    const getStore = (): Store | null => {
      if(props.store) {
        return state.store as Store;
      }
      return null;
    }

    const setStoreParam = (param: string, value: any) => getStore()?.setParams(param, value);

    const selectItem = (itemId:any) => {
      const findedItem = findItem(itemId);
      if (findedItem) {
        findedItem.isChecked = !findedItem.isChecked;
        context.emit('onSelectedItem', findedItem);
      }
    }

    const findItem = (ketValue: any) => {
      const keyProperty = (state.store as Store).getKeyProperty() ?? props.dataKeyProperty;
      const findItem = gridDatas.value.find((data) => data[keyProperty] === ketValue);
      return findItem;
    }

    const getItemByIndex = (index: number) => {
      if (gridDatas.value.length && gridDatas.value[index]) {
        return gridDatas.value[index];
      }
      return null;
    }

    const deSelectedItem = (itemKeyValue: any): Promise<any> => {
      const findedItem = findItem(itemKeyValue);
      if (findedItem && findedItem.isChecked === true) {
        findedItem.isChecked = false;
      }

      return new Promise((resolve, reject) => {
        findItem ? resolve(findedItem) : reject(false);
      }).catch();
    }

    onMounted(() => {
      buildColumns();

      if(props.store) {
        initStore();
        watch(
          () => props.store,
          () => initStore(),
          {deep: true},
        );
      } else {
        if (props.datas && props.datas.length > 0) {
          buildGridRowData(props.datas);
        }
        watch(
          () => props.datas,
          () => {
            console.log(2, state.isBuildGridRowData)
            if (state.isBuildGridRowData === false) {
              buildGridRowData(props.datas);
            }
          },{
            deep: true,
          }
        )
        // insertDummyData();
      }

      initColumnSize();
      state.isMounted = true;
      setTimeout(() => initTableSize());
      window.addEventListener('resize', resize);
    });

    return {
      gPanelComp,
      gridContentTableComp,
      state,
      props,
      headerEl,
      footerEl,
      refWrapperEl,
      headerTableEl,
      footerTableEl,
      headerToolEl,
      bodyTableWrapperEl,
      useSlot,
      getClassPrefix,
      gridDatas,
      hasBodyTableScroll,
      onChangeCellResize,
      onGridContentScroll,
      getSlotFilter,
      resize,
      onChangeCurrentPage,
      selectAll,
      onRowClick,
      onRowDblClick,
      addItem,
      updateItem,
      deleteItem,
      loadStore,
      getSelectedItems,
      buildGridRowData,
      getStore,
      setStoreParam,
      selectItem,
      deSelectedItem,
      getItemByIndex,
    }

  },
})
</script>
<style lang="scss" scoped>
  .hidden-div-wrapper {
    width:100%;
    background-color: transparent;
    position: absolute;
    top:0px;
    left:0px;
    height: 100%;
    min-height: 0;
  }

  .empty-scoller {
    width:10px;
    border-left:1px solid #333;
    height:100%;
    position: absolute;
    // background-color: #fff;
    // background-color: #e2e2e2;
    right:0;
    top:0px;
  }


</style>
