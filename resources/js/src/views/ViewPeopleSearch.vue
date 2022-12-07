<template>
  <transition name="fade">
    <div ref = "popupEl" @click.stop = "onPopupElClick" class = 'search-people-popup-wrapper' v-show = 'state.isShowPeopleSearchPopUp' >
      <div class = 'search-people-popup-content-wrapper'>
        <div class = 'search-people-popup-header-wrapper'>
          <div class = 'search-people-popup-select-actor-wrapper'>
            <TransitionGroup  name="fade">
              <div v-for ="actor in state.selectedActors" :key ="actor" class = 'search-people-popup-list-wrapper'>
                <div class = 'fit-image-wrapper'>
                  <div class ='image-name'> {{ actor.face_nm }}</div>
                  <div class = 'fit-image' :style ="getImage(actor)" />
                  <div class = 'image-close-btn-wrapper'><CloseBtnIcon :width="20" :height="20" @click.stop.prevent="deleteSelectedActorAction(actor)"/></div>
                </div>
              </div>
            </TransitionGroup >
          </div>
          <div class = 'search-people-popup-btn-actor-wrapper' @click="onActorMarkerSearch">
          </div>
        </div>

        <div class = 'search-people-popup-body-wrapper' :class = "{'dragActive': state.activeDragEvt}">
          <div style = 'height:100%;overflow:hidden' v-if ="state.isInit">
            <GridPanel
              ref = "actorGridComp"
              :columns="[]"
              :store = "actorGroupJsonStore"
              :useHeader="false"
              :useTable="false"
              :useBuildGridData="true"
              @onSelectedItem="onSelectedActorItem"
            >
              <template #content-table-template="datas">
                <div class = "group-image-wrapper">
                  <div class ='group-image-item-wrapper' :class = "{'selected': isActorChecked(data)}"
                  v-for =" data in datas" :key="data.id"
                  @click="onActorSelect($event, data)"
                  >
                    <div class = 'group-image-info'>
                      <!-- <input type = "checkbox" :checked = "isActorChecked(data)" @click.stop="" @change = "onPeopleRowChecked($event.target.checked, data)"/> -->
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
      </div>
    </div>
  </transition>
  <div class = 'people-search-wrapper'>
    <div class = 'section header-section'>
      <ViewNaviTop :title = "state.navigatorTitleList">
        <template #search-slot>
          <div  class = 'search-list-tool-wrapper' v-show = "state.viewType === 'search-list'">
            <div class = 'search-list-tools-icon' @click="onGoGrouplist">
              <GroupIcon :width="30" :height="30" iconColor="#999"/>
            </div>
            <div class = 'search-list-tools-icon' @click="onGoGroupPeopleList">
              <PeopleIcon :width="20" :height="20"/>
            </div>
            <SelectDropUi class='group-select-wrapper'
              :items="state.groupSelectOpts.items"
              :itemTopMargin="5"
              :useEditable="false"
              @onSelectItem="onChangeGroup "/>
          </div>
          <div class = 'search-input-wrapper'>
            <input
              ref ="searchInputEl"
              type="text" width=100 class ='search-input' :placeholder = "serachPlaceholderText"
              :value="state.searchWord"
              @input="debounceSearch"
              @keyup.enter = "onSearchKeyPressEnter"
              @focus.stop.prevent="onFocus"
              @blur="onBlur"
              style:
              />
            <div class = "input-clear-btn" @click.stop.prevent="onSearchTxtClear"><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"><path d="M23 20.168l-8.185-8.187 8.185-8.174-2.832-2.807-8.182 8.179-8.176-8.179-2.81 2.81 8.186 8.196-8.186 8.184 2.81 2.81 8.203-8.192 8.18 8.192z"/></svg></div>
          </div>
          <div class = 'search-btn-wrapper'>
            <button :disabled ="state.isSearchBtnDisabled" class ='btn-normal search-btn' @click.stop.prevent="onSearch"> 검색 </button>
          </div>
        </template>
      </ViewNaviTop>
    </div>
    <div class = 'section tools-section'>
      <!-- 버튼 및 상태 -->
    </div>
    <div class = 'section list-section'>
      <div class = 'list-body-section' :class ="{'disabled': state.isShowPeopleSearchPopUp}">
        <ViewSearchComponent
          ref = "markerSerchComp"
          searchType="actor"
          :autoLoad = "false"
          :emptyText= "state.emptyText"
          :store = "state.markerStore"
          :faceDatas = "state.searchFaceDatas"
        >
        </ViewSearchComponent>
      </div>
    </div>
  </div>
  <teleport to="body">
   <ActorAddModal v-if = "state.isOpenNewActorModal"
      ref = "ActorAddModalComp"
      :closed="state.isClosedActorModal"
      :groupId="state.group"
      :useSelfEvent = "false"
      @reloadAction = "onReloadAction"
      @closeAction = "onCloseNewActorModalAction"
      @acceptAction = "onAcceptNewActorModalAction"
    >
    </ActorAddModal>
  </teleport>
</template>
<script lang="ts">
import { computed, defineComponent, inject, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import ViewNaviTop from '@/views/navigator/ViewNavTop.vue';
import GridPanel from '@/components/ui/grid/GridPanel.vue';
import ViewSearchComponent from '@/views/components/ViewSearch.vue';
import SelectDropUi from '@/components/ui/selectdrop/SelectDrop.vue';
import GroupIcon from '@/components/icons/groupIcon.vue';
import PeopleIcon from '@/components/icons/peopleIcon.vue';
import router from '@/router';
import usePremiereApi from '@/composition/usePremiereApi';
import useCustomEvent from '@/composition/useCustomEvent';
import useCommon from '@/composition/useCommon';
import useFetch from '@/composition/useFetch';
import CloseBtnIcon from '@/components/icons/closeBtnIcon.vue';
import ActorAddModal from '@/views/modal/ActorAddModal.vue';
import _ from 'lodash';

import useDrop from '@/composition/useDropApi';

export default defineComponent({
  name:'viewPeopleSearch',
  props: {
    extractPercent: {
      type: Number,
      default: 0,
    },
    extractList: {},
    default : {}
  },
  components: {
    ViewNaviTop,
    GridPanel,
    ViewSearchComponent,
    SelectDropUi,
    GroupIcon,
    PeopleIcon,
    CloseBtnIcon,
    ActorAddModal,
  },
  setup() {
    const searchInputEl = ref<HTMLInputElement>();
    const popupEl = ref<HTMLDivElement>();
    const groupGridComp = ref<InstanceType<typeof GridPanel>>();
    const actorGridComp = ref<InstanceType<typeof GridPanel>>();
    const markerSerchComp = ref<InstanceType<typeof ViewSearchComponent>>();
    const ActorAddModalComp = ref<InstanceType<typeof ActorAddModal>>();
    const _state: any = inject('state');
    const { updateGroup } = usePremiereApi();
    const { disPacthEvent } = useCustomEvent();
    const { initUseDrop, disposeUseDrop } = useDrop();
    const getLastedGroup = computed(() => _state.group ?? 'first');
    const state = reactive({
      isInit: false,
      viewType: 'search-list', // group-list, group-detail-list, search-list
      total: 0,
      groupTotal: 0,
      isOpenNewGroupModal: false,
      isOpenDeleteGroupConfirm: false,
      isActorLoaded: false,
      searchWord: '',
      navigatorTitleList: [
        {
          name: '추출 파일 리스트',
          routeName: 'Export List',
        },
        {
          name: '인물 검색',
          routeName: '',
          evt: null,
        }
      ],
      isClosedGroupModal: false,
      group: '',
      groupSelectOpts: {
        title: '인물 그룹',
        items: []
      },
      isShowPeopleSearchPopUp: false,
      isClearEvt: false,
      emptyText: "인물을 선택하여 검색하세요.",
      actorManageStore: null,
      selectedActors:  [],
      lastedSearchWord: '',
      isOpenNewActorModal: false,
      activeDragEvt: false,
      markerStore:{

      },
      searchFaceDatas: [],
    });

    const getSelecteActor = computed(() => {
      return actorGridComp?.value?.getSelectedItems() ?? [];
    })

    const isActorChecked = computed(() => (data: any) => {
      if (state.selectedActors.find((actor) => actor.id === data.id)) {
        data.isChecked = true;
      }
      return data.isChecked;
    });

    const onActorSelect = (event: MouseEvent, data: any) => {
      actorGridComp.value.selectItem(data.id);
    }

    const serachPlaceholderText = computed(() => '인물을 검색하세요');

    const onGoListPage = () => router.push({name: 'Export List'});
    const onSearchTxtClear = () => {
      state.isClearEvt = true;
      setTimeout(() => {
        state.searchWord = '';
        searchInputEl.value.focus();
      })
    }
    const onOpenNewGroup = () => {
      state.isOpenNewGroupModal = !state.isOpenNewGroupModal;
      state.isClosedGroupModal = false;
    }

    const onSelectedActorItem = (item: any) => {
      const findSelectedActor = state.selectedActors.find((actor) => actor.id === item.id);
      if(item.isChecked === false) {
        // deselected
        if (findSelectedActor) {
          const findSelectedActorIndex = state.selectedActors.findIndex((actor) => actor.id === item.id);
          state.selectedActors.splice(findSelectedActorIndex,1);
        }
      } else if(findSelectedActor === undefined) {
        state.selectedActors.push(item);
      }

      console.log("state.selectedActors", state.selectedActors)
    }

    const onSearch = () => {
      actorGridComp.value.setStoreParam('face_nm',state.searchWord.trim());
      actorGridComp.value.loadStore();
    }

    const groupListStore = () => {
      return {

      }
    }

    const onFocus = () => {
      if (state.isShowPeopleSearchPopUp === false) {
        showPeopleSearchPopup();
        if (state.isActorLoaded === false || state.searchWord.trim() !== state.lastedSearchWord) {
          actorGridComp.value.setStoreParam('face_nm',state.searchWord.trim());
          actorGridComp.value.loadStore();
        }
      }
    }

    const getImage = (data: any) => {
      return {
        'background-image': `url(data:image;base64,${data.image})`,
      }
    }

    const onGoGrouplist = () => {
      router.push('/actor/group');
    }

    const onGoGroupPeopleList = () => {
      _state.selectedGroup = null;
      router.push(`/actor/group/${state.group}/actors`);
    }

    const onGroupStoreload = (store) => {
      state.isActorLoaded = true;
    }

    const actorGroupJsonStore = computed(() => {
      return {
        type: 'json',
        url: `${useCommon.getApiUrl()}/actor/group/${state.group}/actors/{id}`,
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
          storeload: (store) => onGroupStoreload(store)
        },
        autoLoad: false,
        usePagingUi: false,
      }
    });

    const onRowClick = (rowData: any) => {
      console.log("onRowClick >>", rowData)
    }

    const hidePeopleSearchPopup = (event: MouseEvent) =>  {
      if (!searchInputEl.value.contains(event.target as Node)) {
        state.isShowPeopleSearchPopUp = false;
      }
    }
    const showPeopleSearchPopup = () =>  state.isShowPeopleSearchPopUp = true;

    const onChangeGroup = async (group: any) => {
      if (state.group !== group[0].id) {
        state.isActorLoaded = false;
      }
      state.group = group[0].id;
      _state.group = group[0].id;
      await updateGroup(group[0].id);
    }

    const onLoadGroup = async () => {
      const url = `${useCommon.getApiUrl()}/actor/group?page=1&perPage=5000000`;
      const fetchResponse = await useFetch(url,{method:'get'});
      if (fetchResponse.success === true) {
        const groupSelectOptsList = [];
        Array.from(fetchResponse.data).forEach((data: any) => {
          groupSelectOptsList.push({
            id: data.id,
            label: data.name,
            vlaue: data.id,
            selected : getLastedGroup.value === data.id,
          })
        });

        if (getLastedGroup.value === 'first' && groupSelectOptsList.length > 0) {
          groupSelectOptsList[0].selected = true;
          state.group = groupSelectOptsList[0].id;
        } else {
          state.group = getLastedGroup.value;
        }

        console.log("groupSelectOptsList ", groupSelectOptsList);

        state.groupSelectOpts.items = [...groupSelectOptsList];
      }
      // console.log("state.isInit >>>> START ", state.group)
      state.isInit = true;
    }

    const doDebounceSearch = _.debounce((data) => {
      actorGridComp.value.setStoreParam('face_nm', data);
      actorGridComp.value.loadStore();
      state.lastedSearchWord = data;
    },200);

    const debounceSearch = (event: InputEvent) => {
      state.searchWord = (event.target as HTMLInputElement).value;
      if (state.searchWord !== state.lastedSearchWord){
        doDebounceSearch(state.searchWord);
      }
    }

    const makeMarkerStore = () => {
      state.markerStore = {
        url: `${useCommon.getFaceApiUrl()}/actor/search`,
        type: 'json',
        paging: {
          page: 'currentPage',
          perPage: 'page',
          total: 'total',
        },
        autoLoad: false,
      };
    }

    const makeSearchFaceData = () => {
      state.searchFaceDatas = [];
      state.selectedActors.forEach((actor) => {
        markerSerchComp.value.setStoreParams('face_id', Number(actor.face_id));
        state.searchFaceDatas.push({
          face_id: actor.face_id,
          url: `data:image/jpeg;base64,${actor.image}`
        })
      });
      markerSerchComp.value.storeLoad();
    }

    const onActorMarkerSearch = () => {
      if (state.selectedActors.length > 1) {
        disPacthEvent('popUpMessage', {msg: '여러명의 인물을 검색할 수 없습니다.'})
      } else if (state.selectedActors.length === 0) {
        disPacthEvent('popUpMessage', {msg: '인물을 선택해 주세요.'})
      } else {
        makeSearchFaceData();
        state.isShowPeopleSearchPopUp = false;
      }
    }

    const onSearchKeyPressEnter = () => {
      const item = actorGridComp.value.getItemByIndex(0);
      if(item && item.isChecked === false) {
        actorGridComp.value.selectItem(item.id);
      }
    }

    const deleteSelectedActorAction = (actor: any) => {
      actorGridComp.value.deSelectedItem(actor.id);
      const findSelectedActorIndex = state.selectedActors.findIndex((selectedActor) => actor.id === selectedActor.id);
      state.selectedActors.splice(findSelectedActorIndex,1);
    }

    const onCloseNewActorModalAction = () => {
       state.isOpenNewActorModal = false;
    }

    const onBlur = (e: MouseEvent) => {
      console.error("e ,,, ", e);
    }

    const onPopupElClick = (e: MouseEvent) => {
      console.warn("e ", e);
    }

    const onSetParams = (item: any) => {
      console.log("item", item)
    }

    onUnmounted(() => {
      window.removeEventListener('click', hidePeopleSearchPopup, false);
      disposeUseDrop();
    })

    onMounted(() => {
      _state.lastedView = 'people';
      window.addEventListener('click', hidePeopleSearchPopup, false);

      const cloneEl = document.getElementsByClassName('search-people-popup-body-wrapper');
      if (cloneEl && cloneEl[0]) {
        initUseDrop(cloneEl[0] as HTMLElement, {
          dragEnterCallback: () => state.activeDragEvt = true,
          beforeDragEnterCallback: () => state.isShowPeopleSearchPopUp,
          dragLeaveCallback: () => state.activeDragEvt = false,
          beforeDragLeaveCallback: () => state.isShowPeopleSearchPopUp,
          beforeDropCallback: () => {
            state.activeDragEvt = false;
            return true;
          },
          dropCallback: (e) => {
            if (e.dataTransfer?.items?.length > 0)  {
              state.isOpenNewActorModal = true;
              nextTick(() => {
                ActorAddModalComp.value.addDataTransfer(e.dataTransfer);
              })
            }
          },
        });
      }

      onLoadGroup();
      makeMarkerStore();
    })

    return {
      state,
      searchInputEl,
      onSearch,
      onSearchTxtClear,
      onRowClick,
      onOpenNewGroup,
      serachPlaceholderText,
      onGoListPage,
      onGoGrouplist,
      onFocus,
      onChangeGroup,
      onGoGroupPeopleList,
      groupGridComp,
      actorGridComp,
      actorGroupJsonStore,
      isActorChecked,
      onActorSelect,
      getImage,
      debounceSearch,
      getSelecteActor,
      onActorMarkerSearch,
      onSelectedActorItem,
      onSearchKeyPressEnter,
      deleteSelectedActorAction,
      markerSerchComp,
      popupEl,
      onCloseNewActorModalAction,
      ActorAddModalComp,
      onBlur,
      onPopupElClick,
      onSetParams
    }
  },
})
</script>
<style lang="scss" >

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
    margin-top: 110px;
    width: 100%;
    height: calc(100% - 110px);
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
      height:170px;
      overflow: hidden;
      border-radius: 10px;
      .search-people-popup-select-actor-wrapper {
        display: flex;
        flex:1;
        overflow: auto;
      }

      .search-people-popup-btn-actor-wrapper {
        display: flex;
        justify-content: flex-end;
        min-width:150px;
        margin:10px;
        padding:10px;
        align-items: flex-end;
        justify-content: center;
        border-radius: 10px;
        background-color: #444;
        cursor: pointer;
        transition: 0.2s;
        color:#444;
        // background-size: contain;
        background-repeat: no-repeat;
        background-position-x: 50%;
        background-position-y: 50%;
        background-image: url("data:image/svg+xml,%3Csvg width='100' fill='%23111' height='100' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.172 24l-7.387-7.387c-1.388.874-3.024 1.387-4.785 1.387-4.971 0-9-4.029-9-9s4.029-9 9-9 9 4.029 9 9c0 1.761-.514 3.398-1.387 4.785l7.387 7.387-2.828 2.828zm-12.172-8c3.859 0 7-3.14 7-7s-3.141-7-7-7-7 3.14-7 7 3.141 7 7 7zm-3-8c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1zm3 0c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1zm3 0c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1z'/%3E%3C/svg%3E");

        &:hover{
          background-color: #888;
           color:#444;
          background-image: url("data:image/svg+xml,%3Csvg width='100' fill='%23000' height='100' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21.172 24l-7.387-7.387c-1.388.874-3.024 1.387-4.785 1.387-4.971 0-9-4.029-9-9s4.029-9 9-9 9 4.029 9 9c0 1.761-.514 3.398-1.387 4.785l7.387 7.387-2.828 2.828zm-12.172-8c3.859 0 7-3.14 7-7s-3.141-7-7-7-7 3.14-7 7 3.141 7 7 7zm-3-8c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1zm3 0c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1zm3 0c.552 0 1 .448 1 1s-.448 1-1 1-1-.448-1-1 .448-1 1-1z'/%3E%3C/svg%3E");
        }
      }


      .search-people-popup-list-wrapper {
        display: flex;
        margin: 10px 0px 0px 10px;
        min-width: 100px;
        max-height: 150px;
        border-radius: 5px;
        border:1px solid transparent;
        background: #666;
        cursor: pointer;
        outline: none;
        box-shadow: 0 0 0 3px #ffffff00;
        transition: 0.2s;

        &:hover {
          box-shadow: 0 0 0 3px #fff;
        }

        .fit-image-wrapper {
          display: flex;
          width:100%;
          height:100%;
          padding:5px;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          .image-name {
            font-size: 0.8rem;
            padding:2px;
          }

          .image-close-btn-wrapper {
            padding: 5px;
            position: relative;
          }

          .fit-image {
            background-repeat: no-repeat;
            background-size: contain;
            background-position-x: center;
            width:100%;
            height:100%;
          }
        }
      }
    }

    .search-people-popup-body-wrapper {
      width: 100%;
      flex: 1;
      background: #000;
      margin-top:20px;
      border-radius: 10px;
      overflow: hidden;

      &.dragActive {
        outline-color: #fff;
        outline-style: solid;
        outline-width: 3px;
      }

      .grid-panel-wrapper {
        .grid-panel-body-wrapper {
          border:0px !important;
        }
      }
    }
  }

  .group-select-wrapper {
    // border:1px solid #999;
    background-color:#555;
    height: 45px !important;
    border-radius: 5px;
    // background: transparent;
    margin-right: 10px;
    transition: 0.2s;
    width:200px;

    input {
      font-size:1rem;
    }
  }

  .group-image-wrapper {
    display: flex;
    flex-wrap: wrap;
    width:100%;
    height:100%;
    overflow: auto;
    padding:0px;
    margin:0px;
    padding-bottom:10px;

    .group-image-item-wrapper {
      max-width: 300px;
      width:150px;
      max-height: 400px;
      height:200px;
      margin: 15px 0px 5px 15px;
      background: #333;
      border-radius: 10px;
      padding:5px;
      user-select: none;
      transition: all 0.2s;
      box-shadow: 0 0 0 3px #ffffff00;
      position: relative;
      cursor: pointer;
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
        overflow: hidden;
        border-radius: 10px;

        .fit-image {
          border-radius: 10px;
          // background-color: #000;
          background-repeat: no-repeat;
          background-size: contain;
          background-position-x: center;
          width:100%;
          height:100%;
        }
      }

      &.selected {
        box-shadow: 0 0 0 3px #fff;
        // outline-color: rgb(222, 222, 222);

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
        transition: 0.2s;

        &.disabled {
          opacity: 0;
        }

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
