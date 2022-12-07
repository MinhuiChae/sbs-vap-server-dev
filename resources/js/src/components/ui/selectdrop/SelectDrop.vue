<!--
  # Select Drop Menu
  ## 1. window size direction
-->
<template>
  <div ref ="el"
    tabindex="-1"
    @keyup.esc.passive = "onDropMenu($evt, false)"
    @keydown.down.enter.up="onKeyDownInInput"
    @blur="onBlurDropMenu"
    :class ="getClassPrefix('select-drop-btn-wrapper')">
    <div class ="select-drop-btn-info-wrapper"
      ref = "selectEl"
      @click="onDropMenu"
      @mousedown.prevent=""
      >
      <div class ="select-icon"
        :class = "getDropArrowClass"

      >
        <DropDownArrowIcon :width="12" :height="12"/>
      </div>
      <template v-if = "useEditable">
        <input class = 'input-text'
          ref = 'inputEl'
          type ='text'
          tabindex="0"
          :value = "getCurrentValue"
          @blur="onBlurDropMenu"
          @input = "onInputText($event.target.value)"
        />
      </template>
      <template v-else>
        <div class = 'select-label'>
          {{ selectedItem }}
        </div>
      </template>
    </div>
    <div ref = "menuEl"
      class ="select-drop-btn-menu-wrapper"
      :class = "itemListBoxClass"
      :style = "getMenuStyle()"
      v-show = "state.isShowDropMenu && items.length > 0">
      <slot name = "menu-layout-slot">
        <ul class ="select-drop-btn-menu-item-wrapper" @mousedown.prevent="">
          <template v-if = "getFilterItems.length > 0">
            <li
              :class = getItemClass(item)
              v-for="item in getFilterItems" :key = "item"
              @click = "onMenuItemSelect(item)"

              >
              <slot name ="slot-item" v-bind="item">
                <span class = 'item-label'>{{ item.label }} </span>
              </slot>
            </li>
          </template>
          <template v-else>
            <li :class = getItemClass()
            >
              <span class = 'item-empty-label'> Nothing found </span>
            </li>
          </template>
        </ul>
      </slot>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, nextTick, onMounted, onUnmounted, PropType, reactive, ref, SetupContext, watch } from 'vue'
import { ISelectDropItemOpt } from '@/interfaces';
import DropDownArrowIcon from '@/components/icons/dropDownArrowIcon.vue';
import useCssApi from '@/composition/useCssApi';
import { ESelectDirection, ESelectKeyPress } from '@/enums';

export default defineComponent({
  name:'SelectDropUi',
  emits:['onSelectItem'],
  components:{
    DropDownArrowIcon,
  },
  props: {
    cssPrefix: {
      type: String,
      default: '',
    },
    items: {
      type: Array as PropType<ISelectDropItemOpt[]>,
      default: [] as PropType<ISelectDropItemOpt[]>,
    },
    defaultSelectLabel: {
      type: String,
      default: '선택 해 주세요.',
    },
    useMultiSelect: {
      type: Boolean,
      default: false,
    },
    useSelectAfterClose: {
      type: Boolean,
      default: true,
    },
    useRelation: {
      type: Boolean,
      default: false,
    },
    itemHeight: {
      type: String,
      default: '',
    },
    itemListBoxClass: {
      type: String,
      default : '',
    },
    itemClass: {
      type: Array as PropType<Array<any>>,
      default: [] as PropType<Array<any>>,
    },
    itemTopMargin: {
      type: Number,
      default: 0,
    },
    direction: {
      type: String as PropType<ESelectDirection>,
      default: ESelectDirection.Bottom,
    },
    useEditable: {
      type: Boolean,
      default: false,
    },
    useKeyEvent: {
      type: Boolean,
      default: true,
    },
    listMargin: {
      type: Number,
      default: 5,
    }
  },
  setup(props, context: SetupContext) {
    const el = ref<HTMLDivElement>();
    const selectEl = ref<HTMLDivElement>();
    const menuEl = ref<HTMLDivElement>();
    const inputEl = ref<HTMLInputElement>();
    const { getClassPrefix } = useCssApi(props.cssPrefix ?? '');

    const state = reactive({
      minHeight: 100,
      direction: props.direction,
      isShowDropMenu: false,
      items: [] as ISelectDropItemOpt[],
      selectedItems: [] as ISelectDropItemOpt[],
      filterValue: '',
      isUpdate: false,
      activeItem: null as ISelectDropItemOpt,
      lastedActiveItem: null as ISelectDropItemOpt,
    })

    const selectedItem = computed(() => {
      if (state.selectedItems.length > 0) {
        // multi 선택인경우 표시 방법이 필요
        if (props.useMultiSelect === true) {
          return state.selectedItems.length > 1 ? `${state.selectedItems.length} Selected` : state.selectedItems[0].label;
        }
        return state.selectedItems[0].label;
      } else {
        return props.defaultSelectLabel;
      }
    });

    const getItemClass = computed(() => (item: any) => {
      const cssList = [];
      props.itemClass.length > 0 ? cssList.push(...props.itemClass) : cssList.push('select-drop-btn-menu-item');
      item?.selected === true ? cssList.push('selected') : '';
      item?.id === state.activeItem?.id ? cssList.push('active') : '';
      return cssList;
    });

    const getDropArrowClass = computed(() => {
      let arrowClass = [];
      if ( state.isShowDropMenu && getFilterItems.value.length > 0) {
        arrowClass.push(state.direction === ESelectDirection.Top ? 'rotate-[-90deg]' : 'rotate-90');
      }
      return arrowClass;
    })

    const getCurrentValue = computed(() => state.filterValue === '' && state.isUpdate === false ? selectedItem.value : state.filterValue);

    const initActiveItem = (): ISelectDropItemOpt =>  state.activeItem = null;
    const initSelectedItem = (): ISelectDropItemOpt[] => state.selectedItems = state.items.filter((item) => item.selected === true);
    const initItem = () => state.items = props.useRelation === true ? props.items : JSON.parse(JSON.stringify(props.items));
    const init = () => {
      initItem()
      initSelectedItem();
      initActiveItem();
    }

    const getDirectionStyle = {
      'top': (elRect: DOMRect): object => getDirectionTopStyle(elRect),
      'replace': (elRect: DOMRect): object => getDirectionReplaceStyle(elRect),
      'bottom': (elRect: DOMRect): object => getDirectionBottomStyle(elRect),
    };

    const getDirectionTopStyle = (elRect: DOMRect): object => {
      const bottom = innerHeight - elRect.top  +  (Number(props.itemTopMargin)) - window.scrollY;
      // const bottom = innerHeight - elRect.top - window.scrollY + Number(props.itemTopMargin);
      // const maxHeight = elRect.top + window.scrollY - Number(props.itemTopMargin);
      const maxHeight = elRect.top - 2 * props.listMargin;
      return {
        bottom: `${bottom}px`,
        maxHeight: `${maxHeight}px`,
      }
    }

    const getDirectionReplaceStyle = (elRect: DOMRect): object => {
      // const maxHeight = document.body.scrollHeight - elRect.top - window.scrollY - Number(props.itemTopMargin);
      const maxHeight = document.body.scrollHeight - elRect.top  - Number(props.itemTopMargin);
      return {
        maxHeight: `${maxHeight}px`,
      }
    }

    const getDirectionBottomStyle = (elRect: DOMRect): object => {
      // const maxHeight = document.body.scrollHeight - elRect.bottom - window.scrollY - Number(props.itemTopMargin);
      const maxHeight = window.innerHeight - elRect.bottom - (Number(props.itemTopMargin)) - props.listMargin;
      const top = window.scrollY + elRect.top + elRect.height + Number(props.itemTopMargin);
      return {
        maxHeight: `${maxHeight}px`,
        top: `${top}px`,
      }
    }

    const getMenuStyle = (): object => {
      if (state.isShowDropMenu === false) return {};
      const elRect = el.value?.getBoundingClientRect();
      const styleList = {
        position: 'absolute',
        width: elRect?.width ? `${elRect?.width}px` : 'auto',
        height: props.itemHeight === '' ? 'auto': props.itemHeight,
        left: `${elRect.left}px`,
      }

      if (state.direction === ESelectDirection.Bottom) {
        if (window.innerHeight - elRect.bottom < state.minHeight ) {
          state.direction = ESelectDirection.Top;
        }
      } else {
        if (window.innerHeight - elRect.bottom > state.minHeight ) {
          state.direction = ESelectDirection.Bottom;
        }
      }

      return Object.assign(styleList, getDirectionStyle[state.direction as ESelectDirection](elRect));
    };

    const getFilterItems = computed(() =>
      state.filterValue === ''
      ? state.items
      : state.items.filter((item) =>
        item.label
        .toLowerCase()
        .replace(/\s+/g,'')
        .includes(state.filterValue.toLowerCase().replace(/\s+/g,''))
      )
    );

    const outerClick = (e: MouseEvent | FocusEvent) => {
      if (!el.value.contains(e.target as Node))  {
        hideDropMenu('outer');
      }

      if (props.useSelectAfterClose === true && state.isShowDropMenu === true) {
        if (menuEl.value.contains(e.target as Node) && (e.target as HTMLElement).tagName.toLowerCase() !== 'input')  {
          hideDropMenu('outer');
        }
      }
    }

    const onBlurDropMenu = (e: MouseEvent) => {
      if (props.useEditable === false) {
        hideDropMenu('outer');
      } else if (e.target === inputEl.value) { // input의 blur 처리만
        hideDropMenu('outer');
      }
    }

    const onDropMenu = (evt: MouseEvent, flag?: boolean) => {
      if(state.isShowDropMenu === true && props.useEditable === true && (evt.target as HTMLElement).tagName.toLowerCase() === 'input') {
        return true;
      }

      if (flag === undefined) {
        state.isShowDropMenu === false ? showDropMenu() : hideDropMenu();
      } else {
        flag === true ? showDropMenu() : hideDropMenu();
      }
    }

    // eslint-disable-next-line vue/valid-next-tick
    const focusInput = () => nextTick(()=>inputEl.value?.focus());

    const hideDropMenu = (type?: string) => {
      state.isShowDropMenu = false;
      state.isUpdate = false;
      state.activeItem = null;
      state.filterValue = '';
      if (type !== 'outer') focusInput();
      else {
        // el.value.focus();
      }
      document.removeEventListener('click', outerClick);
    }

    const showDropMenu = (force: boolean = false) => {
      if (force && (state.items.length === 0 || state.isShowDropMenu === true || (props.useEditable && state.isUpdate === false))) return;
      state.isShowDropMenu = true;
      if (props.useEditable === true) focusInput();
      else {
        el.value.focus();
      }
      document.addEventListener('click', outerClick);
    }

    const onMenuItemSelect = (item: ISelectDropItemOpt) => {
      if (props.useMultiSelect === false) {
        if (item?.selected === false) {
          state.selectedItems.forEach((selectedItem) => selectedItem.selected = false);
          if (props.useRelation === false) {
            state.selectedItems = [item];
          }
          item.selected = true;
        }
      } else if (item) {
        item.selected = !item.selected;
        if (props.useRelation === false) {
          if (item.selected === true) state.selectedItems.push(item);
          else {
            state.selectedItems.splice(state.selectedItems.findIndex((selectedItem) => selectedItem.id === item.id), 1);
          }
        }
      }
      if (props.useSelectAfterClose === true) hideDropMenu();
      context.emit('onSelectItem', state.selectedItems);
    }

    const onInputText = (value: any) => {
      state.filterValue = value;
      state.isUpdate = true;
      showDropMenu();
    }

    const actionKeyPress = {
      'Enter': () => onMenuItemSelect(state.activeItem),
      'ArrowDown': (position: number) => doActionArrowDownKeyPress(position),
      'ArrowUp': (position: number) => doActionArrowUpKeyPress(position),
    }

    const doActionArrowDownKeyPress = (position: number) => {
      const adjustPosition = position === -1 ? 0 : (position >= getFilterItems.value.length - 1 ? position : position +1);
      state.activeItem = getFilterItems.value[adjustPosition];
    }

    const doActionArrowUpKeyPress = (position: number) => {
      const adjustPosition = position === -1 ? 0 : (position <= 0 ? position : position - 1);
      state.activeItem = getFilterItems.value[adjustPosition];
    }

    const onKeyDownInInput = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation();
      if (props.useKeyEvent === false) return;
      if (state.isShowDropMenu === false && e.key !== ESelectKeyPress.Enter){
        showDropMenu();
      } else {
        if (state.activeItem === null) state.activeItem = state.selectedItems[state.selectedItems.length -1];
        actionKeyPress[e.key as ESelectKeyPress] ? actionKeyPress[e.key as ESelectKeyPress](getFilterItems.value.findIndex((item) => item.id === state.activeItem?.id)):'';
      }
    }

    onUnmounted(() => document.removeEventListener('click', outerClick));
    onMounted(() => {
      init();
      watch(
        () => props.items,
        () => init(),
        {deep: true}
      )
    })

    return {
      el,
      selectEl,
      menuEl,
      inputEl,
      state,
      selectedItem,
      getClassPrefix,
      getMenuStyle,
      getDropArrowClass,
      getItemClass,
      getFilterItems,
      getCurrentValue,
      onKeyDownInInput,
      onDropMenu,
      onMenuItemSelect,
      onInputText,
      onBlurDropMenu,
    }
  },
})
</script>
<style lang="scss">

.select-drop-btn-wrapper {
  display: flex;
  height: 40px;
  cursor: pointer;
  // position: relative;
  user-select: none;
  outline: none;
  // padding: 0px 10px;
  // border:1px solid #e2e2e2;
  background-color: #e2e2e2;
  flex-direction: column;

  .select-drop-btn-info-wrapper {
    display: flex;
    align-items: center;
    height: 100%;
    width:100%;

    .input-text {
      width:100%;
      height:100%;
      outline: none;
      background-color: transparent;
      padding:0;
      margin:0;
      border:0;
      color:#fff;
      // font-size: 1.2rem;
    }

    .select-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width:40px;
      height:40px;
      transition: 0.2s;
      fill:#fff;
    }

    .select-label {
      // font-size:0.8rem;
      flex:1;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }

  .select-drop-btn-menu-wrapper {
    display: flex;
    // margin-top:5px;
    // border-width: 1px;
    // border-style: solid;
    // border-color: #e2e2e2;
    width:100%;
    z-index: 50;
    overflow-y: auto;

    .select-drop-btn-menu-item-wrapper {
      width:100%;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      height:100%;
      margin:0;
      padding:0;

      .select-drop-btn-menu-item {
        min-height:2.4rem;
        display: flex;
        align-items: center;
        width:100%;
        text-indent: 0.5rem;
        background-color: #444;

        .item-label, .item-empty-label {
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        .item-empty-label {
          display: flex;
          align-items: center;
          justify-items: center;
        }

        &:hover, &.selected, &.active {
          background-color: #000;
        }
      }
    }
  }
}
</style>
