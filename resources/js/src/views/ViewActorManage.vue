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
            <button :disabled ="state.isSearchBtnDisabled" class ='btn-normal search-btn' @click.stop.prevent="onSearch"> 검색 </button>
          </div>
        </template>
      </ViewNaviTop>
    </div>
    <div class = 'section list-section' v-if = "state.isMounted">
      <GridPanel
        ref = "gridComp"
        :columns = "state.columns"
        :useBuildGridData = "true"
        :store = "state.actorManageStore"
        :useHeader = "false"
        :useTable = "false"
        @onRowClick = "onRowClick"
        @onRowDblClick = "onRowDblClick"
      >
        <template #header-slot>
          <div class = 'header-search-tool-wrapper'>
            <div class = 'tools-info'>
              Total : {{ state.total }}
            </div>
            <div class = 'tools-btns'>
              <button class ='btn-normal' @click.stop="onGoSearchPage"> 
                <div class="btnDiv">
                  <SearchIcon :width ="15" :height = "15" iconColor="white"></SearchIcon>
                  <div class="btn-content">인물 검색</div>
                </div>
              </button>
              <button class ='btn-normal' @click.stop="onGoGrouplist"> 
                <div class="btnDiv">
                  <actorIcons :width ="15" :height = "15" iconColor="white" doWork="manageGroup"></actorIcons>
                  <div class="btn-content">그룹 관리 </div>
                </div>
              </button>
              <button class ='btn-normal' @click.stop.prevent="onOpenNewActor"> 
                <div class="btnDiv">
                  <actorIcons :width ="15" :height = "15" iconColor="white" doWork="addActor"></actorIcons>
                  <div class="btn-content">신규인물생성</div>
                </div>
              </button>
              <button class ='btn-normal' @click.stop.prevent="onOpenDeleteActor"> 
                <div class="btnDiv">
                  <actorIcons :width ="15" :height = "15" iconColor="white" doWork="deleteActor"></actorIcons>
                  <div class="btn-content">선택인물삭제</div>
                </div>
              </button>
            </div>
          </div>
        </template>
        <template #content-table-template="datas">
          <div class = "group-image-wrapper">
            <div class ='group-image-item-wrapper' :class = "{'selected': isPeopleChecked(data)}"
            v-for =" data in datas" :key="data.id"
            @click="onPeopleSelect($event, data)"
            >
              <div class = 'group-image-info'>
                <input type = "checkbox" :checked = "isPeopleChecked(data)" @click.stop="" @change = "onPeopleRowChecked($event.target.checked, data)"/>
                <span> {{ data.face_nm }} </span>
              </div>
              <div class = 'fit-image-wrapper'>
                <div class = 'fit-image' :style ="getImage(data)" />
              </div>

            </div>
          </div>
        </template>
      </GridPanel>
    </div>
  </div>
  <teleport to="body">
    <ActorAddModal v-if = "state.isOpenNewActorModal"
      :closed="state.isClosedActorModal"
      :groupId="state.groupNumber"
      @reloadAction = "onReloadAction"
      @closeAction = "onCloseNewActorModalAction"
      @acceptAction = "onAcceptNewActorModalAction"
    >
    </ActorAddModal>
    <CommonConfirmModal v-if = "state.isOpenDeleteActorConfirm"
    :confirmMessage="state.deleteActorConfirmMessage"
    :confirmDesp="state.deleteActorConfirmDesp"
    @closeAction = "onCloseDeleteActorModalAction"
    @onOkAction = "onDeleteActorAcceptAction"
    />
  </teleport>
</template>
<script lang="ts">
import { computed, defineComponent, inject, onMounted, reactive, ref } from 'vue'
import ViewNaviTop from '@/views/navigator/ViewNavTop.vue';
import useFecth from '@/composition/useFetch';
import { EColumnType, IColumn } from '@/interfaces/ui';
import GridPanel from '@/components/ui/grid/GridPanel.vue';
import CommonConfirmModal from '@/views/modal/CommonConfirm.vue';
import ActorAddModal from '@/views/modal/ActorAddModal.vue';
import useCommon from '@/composition/useCommon';
import useCustomEvent from '@/composition/useCustomEvent';
import router from '@/router';
import SearchIcon from '@/components/icons/actorSearchIcon.vue';
import actorIcons from '@/components/icons/actorIcons.vue';

export default defineComponent({
  name:'ViewActorManage',
  components: {
    ViewNaviTop,
    GridPanel,
    CommonConfirmModal,
    ActorAddModal,
    SearchIcon,
    actorIcons
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
    const gridComp = ref<InstanceType<typeof GridPanel>>();
    const { disPacthEvent } = useCustomEvent();

    const getSelectedGroupName = computed(() => _state.selectedGroup?.name);

    const state = reactive({
      isMounted: false,
      groupNumber: _state.selectedGroup?.id,
      searchWord: '',
      serachPlaceholderText: '인물 이름을 입력해 주세요',
      total: 0,
      isOpenDeleteActorConfirm: false,
      deleteActorConfirmMessage: '선택하신 인물을 삭제하시겠습니까?',
      deleteActorConfirmDesp: '복구할 수 없습니다',
      isOpenNewActorModal: false,
      isClosedActorModal: false,
      navigatorTitleList: [
        {
          name: '추출 파일 리스트',
          routeName: 'Export List',
        },
        {
          name: '그룹 관리',
          path: '/actor/group',
        },
        {
          name: `인물 관리(${getSelectedGroupName.value})`,
          routeName: '',
          evt: null,
        }
      ],
      columns: [{
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
      }] as IColumn[],
      actorManageStore: {
        type: 'json',
        url: `${useCommon.getApiUrl()}/actor/group/${_state.selectedGroup?.id}/actors/{id}`,
        params: { // Object
          page: 1,
          perPage: 10000,
          face_nm: '',
        },
        paging: {
          page: 'page',
          perPage: 'perPage',
          total: 'total',
        },
        events: {
          storeload: (store) => onGroupStoreload(store),
        },
        autoLoad: true,
      }
    });

    const onGroupStoreload = (store: any) => {
      state.total = store.responseData.total;
    }

    const onSearch = () => {}
    const onSearchTxtClear = () => state.searchWord = '';
    const isPeopleChecked = computed(() => (data: any) => data.isChecked);
    const getGroupData = async (groupNumber: string) => {
      const url = `${useCommon.getApiUrl()}/actor/group/${groupNumber}`;
      const datas = await useFecth(url, {
        method: 'get'
      });
      _state.selectedGroup = datas.data;
      state.navigatorTitleList[2].name = `인물 관리(${getSelectedGroupName.value})`;
      state.actorManageStore.url = `${useCommon.getApiUrl()}/actor/group/${groupNumber}/actors/{id}`;
      state.isMounted = true;
      state.groupNumber = datas.data.id;
    }

    const getImage = (data: any) => {
      return {
        'background-image': `url(data:image;base64,${data.image})`,
      }
    }

    const onPeopleSelect = (event: MouseEvent, data: any) => {
      console.log(1, event ,data);
      if (event.ctrlKey) {
        data.isChecked = !data.isChecked;
      } else {
        data.isChecked = true;
      }
    }

    const onPeopleRowChecked = (checked: boolean, data: any) => {
      data.isChecked = checked;
    }

    const onCloseDeleteActorModalAction = () => onOpenDeleteActor();
    const onDeleteActorAcceptAction = () => {
      // select
      const selectedItem = gridComp.value.getSelectedItems();
      const selectedItemIds = selectedItem.map((item) => item.id);
      if (selectedItemIds.length > 0) {
        const selectedItemArr = selectedItemIds.map(id => gridComp.value.deleteItem(id));
        Promise.all(selectedItemArr).then((res) => {
          if (res && res.length > 0) {
            const errorRes = res.filter((r: any) => r.success === false);
            let msg = `삭제가 완료 되었습니다.(${res.length} 건)`;
            if (errorRes.length > 0) {
              msg = `삭제가 완료 되었습니다.\r\n\r\n(성공: ${res.length - errorRes.length} 건 / 실패: ${errorRes.length} 건)`;
            }

            disPacthEvent('popUpMessage', {msg});
            gridComp.value.loadStore();
          }
        });
      } else {
        disPacthEvent('popUpMessage', {msg: '선택 된 인물이 없습니다.'});
      }
    }

    const onOpenDeleteActor = () => {
      state.isOpenDeleteActorConfirm = !state.isOpenDeleteActorConfirm;
    }

    const onCloseNewActorModalAction = () => onOpenNewActor();
    const onAcceptNewActorModalAction = () => {

    }

    const onOpenNewActor = () => {
      state.isOpenNewActorModal = !state.isOpenNewActorModal;
    }

    const onRowClick = () => {

    }

    const onRowDblClick = () => {

    }

    const onReloadAction = () => {
      if (gridComp.value) {
        gridComp.value.loadStore();
      }
    }

    const onGoGrouplist = () => {
      router.push('/actor/group');
    }

    const onGoSearchPage = () => {
      router.push('/actor');
    }

    onMounted(() => {
      if(!_state.selectedGroup?.name) {
        const matchDatas = window.location.pathname.match(/(\/actor\/group\/)(.*)(\/actors)/);
        if (matchDatas && matchDatas.length > 1) {
          const groupNumber = matchDatas[2];
          getGroupData(groupNumber);
        }
      } else {
        state.isMounted = true;
      }
    });

    return {
      state,
      onSearch,
      onSearchTxtClear,
      onPeopleSelect,
      onPeopleRowChecked,
      onOpenDeleteActor,
      onRowClick,
      onRowDblClick,
      onOpenNewActor,
      onCloseNewActorModalAction,
      onAcceptNewActorModalAction,
      getImage,
      isPeopleChecked,
      onCloseDeleteActorModalAction,
      onDeleteActorAcceptAction,
      gridComp,
      onReloadAction,
      onGoGrouplist,
      onGoSearchPage,
    }
  },
})
</script>
<style lang="scss" scoped>

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.search-list-tool-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;

  .search-list-tools-icon {
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    fill:#999;
    transition: 0.2s;
    // border:1px solid #999;
    border-radius: 5px;
    margin-right: 10px;
    background: #555; // #6600a5;

    &:hover {
      cursor: pointer;
      fill:#ccc;
    }
  }
}

  .search-people-popup-wrapper {
    position: absolute;
    margin-top: 100px;
    width: 100%;
    height: calc(100% - 100px);
    background: transparent;
    z-index: 1;
    left: 0px;
    padding: 20px;


    .search-people-popup-content-wrapper {
      display: flex;
      flex-direction: column;
      height:100%;
    }

    .search-people-popup-header-wrapper {
      display: flex;
      background: #000;
      width:100%;
      height:200px;
      overflow: auto;
      border-radius: 10px;

      .search-people-popup-list-wrapper {
        display: flex;
        margin: 10px 0px 0px 10px;
        min-width: 100px;
        max-height: 150px;
        border-radius: 5px;
        border:1px solid transparent;
        background: #666;
        cursor: pointer;
        box-shadow: 0 0 0 3px #00000000;
        transition: 0.2s;
        &:hover {
          box-shadow: 0 0 0 3px #fff;
        }
      }
    }

    .search-people-popup-body-wrapper {
      width: 100%;
      flex: 1;
      background: #000;
      margin-top:20px;
      border-radius: 10px;
    }
  }

  .group-select-wrapper {
    border:1px solid #999;
    height: 45px;
    border-radius: 5px;
    background: transparent;
    margin-right: 10px;
    transition: 0.2s;
    min-width:100px;
  }

  .group-image-wrapper {
    display: flex;
    flex-wrap: wrap;
    width:100%;
    height:100%;
    overflow: auto;
    padding:0px;
    margin:0px;
    .group-image-item-wrapper {
      max-width: 300px;
      width:180px;
      max-height: 400px;
      height:270px;
      margin: 15px 5px 5px 15px;
      background: #333;
      border-radius: 10px;
      padding:5px;
      user-select: none;
      transition: all 0.2s;
      box-shadow: 0 0 0 3px #00000000;
      position: relative;
      display: flex;
      flex-direction: column;

      .group-image-info {
        display: flex;
        align-items: center;
        min-height: 30px;
        span {
          padding-left:5px;
        }
      }

      .fit-image-wrapper {
        display: flex;
        width:100%;
        height:100%;

        .fit-image {
          background-repeat: no-repeat;
          background-size: contain;
          width:100%;
          height:100%;
        }
      }

      &.selected {
        box-shadow: 0 0 0 3px #fff;
      }
    }
  }

  .people-search-wrapper {
    width:100%;
    height:100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .header-search-tool-wrapper {
      display: flex;
      align-items: center;
      min-height: 60px;
      max-height: 60px;
      margin: 0px 10px;

      .tools-info {
        display: flex;
        flex: 1;
        align-items: center;
      }
    }

    .header-section {

    }
    .list-section {
      overflow: hidden;
      height:100%;
      width:100%;
      margin:0;
      padding:0;
      display: flex;
      flex-direction: column;

      .list-header-secion {
        height: 100px;
        min-height: 0;
      }

      .list-body-section {
        flex:1;
        width:100%;
        margin:0;
        padding:0;
        min-height: 0;
        position: relative;

        .tab-group-list-wrapper {
          min-height: 0;
          overflow: auto;
          width:100%;
          height:100%;
          position: absolute;
          top: 0;
          left: 0;
        }
      }
    }
  }
</style>
