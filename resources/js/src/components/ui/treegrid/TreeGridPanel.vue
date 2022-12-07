<!-- TreeGridPanle -->
<template>
  <GridPanelUi
    ref = "gridPanelComp"
    :columns = "columns"
    :datas = "treeGridDatas"
    @extendSelectAll = "selectAll"
    >
    <template #header-slot>
      <slot name="header-slot"/>
    </template>
    <template #content-row-template="rowDatas">
      <TreeGridRow
          :columns = "columns"
          :rowData = "rowDatas[0]"
          :hiddenRoot = "hiddenRoot"
          @rowExpanded = "onRowExpanded"
          @rowChecked = "onRowChecked"
        >

        <template v-for="(name) in getSlotFilter('end', '_cell-slot')" #[name] = "data">
          <slot :name="name" v-bind="data"/>
        </template>
      </TreeGridRow>
    </template>
  </GridPanelUi>
</template>
<script lang="ts">
import { defineComponent, nextTick, onMounted, PropType, reactive, ref, watch } from 'vue';
import TreeGridRow from '@/components/ui/treegrid/TreeGridRow.vue';
import { ITreeNodeData } from '@/interfaces';
import GridPanelUi from '@/components/ui/grid/GridPanel.vue';
import { IColumn, ITreeData } from '@/interfaces/ui';
import useContext from '@/composition/useContext';

export default defineComponent({
  name: "TreeGirdPanelUi",
  // emits: ["onRowSelected"],
  components: {
    GridPanelUi,
    TreeGridRow,
  },
  props: {
    columns: {
      type: Array(Object) as PropType<IColumn[]>,
      default: [],
    },
    datas: {
      type: Array(Object) as PropType<ITreeData[]>,
    },
    hiddenRoot: {
      type: Boolean,
      default: false,
    },
    deepCollapseValue: {
      type: Number,
      default: -1,
    },
    directMode: {
      type: Boolean,
      default: false,
    },
    directTreeDatas: {
      type: Array(Object) as PropType<ITreeNodeData[]>,
      default: [],
    }
  },
  setup(props, context) {
    const defaultChildProperty = 'children';
    const treeGridDatas = ref([]);
    const gridPanelComp = ref<InstanceType <typeof GridPanelUi>>();
    const { getSlotFilter } = useContext(context);

    const state = reactive({
      selectedDatas: new Map<ITreeNodeData, ITreeNodeData>(),
    });
    // const isSelecedRow = computed(() => Array.from(state.selectedDatas.keys()).length);
    // const initSelectedDatas = () => {
    //   state.selectedDatas = new Map<ITreeNodeData, ITreeNodeData>();
    // }

    const buildGridRowData = (row: any, index: number, parent: any = null, deep: number = 0): ITreeNodeData => {
      const treeRowData: ITreeNodeData = {
        ...row,
        isChecked: false,
        isExpanded: true,
        isFolder: false,
        isCollapsed: false,
        deepLevel: deep,
        parent: parent,
      }

      /**
       * 자식 처리
       */
      if (parent !== null) {
        if (!parent.isExpanded) {
          treeRowData.isCollapsed = true;
        }
      }

      if (props.deepCollapseValue !== -1 && deep >= props.deepCollapseValue) {
        treeRowData.isExpanded = false;
      }

      if (Object.prototype.hasOwnProperty.call(treeRowData, defaultChildProperty)) {
        treeRowData[defaultChildProperty] = treeRowData[defaultChildProperty].map((child: any, idx: number) => {
          return buildGridRowData(child, idx, treeRowData, deep + 1)
        });
        treeRowData.childrenSize = treeRowData[defaultChildProperty].length;
      }

      return treeRowData;
    }

    const buildGridData = (datas: any[]) => {
      if (datas) {
        console.error(" buildGridData ");
        treeGridDatas.value = datas.map((row, index) => buildGridRowData(row, index)) as any;
      }
    }

    const onRowExpanded = (row: any, isChecked: boolean, parent:any = null) => {
      if (parent === null) row.isExpanded = isChecked;
      if (Object.prototype.hasOwnProperty.call(row, defaultChildProperty)) {
        row[defaultChildProperty].forEach((child: any) =>  child.isCollapsed = !isChecked);
      }

      nextTick(()=>gridPanelComp.value.resize());
    }

    const updateSelectedData = (row: ITreeNodeData) => {
       if (row.isChecked === true && row.type === 'item') {
          if (!state.selectedDatas.has(row)) {
            state.selectedDatas.set(row, row);
          }
        } else if(row.type === 'item') {
          if (state.selectedDatas.has(row)) {
            state.selectedDatas.delete(row);
          }
        }
    }

    const doRowChecked = (row: ITreeNodeData, isChecked: boolean, updateParent: boolean = true) => {
      return new Promise<null>((resolve) => {
        row.isChecked = isChecked;
        if (Object.prototype.hasOwnProperty.call(row, defaultChildProperty)) {
          row[defaultChildProperty].forEach((child: any) => doRowChecked(child, isChecked, false));
        }

        if (updateParent) {
          let parent = row.parent;
          let deep = row.deepLevel; // 2차 안정
          while(parent && deep > 0) {
            if (parent && parent[defaultChildProperty]) {
              parent.isChecked = parent[defaultChildProperty].every((child: ITreeNodeData) => child.isChecked);
            }
            parent = parent.parent;
            deep = deep - 1;
          }
        }

        updateSelectedData(row);
        resolve(null);
      });
    }

    const onRowChecked = (row: ITreeNodeData, isChecked: boolean) => {
      doRowChecked(row, isChecked).then(() => {
        context.emit('onRowSelected', Array.from(state.selectedDatas.keys()));
      })
    }

    const selectAll = (checked: boolean) => {
      onRowChecked(treeGridDatas.value[0], checked);
    }

    const checkCheckedData = (row: ITreeNodeData) => {
      if (row.isChecked === true) updateSelectedData(row);
      if (Object.prototype.hasOwnProperty.call(row, defaultChildProperty)) {
        row[defaultChildProperty].forEach((child: any) => checkCheckedData(child));
      }
    }

    const allCheckedData = async(row: ITreeNodeData): Promise<null> => {
      return new Promise<null>((resolve) => {
        checkCheckedData(row);
        resolve(null);
      });
    }

    onMounted( () => {
      watch(
        () => props.datas,
        () => {
          buildGridData(props.datas as any);
        },
        {deep: true}
      );

      watch(
        () => props.directMode,
        () => {
          if (props.directMode === true) {
            if (props.directTreeDatas && props.directTreeDatas.length > 0) {
              treeGridDatas.value = props.directTreeDatas;
               nextTick( async() => {
                await allCheckedData(treeGridDatas.value[0]);
                context.emit('onRowSelected', Array.from(state.selectedDatas.keys()));
              });
            }
          }
        },
        {deep: true}
      )
    })

    /**
     * Tree Data 양식은
     * {
     *  title:
     *  type: 'folder' or 'item',
     *  path: ['','', ''] // 형태로 되어있어야 한다.
     *  children: []
     *  datas: any
     *  ITreeData,
     * }
     */


    return {
      gridPanelComp,
      treeGridDatas,
      getSlotFilter,
      onRowExpanded,
      onRowChecked,
      selectAll,
    }
  },
})
</script>
<style lang="scss" scoped>

</style>
