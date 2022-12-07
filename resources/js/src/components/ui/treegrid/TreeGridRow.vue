<template>
  <tr class = "table-row"
      v-show = "(rowData.isCollapsed === false) && !(hiddenRoot && rowIndex === 0)"
  >
    <td v-for = "(column, index) in columns" :key = "index">
      <div class = 'table-cell-inner'
        :aria-colname = "column.name"
        :style = "getStyleColumn(column)"
        >
        <template v-if = "column.type === 'checkbox'">
          <input type="checkbox"
            :checked = "rowData.isChecked"
            @change = "onRowChecked($event.target.checked)" />
        </template>
        <template v-else-if = "(rowData.type === 'folder') && (column.name === 'name') ">
          <div
            v-if = "rowData.children.length > 0"
            class = "tree-expand-icon-wrapper"
            @click="onRowExpanded(!rowData.isExpanded)">
            <TreeExpandIcon :width= "20" :height = "20"
              class ="tree-expand-icon"
              :class = "{'rotate-90': rowData.isExpanded}"/>
          </div>
          <div
            v-if = "rowData.children.length === 0"
            class = "folder-empty">
          </div>
          {{ rowData.hasOwnProperty('title') ? rowData['title'] : '' }}

        </template>
        <template v-else-if = "rowData.type === 'item'">
          <template v-if = "(column.name === 'name')">
            <slot name="item-icon_cell-slot" v-bind = "rowData">
              <span class = 'item-icon'>&nbsp;</span>
            </slot>
          </template>
          <slot :name="column.name+'_cell-slot'" v-bind = "rowData">
            {{ rowData.datas[0].hasOwnProperty(column.dataIndex) ? rowData.datas[0][column.dataIndex] : '' }}
          </slot>
        </template>
      </div>
    </td>
  </tr>
  <template v-if = "rowData.childrenSize > 0 && rowData.isCollapsed === false" >
    <TreeGridRowUi
      v-for = "(child, index) in rowData['children']"
      :key = "index"
      :columns = "columns"
      :rowData = "child"
      :deep = "hiddenRoot === true ? deep : deep + 1"
      @rowExpanded = "onChildRowExpanded"
      @rowChecked = "onChildRowChecked"
    >
      <template v-for="(name) in rowCellsSlotNames()" #[name] = "data">
        <slot :name="name" v-bind="data"/>
      </template>
    </TreeGridRowUi>
  </template>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import TreeExpandIcon from '@/components/icons/TreeExpandIcon.vue';

export default defineComponent({
  name: 'TreeGridRowUi',
  components: {
    TreeExpandIcon,
  },
  emits: ['rowExpanded', 'rowChecked', 'allChecked'],
  props: {
    columns: Array,
    header: {
      type: Boolean,
      default: false,
    },
    rowData: {
      type: Object,
    },
    deep: {
      type: Number,
      default: 0,
    },
    rowIndex: {
      type: Number,
      default: 0,
    },
    hiddenRoot: {
      type: Boolean,
      default: false,
    },
    isAllChecekd: {
      type: Boolean,
      default: false,
    }
  },
  setup(props, context) {
    const baseClassPrefix = '';
    const doGetClassPrefix = (className: string): string =>  baseClassPrefix ? `${baseClassPrefix}-${className}` : `${className}`;
    const getRowClassPrefix = computed(() => (className: string) => {
      const rowClassList: string[] = [];
      rowClassList.push(doGetClassPrefix(className));
      if(props && props.rowData) {
        rowClassList.push(props.rowData?.isChecked ? 'selected' : '');
      }
      return rowClassList.join(" ");
    });

    const getStyleColumn = computed(() => (column: any) => {
      const styleMap: string[] = [];

      if (column.width) {
        if (column.width.indexOf('%')> -1) {
          styleMap.push(`width: ${column.width}`);
        } else {
          styleMap.push(`width: ${column.width}px`);
        }
      } else {
        styleMap.push(`flex: 1`);
      }

      if (column.textAlign && ['center', 'right'].includes(column.textAlign.toLowerCase()) === true) {
        styleMap.push(`justify-content: ${column.textAlign.toLowerCase()}`);
      }

      if (props.deep > 0 && column.name === 'name') {
        styleMap.push(`padding-left: ${props.deep * 35}px`);
      }

      return styleMap;
    });

    const onRowExpanded = (isExpanded: boolean) => {
      context.emit('rowExpanded', props.rowData , isExpanded);
    }

    const onChildRowExpanded = (child:any, isExpanded: boolean) => {
      context.emit('rowExpanded', child , isExpanded);
    }

    const rowCellsSlotNames = () => {
      return Object.keys(context.slots).filter((slotKey) => slotKey.endsWith('_cell-slot'));
    }

    const onRowChecked = (checked: boolean) => {
      context.emit('rowChecked', props.rowData, checked);
    }

    const onChildRowChecked = (child:any, checked: boolean) => {
      context.emit('rowChecked', child, checked);
    }

    const onAllChecked = (isChecked: boolean) => {
      console.log("isChecked> ", isChecked);
      context.emit('allChecked', isChecked);
    }

    onMounted(() => {
      // console.log(" rowData >", props.rowData);
    })

    return {
      getRowClassPrefix,
      getStyleColumn,
      props,
      onRowExpanded,
      onChildRowExpanded,
      rowCellsSlotNames,
      onRowChecked,
      onChildRowChecked,
      onAllChecked
    }
  },
})
</script>
<style lang="scss" scoped>

.folder-empty {
  display: block;
  width: 25px;
  height:25px;
}
.rotate-90 {
  transform: rotate(90deg);
}
.tree-expand-icon {
  fill:#fff;
  transition: 0.2s;
}

.tree-expand-icon-wrapper {
  width:35px;
  height:25px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.tree-grid-panel_header-row-wrapper {
  background-color: red;
  .row-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    .row-cell-inner-wrapper {
      height:100%;
      width:100%;
      display: flex;
      align-items: center;

      .row-cell-inner{
        padding:5px;
      }
    }
  }
}
.tree-grid-panel_body-row-wrapper {
  .row-wrapper {
    display: flex;
    flex: 1;
    min-height: 32px;
    border-bottom: 1px solid rgb(62, 62, 62);
    // div {
    //   border:1px solid #e2e2e2;
    // }
    &.selected {
      background-color: #4b4b4b;
    }

    .expand-icon {
      padding: 0;
      width: 30px;
      height: 30px;
      position: relative;
      line-height: 1;
      cursor: pointer;
      background: transparent;
      border: 1px solid;
      text-align: center;
      display: inline-block;
      border-radius: 1px;
      margin-right: 10px;

      &::after {
        content: "+";
        position: absolute;
        left:5px;
      }
    }

    .row-cell-inner {
      min-height: 30px;
      display: flex;
      align-items: center;
      height:100%;
      font-size:14px;
    }
  }
}
</style>
