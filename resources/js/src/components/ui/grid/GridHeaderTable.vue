<template>
  <table class = "table-header-wrapper" ref = "el" :style = "style">
    <colgroup>
      <col v-for = "(column, index) in columns" :key = "index"
        :aria-colname = "column.name"
        :style = "{'width': column.width}"
        ref = "columnGroups"
      />
    </colgroup>
    <thead>
      <template v-if = "columns.length > 0">
        <tr class = 'table-row'>
          <th class ="table-cell"
            v-for = "(column, index) in columns" :key = "index"
            :aria-colname = "column.name"
            ref = "columnCellEls">
            <div class = 'table-cell-inner'>
              <div class = 'table-cell-inner-content'>
                <template v-if = "column.type === 'checkbox'">
                  <input type = "checkbox"
                  @change = "onRowChecked($event.target.checked)"/>
                </template>
                <template v-else>
                  <slot :name="column.name+'_cell-header-slot'" v-bind = "column" >
                    {{ column.title }}
                  </slot>
                </template>
              </div>
            </div>
            <span
              :aria-colname = "column.name"
              class = 'column-resizer' ref = "columnResizerEls"/>
          </th>
        </tr>
      </template>
    </thead>
  </table>

</template>
<script lang="ts">
import { IColumn, IColumnResizeEventInfo } from '@/interfaces/ui'
import { defineComponent, onMounted, PropType, reactive, ref } from 'vue'
import useDragApi from '@/composition/useDragApi';

export default defineComponent({
  name: 'GridHeaderTableUi',
  emits: ['onChangeCellResize', 'selectAll'],
  props: {
    columns: {
      type: Array(Object) as PropType<IColumn[]>,
      default: [],
    },
    useColumnResize: {
      type: Boolean,
      default: false,
    },
    style: {
      type: Object,
      default : {}
    }
  },
  setup(props, context) {
    const el = ref<HTMLElement>();
    const columnResizerEls = ref<HTMLElement[]>([]);
    const columnGroups = ref<HTMLElement[]>([]);
    const columnCellEls = ref<HTMLElement[]>([]);

    const { initDragableEl, movePosition } = useDragApi();

    const state = reactive({
      moveCell: null,
      moveColumnName: '',
      beforeCellWidth: 0,
      beforeTableWidth: 0,
    });

    const findColGroup = (colName: string): HTMLElement | undefined  => {
      return Array.from(columnGroups.value).find((group: HTMLElement) => group.getAttribute('aria-colname') === colName);
    }

    const findCellEl = (colName: string): HTMLElement | undefined  => {
      return Array.from(columnCellEls.value).find((cell: HTMLElement) => cell.getAttribute('aria-colname') === colName);
    }

    const onResizerMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const attr = target.getAttribute('aria-colname');
      console.log("columnGroups> ", columnGroups.value);

      if (attr) {
        const col = findColGroup(attr);
        const cell = findCellEl(attr);
        const cellRect = cell.getBoundingClientRect();
        state.beforeCellWidth = cellRect.width;
        state.moveCell = col;
        state.moveColumnName = attr;
      }
      state.beforeTableWidth = el.value.clientWidth;
    }

    const onResizerMove = () => {
      if (state.beforeCellWidth + movePosition.pageX > 20) {
          context.emit("onChangeCellResize", {
          name: state.moveColumnName,
          width: state.beforeCellWidth + movePosition.pageX,
          tableWidth: state.beforeTableWidth + movePosition.pageX,
        } as IColumnResizeEventInfo);
      }
    }

    const initResizerEvent = () => {
      if (columnResizerEls.value.length > 0) {
        Array.from(columnResizerEls.value).forEach((columnResizerEl: HTMLElement) => {
          initDragableEl({
            el: columnResizerEl,
            moveCallback: onResizerMove,
            beforeDownEvt: onResizerMouseDown,
          })
        });
      }
    }

    const initCellResize = () => {
      // console.log('...:', el.value.clientWidth);
    }

    const onRowChecked = (checked: boolean) => {
      context.emit('selectAll', checked);
    }


    onMounted(() => {
      initCellResize();
      initResizerEvent();
    });

    return {
      el,
      columnResizerEls,
      columnCellEls,
      columnGroups,
      onRowChecked,
    }

  },
})
</script>
<style lang="scss">

</style>

