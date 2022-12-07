<template>
  <template v-if = "useTable">
    <table class = "table-content-wrapper" ref = 'el' :style = "style">
      <colgroup>
        <col v-for = "(column, index) in columns" :key = "index"
          :aria-colname = "column.name"
          :style = "{'width': column.width}"
          ref = "columnGroups"
        />
      </colgroup>
      <tbody>
        <!-- Row Data 그리기 -->
        <template v-if = "rowDatas.length > 0">
          <slot name = 'content-row-template' v-bind = "rowDatas">
            <tr class = "table-row"
              v-for = "(rowData, rowIndex) in rowDatas" :key = "rowIndex"
              @click.stop.prevent = "onRowClick(rowData)"
              :class = "rowData.rowCls ?? ''"
              >
              <td v-for = "(column, index) in columns" :key = "index">
                <div class = 'table-cell-inner' :aria-colname = "column.name">
                  <div class = 'table-cell-inner-content'>
                    <template v-if = "column.type === 'checkbox'">
                      <input type = "checkbox"

                        :checked = "rowData.isChecked"
                        @click.stop = ""
                        @change = "onRowChecked(rowData, $event.target.checked)"
                      />
                    </template>

                    <template v-else-if = "column.type === 'number'">
                      {{ rowData.rowNumber }}
                    </template>
                    <template v-else>
                      <slot :name="column.name+'_cell-slot'" v-bind = "rowData" >
                        {{ rowData.hasOwnProperty(column.dataIndex) ? rowData[column.dataIndex] : '' }}
                      </slot>
                    </template>
                  </div>
                </div>
              </td>
            </tr>
          </slot>
        </template>
      </tbody>
    </table>
  </template>
  <template v-else>
    <slot name = 'content-table-template' v-bind = "{datas: rowDatas}" />
  </template>
</template>
<script lang="ts">
import { IColumn, IColumnResizeEventInfo } from '@/interfaces/ui'
import { defineComponent, nextTick, onMounted, PropType, reactive, ref, watch } from 'vue'

export default defineComponent({
  name: 'GridContentTableUi',
  emits: ["hasBodyTableScroll", "onRowDblClick", "onRowClick", "onRowChecked"],
  props: {
    rowDatas: {
      type: Array(Object),
      default: [],
    },
    columns: {
      type: Array(Object) as PropType<IColumn[]>,
      default: [],
    },
    changeColumnInfo: {
      type: Object as PropType<IColumnResizeEventInfo>,
    },
    useTable: {
      type: Boolean,
      default: true,
    },
    style: {
      type: Object,
      default : {}
    }
  },
  setup(props, context) {

    const el = ref<HTMLElement>();
    const columnGroups = ref<HTMLElement[]>([]);
    const state = reactive({
      clickCount: 0,
      clickDelay: 200,
      clickTimer : null,
      isInitRowData: false,
    })

    const changeCoumnSize = () => {
      const findColName = props.changeColumnInfo.name;
      const findCol = Array.from(columnGroups.value).find((gorup: HTMLElement) => gorup.getAttribute('aria-colname') === findColName);
      if (findCol) {
        findCol.style.width = `${props.changeColumnInfo.width}px`;
      }
      // console.log('getTableScroll: ', getTableScroll);
    }

    const getTableScroll = () => {
      if (el.value?.parentElement) {
        return el.value.parentElement.offsetWidth - el.value.parentElement.clientWidth;
      }
      return 0;
    };

    const onRowClick = (rowData: any) => {
      // console.log('state.clickCount ',state.clickCount );
      state.clickCount++;

      if (state.clickCount%2 === 1) {
        state.clickTimer = setTimeout(() => {
          state.clickCount = 0;
          context.emit('onRowClick', rowData);
        }, state.clickDelay);
      } else {
        clearTimeout(state.clickTimer);
        state.clickCount = 0;
        context.emit('onRowDblClick', rowData);
      }
    }

    const onRowChecked = (rowData: any, checked: boolean) => {
      rowData.isChecked = checked;
      context.emit('onRowChecked', rowData);
    }

    const updateBodyTableScroll = () => {
      context.emit('hasBodyTableScroll', getTableScroll());
    }

    onMounted(() => {
      // const scrollbarWidth = el.value.parentElement.offsetWidth - el.value.parentElement.clientWidth;
      // context.emit('hasBodyTableScroll', scrollbarWidth);

      watch(
        () => props.changeColumnInfo,
        () => {
          changeCoumnSize();
        },
        {deep: true}
      )

      watch(
        () => props.rowDatas,
        () => {
          nextTick(() =>  {
            if (state.isInitRowData === false) {
              updateBodyTableScroll();
            }
            state.isInitRowData = true;
          });
        }, {
          immediate: true,
        }
      )
    })
    return {
      el,
      columnGroups,
      onRowClick,
      onRowChecked,
      updateBodyTableScroll,
    }
  },
})
</script>

