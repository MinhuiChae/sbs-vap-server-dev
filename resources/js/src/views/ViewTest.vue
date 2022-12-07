<template>
  <div class = 'wrapper' style="overflow:hidden;">
      <!-- <TreeItem
        :datas = "treeData"
        :depth = "0"
      /> -->
      <!-- <div style="height:30px;font-size:12px;display:flex;align-items:center;text-indent:10px;"> SBS Video Content Analysis </div> -->
        <ViewNaviTop :title = "state.titleList"/>
        <TreeGirdPanelUi
          ref = "el"
          :columns = "columns"
          :datas = "treeDatas"
          :directMode = "state.directMode"
          :directTreeDatas = "state.directTreeDatas"
          :hiddenRoot = "true"
          :deepCollapseValue = 1
          @onRowSelected = "onRowSelected"
        >
          <!-- <template #description_row-slot="data">
            {{ data.datas[0].id ? data.datas[0].id : ''}}
          </template>   -->

          <template #header-slot>
            <header class = 'header-row'>
              <div class ='header-row-cell header-total'>
                Total: {{ totalCount }} 개
                <span v-show = "state.selectedCnt > 0" class = 'header-selected-info'>
                &nbsp; &nbsp; 선택: {{ state.selectedCnt }} 개
                </span>
              </div>
              <div class = 'header-row-cell header-search-type-wrapper'>
                <RadioGroupUi
                :useRadioButton = "false"
                :datas = "radioGroupData"
                @onSelected = "onRadioGroupSelected"
                >
                <template #body-slot = "radioData">
                  <span class = 'radio-select-item' :class = "{'selected' : radioData.selected}"> {{ radioData.label }} </span>
                </template>
                </RadioGroupUi>
              </div>
              <div class = 'header-row-cell header-search-type row-cell-right margin-10'>
                <button class ='btn-normal' @click.stop="onSearch"> 검색하기 </button>
                <button class ='btn-normal' @click.stop="onRefresh" > 새로고침 </button>
              </div>
            </header>
          </template>

          <template #item-icon_cell-slot>
            <VideoIcon :width = "18" :height = "18" class = "icon-white" /> &nbsp;
          </template>

        </TreeGirdPanelUi>


  </div>
</template>
<script lang="ts">
import {  computed, defineComponent, onMounted, reactive, ref, inject, Ref, nextTick } from 'vue';
// import usePremiereApi from '@/composition/usePremiereApi';
import { useRouter, useRoute } from 'vue-router';
import useTree from '@/composition/useTree';
// import TreeItem from '@/components/ui/tree/TreeItem.vue';
import TreeGirdPanelUi from '@/components/ui/treegrid/TreeGridPanel.vue';
import VideoIcon from '@/components/icons/VideoIcon.vue';
import RadioGroupUi from '@/components/ui/radiogroup/RadioGroup.vue';
import { IRadioGroupData } from '@/interfaces';
import { EColumnType, IColumn } from '@/interfaces/ui';
import ViewNaviTop from '@/views/navigator/ViewNavTop.vue';

export default defineComponent({
  name: 'view-exportList',
  components: {
    ViewNaviTop,
    TreeGirdPanelUi,
    RadioGroupUi,
    VideoIcon,
    //TreeItem,
  },
  props: {
    extractList: Array,
  },
  setup(props, context) {

    const el = ref<InstanceType<typeof TreeGirdPanelUi>>();
    const _state: any = inject('state');
    const extractList: Ref<any[]> | undefined = inject('extractList');

    // const { getWorker } = usePremiereApi();
    const router = useRouter();
    const route = useRoute();
    const state = reactive({
      selectedCnt: 0,
      selectedDatas: [],
      directMode: false,
      directTreeDatas: null,
      searchType: 'text',
      titleList: [{
        name: '추출 파일 리스트',
        urlName: '',
      }]
    })
    const { makeTree } = useTree();
    const treeDatas = ref<string[]>([]);
    const totalCount = computed(() => props.extractList?.length);

    const onGoMainPage = () => {
      router.push({name: 'Export Id'});
    }

    const onRadioGroupSelected = (selectedDatas: IRadioGroupData[]) => {
      state.searchType = selectedDatas[0].value;
    }

    const onRowSelected = (selectedDatas: any[]) => {
      state.selectedDatas = selectedDatas as any;
      state.selectedCnt = selectedDatas.length;
    }

    const onSearch = () => {
      _state.datas = state.selectedDatas;
      _state.extractInfo = {
        treeGridDatas: el.value.treeGridDatas,
      }
      switch(state.searchType) {
        case 'text':
          _state.lastedView = 'text';
          router.push({name: 'view list'});
          break;

        case 'people':
          _state.lastedView = 'people';
          router.push({name: 'people List'});
          break;

        case 'subtitle':
          _state.lastedView = 'subtitle';
          router.push({name: 'Subtitle list'});
          break;
      }
    }

    const onRefresh = () => {
      initTree();
    }

    const initTree = () => {
      const tree = makeTree();
      tree.setPathSeparateChar("\\");
      extractList.value = [{nodeId: "000f4c70", name: "C500_E_E185C841_200416TI_CANON.mov", path: "C:\영상폴더\패널샘플데이터\변환완본_런닝맨_617회\0인서트\미션1\C500_E_E185C841_200416TI_CANON.mov", treePath: "\테스트.prproj\변환완본_런닝맨_617회\0인서트\미션1\C500_E_E185C841_200416TI_CANON.mov", extension: "mov"},
      {nodeId: "000f4c70", name: "C500_E_E185C841_200416TI_CANON.mov", path: "C:\영상폴더\패널샘플데이터\변환완본_런닝맨_617회\0인서트\미션1\C500_E_E185C841_200416TI_CANON.mov", treePath: "\테스트.prproj\변환완본_런닝맨_617회\0인서트\미션1\C500_E_E185C841_200416TI_CANON.mov", extension: "mov"},
      {nodeId: "000f4c70", name: "C500_E_E185C841_200416TI_CANON.mov", path: "C:\영상폴더\패널샘플데이터\변환완본_런닝맨_617회\0인서트\미션1\C500_E_E185C841_200416TI_CANON.mov", treePath: "\테스트.prproj\변환완본_런닝맨_617회\0인서트\미션1\C500_E_E185C841_200416TI_CANON.mov", extension: "mov"},
      {nodeId: "000f4c70", name: "C500_E_E185C841_200416TI_CANON.mov", path: "C:\영상폴더\패널샘플데이터\변환완본_런닝맨_617회\0인서트\미션1\C500_E_E185C841_200416TI_CANON.mov", treePath: "\테스트.prproj\변환완본_런닝맨_617회\0인서트\미션1\C500_E_E185C841_200416TI_CANON.mov", extension: "mov"},
      {nodeId: "000f4c70", name: "C500_E_E185C841_200416TI_CANON.mov", path: "C:\영상폴더\패널샘플데이터\변환완본_런닝맨_617회\0인서트\미션1\C500_E_E185C841_200416TI_CANON.mov", treePath: "\테스트.prproj\변환완본_런닝맨_617회\0인서트\미션1\C500_E_E185C841_200416TI_CANON.mov", extension: "mov"},
      {nodeId: "000f4c70", name: "C500_E_E185C841_200416TI_CANON.mov", path: "C:\영상폴더\패널샘플데이터\변환완본_런닝맨_617회\0인서트\미션1\C500_E_E185C841_200416TI_CANON.mov", treePath: "\테스트.prproj\변환완본_런닝맨_617회\0인서트\미션1\C500_E_E185C841_200416TI_CANON.mov", extension: "mov"},]
      if (extractList) {
        extractList.value.forEach((data: any) => {
          const path = tree.getPathArray(data.treePath);
          tree.addChildPathOnlyItemNodeData(path.slice(2, path.length - 1), data);
        });

        nextTick(() => {
          const treeString: string = JSON.parse(tree.print());
          if (treeString) {
            treeDatas.value = [treeString];
          }
        });
      }
    }

    const initSelectedSearchGroup = () => {
      const findLastSearchGroup = radioGroupData.find((groupData) => groupData.value === _state.lastedView)
      if (findLastSearchGroup) {
        findLastSearchGroup.selected = true;
        state.searchType = findLastSearchGroup.value;
      }
      else {
        radioGroupData[0].selected = true;
      }
    }

    onMounted(() => {
      state.selectedDatas = [];
      if (route.query && route.query.refresh === '1') {
        state.directTreeDatas = _state.extractInfo?.treeGridDatas ?? [];
        state.directMode = true;
      } else {
        state.directMode = false;
        initTree();
      }

      initSelectedSearchGroup();
    })

    const radioGroupData = [{
      label: '대사',
      name: 'search_type',
      value: 'text',
      selected: false,
    },{
      label: '자막',
      name: 'search_type',
      value: 'subtitle',
      selected: false,
    },{
      label: '인물',
      name: 'search_type',
      value: 'people',
      selected: false,
    },{
      label: '오디오레벨',
      name: 'search_type',
      value: 'audiolevel',
      selected: false,
    }];

    const columns: IColumn[] = [{
      name: 'checkbox',
      type: EColumnType.Checkbox,
      title: '',
      width: '50px',
    },{
      name: 'name',
      type: EColumnType.String,
      title: 'Name',
      width: '',
      dataIndex: 'name',
    },{
      name: 'id',
      type: EColumnType.String,
      title: 'SBS ID',
      width: '200px',
      dataIndex: 'id',
    }];


    return {
      state,
      onGoMainPage,
      columns,
      totalCount,
      radioGroupData,
      onRadioGroupSelected,
      onRowSelected,
      treeDatas,
      onSearch,
      onRefresh,
      el,
    }
  },
})
</script>
<style lang="scss" scoped>
  @import "@/scss/variables.scss";

  .radio-select-item {
    padding: 5px;
    .radio-group-cell & {
      font-size: 1.2em;
      color:#999;
      transition: 0.2s;

      &.selected {
        color:#fff;
        font-size: 1.8em;
        &:hover {
          color:#fff;
        }
      }

      &:hover {
        color:#bbb;
        font-size: 1.8em;
      }
    }


  }

  #container {
    display: flex;
    flex-direction: column;
  }

  .wrapper {
    display:flex;
    width:100%;
    height:100%;
    flex-direction: column;
    // overflow: hidden;
  }

  .page-title-wrapper {
    display:flex;
    align-items: center;
    justify-content: center;
    padding:15px 15px;
    min-height:50px;

    .page-back-button {
      position: absolute;
      left: 0px;
      margin-left: 15px;
      cursor: pointer;
    }

    .page-title {
      font-size:26px;
    }
  }

  .grid-header {
    padding: 10px 20px;
    display: flex;
    width:100%;
    align-items: center;
    justify-content: space-between;
    min-height:50px;
    span {
      margin : 5px;
    }
    div {
      flex:1;
    }
  }

  .grid-footer {
    padding: 15px 20px;
    display: flex;
  }

  .grid {
    padding: 0px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .item-icon {
    width:12px;
    height:12px;
    border:0px;
    background-color: red;
  }

  .icon-white {
    fill: rgb(227, 151, 255);
  }

  .header-row {
    display: flex;
    align-items: center;
    // background-color: #000;
    min-height:60px;
    height:60px;
    .header-total {
      margin:10px;
    }

    .header-row-cell {
      flex:1;
    }
  }

  .row-cell-right {
    justify-content: flex-end;
    display: flex;
  }

  .header-selected-info{
    color:rgb(214, 133, 255);
  }

</style>
