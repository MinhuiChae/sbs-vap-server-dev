<template>
  <div class = 'extract-list-wrapper'>
    <ViewNaviTop :title = "state.titleList">
      <template #search-slot>
          <div class = 'search-input-wrapper'>
            <input
              ref ="searchInputEl"
              type="text" width=100 class ='search-input' placeholder = "검색어를 입력하세요"
              v-model ="state.searchWord"
              @keyup.enter="onSearch"
              />
            <div class = "input-clear-btn" @click.stop.prevent="onSearchTxtClear"><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"><path d="M23 20.168l-8.185-8.187 8.185-8.174-2.832-2.807-8.182 8.179-8.176-8.179-2.81 2.81 8.186 8.196-8.186 8.184 2.81 2.81 8.203-8.192 8.18 8.192z"/></svg></div>
          </div>
          <div class = 'search-btn-wrapper'>
            <button :disabled ="state.isSearchBtnDisabled" class ='btn-normal search-btn' @click.stop.prevent="onSearch"> 검색 </button>
          </div>
      </template>
    </ViewNaviTop>
    <ViewSearchComponent ref = "viewSearchCompRef"
      searchType="subtitle"
      :serachWord="state.searchWord"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, inject, onMounted, reactive, ref } from 'vue';

import { useRouter } from 'vue-router';
import ViewSearchComponent from '@/views/components/ViewSearch.vue';
import ViewNaviTop from '@/views/navigator/ViewNavTop.vue';
import useCommon from '@/composition/useCommon';

export default defineComponent({
  name: 'view-vttList',
  components: {
    ViewNaviTop,
    ViewSearchComponent,
  },
  setup() {
    const _state: any | undefined = inject('state');
    const viewSearchCompRef = ref<InstanceType<typeof ViewSearchComponent>>();
    const state = reactive({
      total: 0,
      jsonStore: {},
      test: false,
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
      titleList: [{
        name: '추출 파일 리스트',
        routeName: 'Export List',
      }, {
        name: '자막 검색',
        routeName: '',
      }]
    })

    const router = useRouter();
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
    }

    const onSearch = () => {
      viewSearchCompRef.value.onSearch();
    }

    onMounted(() => {
    })

    return {
      state,
      onGoListPage,
      onSearch,
      viewSearchCompRef,
      onSearchTxtClear,
    }
  },
})
</script>
<style lang="scss">
  .extract-list-wrapper {
    height:100%;
    position: relative;
    display: flex;
    flex-direction: column;
  }
</style>
