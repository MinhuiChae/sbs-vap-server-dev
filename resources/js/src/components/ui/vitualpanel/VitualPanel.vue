<template>
  <GPanel ref = "gPanelComp"
   cssPrefix = "virtual"
   >
    <template #header-slot>
      <slot name = 'header-slot'/>
    </template>
    <template #body-slot >
      <div class = 'vitual-panel-body_content-wrapper' >
        <template v-if = "!useSlot('content-row-template')">
            템플릿정의가 필요합니다. (Need Row Template Define)
        </template>
        <template v-else-if = "state.isStoreLoading">
          <slot name = "content-loading-template">
            <LoadingComp text = "데이터를 불러오고 있습니다."/>
          </slot>
        </template>
        <template v-else-if = "drawDatas.length > 0">
          <VirtualScrollerUi
            :items="drawDatas"
            :defaultItemHeight = "defaultItemHeight"
          >
          <template v-if = "useSlot('content-row-template')" #content-row-template = "data">
            <slot name = "content-row-template" v-bind = "{ data: data.data, dataIndex: data.rowIndex }"/>
          </template>
        </VirtualScrollerUi>
        </template>
        <template v-else-if = "drawDatas.length === 0">
          <template v-if = "!useSlot('content-empty-template')">
            <slot name = "content-empty-template">
              <div class = 'empty-text-wrapper'> {{ emptyText }} </div>
            </slot>
          </template>
        </template>
      </div>
    </template>
  </GPanel>
</template>
<script lang="ts">
import { defineComponent, onMounted, PropType, reactive, ref, provide, watch } from 'vue';
import GPanel from '@/components/ui/panel/Panel.vue';
import { IGridStore } from '@/interfaces/ui/iStore';
import JsonStore from '@/composition/lib/jsonStoreClass';
import useContext from '@/composition/useContext';
// import virtual from '@/composition/lib/virtual';
// import VirtualScrollUi from '@/components/ui/virtualScroll/VirtualScroll.vue';
import VirtualScrollerUi from '@/components/ui/virtualscroller/VirtualScroller.vue';
import LoadingComp from '@/components/Loading.vue';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import Store from '@/composition/lib/storeClass';
/**
 * Virtual Panel
 * store가 있어서 아래로 스크롤링 하면 자동으로 처리되는 패널 정의
 *
 */
export default defineComponent({
  components: {
    GPanel,
    VirtualScrollerUi,
    LoadingComp,
  },
  name: 'VirtualPanelUi',
  props: {
    store: {
      type: Object as PropType<IGridStore>,
      required: false,
    },
    useVirtualScroll: {
      type: Boolean,
      default: true,
    },
    defaultItemHeight: {
      type: Number,
      defualt: 45,
    },
    emptyText: {
      type: String,
      default : "검색된 데이터가 없습니다.",
    },
    buildGridDataFn: {
      type: Function,
      default: null,
    }
  },
  setup(props, context) {

    const drawDatas = ref([]);
    const saveDrawDatas = ref([]);
    const gPanelComp  = ref<InstanceType<typeof GPanel>>();
    const virtualContentEl = ref<HTMLElement>();
    const virtualHiddenContentEl = ref<HTMLElement>();
    const { useSlot } = useContext(context);
    const state = reactive({
      store: {},
      paging: {
        page: 1,
        perPage: 2,
        total: 3,
      },
      isStoreLoading: false,
      change: false,
      height: 0,
      page: 0,
      defaultPerPage: 15000,
      virtual: null,
      buildDatas: [],
      error: '',
    })

    provide('items', drawDatas);

    const buildGridRowData = (datas: any) => {
      console.error("buildGridRowData ");
      state.buildDatas = datas.map((data: any, index: number) => {
        return {
          id:index,
          ...data
        }
      });

      if (state.buildDatas.length > state.defaultPerPage) {
        datas = state.buildDatas.slice(0, state.defaultPerPage);
      }

      drawDatas.value = props.buildGridDataFn ? props.buildGridDataFn(datas) : datas;//  state.buildDatas;
      saveDrawDatas.value = [...drawDatas.value];
    }

    const initStore = () => {
      const storeOptions = props.store as any;
      if (storeOptions.type === 'json') {
        state.store = new JsonStore({
          url: storeOptions.url,
          params: storeOptions.params,
          method: storeOptions.method,
          events: storeOptions.events,
        });

        if (storeOptions.autoLoad) {
          storeLoad();
        }
      }
    };

    const deleteItem = (id: string): boolean => {
      const findItemIndex = drawDatas.value.findIndex((data) => data.id === id);
      if (findItemIndex > -1) {
        drawDatas.value.splice(findItemIndex, 1);
        const savefindItemIndex = saveDrawDatas.value.findIndex((data) => data.id === id);
        saveDrawDatas.value.splice(savefindItemIndex, 1);
        return true;
      }

      return false;
    }

    const filterDatas = (key: string, value: any) => {
      if (value === 'all') {
        drawDatas.value = [...saveDrawDatas.value];
      } else {
        drawDatas.value = [...saveDrawDatas.value.filter((drawData) => {
          if (drawData[key] === value) return true;
        })];
      }
    }

    const getInitTotal = () => saveDrawDatas.value.length;

    const storeLoad = () => {
      state.isStoreLoading = true;
      (state.store as JsonStore).load().then((datas: any) => {
        buildGridRowData(datas.data);
        state.paging.page = datas.currentPage;
        state.paging.perPage = datas.page;
        state.paging.total = datas.total;
        state.isStoreLoading = false;
      }).catch((reject) => {
        state.error = reject;
        state.isStoreLoading = false;
        console.error("reject> ", reject);
      });
    }
    
    onMounted(() => {
      if(props.store) {
        initStore();
      }
      watch(
        () => props.store,
        () => {
          initStore();
        }
      )
    });

    return {
      state,
      gPanelComp,
      drawDatas,
      useSlot,
      virtualContentEl,
      virtualHiddenContentEl,
      storeLoad,
      deleteItem,
      filterDatas,
      getInitTotal,
    }

  },
})
</script>
<style lang="scss" scoped>
.vitual-panel-body_content-wrapper {
  height: 100%;
  overflow: hidden;
  position: relative;
}
.virtual-hidden-wrapper {
  padding:0;
  margin:0;
  box-sizing: border-box;
  position: absolute;
  opacity: 0;
  z-index: -1;
}
.empty-text-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height:100%;
}
</style>
