<template>
  <div class = 'people-search-wrapper'>
    <div class = 'section header-section'>
      <ViewNaviTop :title = "state.navigatorTitleList">
        <template #search-slot>
          <div class = 'search-input-wrapper'>
            <input
              ref ="searchInputEl"
              type="text" width=100 class ='search-input' :placeholder = "state.serachPlaceholderText"
              v-model ="state.searchWord"
              @keyup.enter="onSearch"
              @focus.stop.prevent="onFocus"
              />
            <div class = "input-clear-btn" @click.stop.prevent="onSearchTxtClear"><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"><path d="M23 20.168l-8.185-8.187 8.185-8.174-2.832-2.807-8.182 8.179-8.176-8.179-2.81 2.81 8.186 8.196-8.186 8.184 2.81 2.81 8.203-8.192 8.18 8.192z"/></svg></div>
          </div>
          <div class = 'search-btn-wrapper'>
            <button :disabled ="state.isSearchActive" class ='btn-normal search-btn' @click.stop.prevent="onSearch"> 검색 </button>
          </div>
        </template>
      </ViewNaviTop>
    </div>
    <div class = 'section list-section'>
      <GridPanel
        ref = "groupGridComp"
        :columns="state.gridColumns"
        :store="state.gridStore"
        :useBuildGridData="true"
        @onRowClick = "onRowClick"
        @onRowDblClick = "onRowDblClick"
      >
        <template #header-slot>
          <div class = 'header-search-tool-wrapper'>
            <div class = 'tools-info'>
              Total : {{ state.total }}
            </div>
            <div class = 'tools-btns'>
              <!-- <button class ='btn-normal' @click.stop="onGoListPage"> 추출 파일 리스트 </button> -->
              <button class ='btn-normal' @click.stop="onGoSearchPage"> 
                <div class="btnDiv">
                  <SearchIcon :width ="15" :height = "15" iconColor="white"></SearchIcon>
                    <div class="btn-content">인물 검색</div>
                </div>
              </button>
              <button class ='btn-normal' @click.stop.prevent="onOpenNewGroup"> 
                <div class="btnDiv">
                  <groupIcons :width ="15" :height = "15" iconColor="white" doWork="addGroup"></groupIcons>
                  <div class="btn-content">신규그룹생성 </div>
                </div>
              </button>
              <button class ='btn-normal' @click.stop.prevent="onOpenUpdateGroup"> 
                <div class="btnDiv">
                  <groupIcons :width ="15" :height = "15" iconColor="white" doWork="fixGroup"></groupIcons>
                  <div class="btn-content">선택그룹수정</div>
                </div> 
              </button>
              <button class ='btn-normal' @click.stop.prevent="onOpenDeleteGroup"> 
                <div class="btnDiv">
                  <groupIcons :width ="15" :height = "15" iconColor="white" doWork="deleteGroup"></groupIcons>
                  <div class="btn-content">선택그룹삭제</div>
                </div> 
              </button>
            </div>
          </div>
        </template>
      </GridPanel>
    </div>
  </div>
  <teleport to="body">
    <GroupAddModal v-if = "state.isOpenNewGroupModal"
      :closed="state.isClosedGroupModal"
      @closeAction = "onCloseNewGroupModalAction"
      @acceptAction = "onAcceptNewGroupModalAction"
    >
    </GroupAddModal >
    <GroupUpdateModal v-if = "state.isOpenUpdateGroupModal"
      :closed="state.isClosedGroupModal"
      :selectedGroupForUpdate = "state.selectedGroupForUpdate"
      @acceptAction = "onAcceptUpdateGroupModalAction"
    >
    </GroupUpdateModal>
    <GroupDeleteConfirm v-if = "state.isOpenDeleteGroupConfirm"
      @closeAction = "onCloseDeleteGroupModalAction"
      @onOkAction = "onDeleteGroupAcceptAction"
    />
  </teleport>
</template>
<script lang="ts">
import { defineComponent, inject, nextTick, reactive, ref } from 'vue'
import ViewNaviTop from '@/views/navigator/ViewNavTop.vue';
import { EColumnType } from '@/interfaces/ui';
import GridPanel from '@/components/ui/grid/GridPanel.vue';
import GroupAddModal from '@/views/modal/GroupAddModal.vue';
import GroupUpdateModal from '@/views/modal/GroupUpdateModal.vue';
import GroupDeleteConfirm from '@/views/modal/GroupDeleteConfirm.vue';
import useCustomEvent from '@/composition/useCustomEvent';
import { IGridStore } from '@/interfaces/ui/iStore';
import router from '@/router';
import useCommon from '@/composition/useCommon';
import SearchIcon from '@/components/icons/actorSearchIcon.vue';
import groupIcons from '@/components/icons/groupIcons.vue';


export default defineComponent({
  name: 'ViewActorGroup',
  components: {
    ViewNaviTop,
    GridPanel,
    GroupAddModal,
    GroupUpdateModal,
    GroupDeleteConfirm,
    SearchIcon,
    groupIcons
  },
  props: {
    extractPercent: {
      type: Number,
      default: 0,
    },
    extractList: {},
    default : {}
  },
  setup() {
    const _state: any = inject('state');
    const groupGridComp = ref<InstanceType<typeof GridPanel>>();
    const { disPacthEvent } = useCustomEvent();
    const state = reactive({
      serachPlaceholderText: '그룹명을 입력 해 주세요',
      searchWord: '',
      total: 0,
      selectedGroupForUpdate: {},
      actorManageStore: {},
      isOpenNewGroupModal: false,
      isOpenUpdateGroupModal: false,
      isClosedGroupModal: false,
      isOpenDeleteGroupConfirm: false,
      isSearchActive: false,
      navigatorTitleList: [
        {
          name: '추출 파일 리스트',
          routeName: 'Export List',
        },
        {
          name: '그룹 관리',
          routeName: '',
          evt: null,
        }
      ],
      gridColumns: [{
        name:'',
        type: EColumnType.Checkbox,
        title:'',
        width: '50px',
      },{
        name: '',
        type: EColumnType.Number,
        title: 'No',
        width: '75px',
      },{
        name: 'name',
        type: EColumnType.String,
        title: '그룹명',
        dataIndex: 'name',
        width: '',
      },{
        name: 'create_at',
        type: EColumnType.String,
        title: '생성일시',
        width : '200px',
        dataIndex: 'create_at',
      }],
      gridStore: {
        type: 'json',
        url: `${useCommon.getApiUrl()}/actor/group/{id}`,
        params: { // Object
          page: 1,
          perPage: 15,
          name: '',
        },
        paging: {
          page: 'page',
          perPage: 'perPage',
          total: 'total',
        },
        events: {
          storeload: (store: any) => onGroupStoreload(store)
        },
        autoLoad: true,
      }
    });

    const onGroupStoreload = (store: any) => { 
      state.total = store.responseData.total;
      state.isSearchActive = false;
    }

    const onSearchTxtClear = () => state.searchWord = '';
    const onRowClick = () => {}
    const onRowDblClick = (rowData: any) => onGoGroupPeopleList(rowData);
    const onGoGroupPeopleList = (rowData?: any) => {
      _state.selectedGroup = rowData;
      router.push(`/actor/group/${rowData.id}/actors`);
    }
    const onOpenDeleteGroup = () => state.isOpenDeleteGroupConfirm = !state.isOpenDeleteGroupConfirm;
    const onCloseNewGroupModalAction = () => onOpenNewGroup();
    const onCloseDeleteGroupModalAction = () => onOpenDeleteGroup();

    const onOpenNewGroup = () => {
      state.isOpenNewGroupModal = !state.isOpenNewGroupModal;
      state.isClosedGroupModal = false;
    }

    const onOpenUpdateGroup = () => {
      if(groupGridComp.value.getSelectedItems().length > 1) {
        nextTick(() => {
          disPacthEvent("popUpMessage", {msg: '한 개의 그룹만 선택해주세요'});
        })
      } else if(groupGridComp.value.getSelectedItems().length === 0) {
        nextTick(() => {
          disPacthEvent("popUpMessage", {msg: '수정할 그룹이 없습니다.'});
        })
      } else {
        state.isOpenUpdateGroupModal = true;
        state.isClosedGroupModal = false;
        state.selectedGroupForUpdate = groupGridComp.value.getSelectedItems();
      }
    }

    const onAcceptNewGroupModalAction = async (name: string) => {
      const rtns: any = await groupGridComp.value.addItem({name: name});
      if (rtns.success === true) {
        state.isClosedGroupModal = true;
        groupGridComp.value.loadStore();
      }
    }

    const onAcceptUpdateGroupModalAction = async (name: string) => {
      const rtns: any = await groupGridComp.value.updateItem(state.selectedGroupForUpdate[0].id, {name: name});
      if (rtns.success === true) {
        state.isClosedGroupModal = true;
        state.isOpenUpdateGroupModal = false;
         disPacthEvent("popUpMessage", {msg: '수정이 완료 되었습니다.'});
         groupGridComp.value.loadStore();
      } 
    }

    const onDeleteGroupAcceptAction = async () => {
      // 선택된거 확인 후 삭제
      const getSelectedItems = groupGridComp.value.getSelectedItems();
      if (getSelectedItems.length === 0){
        nextTick(() => {
          disPacthEvent("popUpMessage", {msg: '삭제할 그룹이 없습니다.'});
        })
      } else {
        for (const item of getSelectedItems) {
          const rtns = await groupGridComp.value.deleteItem(item.id);
        }
        nextTick(() => {
          disPacthEvent("popUpMessage", {msg: '삭제가 완료 되었습니다.'});
          groupGridComp.value.loadStore();
        })
      }
    }

    const onSearch = () => {
      state.isSearchActive = true;
      groupGridComp.value.setStoreParam('name', state.searchWord);
      groupGridComp.value.loadStore();
    }

    const onGoSearchPage = () => {
      router.push('/actor');
    }

    return {
      state,
      groupGridComp,
      onSearch,
      onSearchTxtClear,
      onRowClick,
      onRowDblClick,
      onOpenNewGroup,
      onOpenUpdateGroup,
      onOpenDeleteGroup,
      onCloseNewGroupModalAction,
      onCloseDeleteGroupModalAction,
      onAcceptNewGroupModalAction,
      onAcceptUpdateGroupModalAction,
      onDeleteGroupAcceptAction,
      onGoSearchPage,
    }
  },
})
</script>
<style lang="scss" scoped>
</style>
