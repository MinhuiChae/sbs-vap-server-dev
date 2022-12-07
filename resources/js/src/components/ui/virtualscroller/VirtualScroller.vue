<template>
  <div style='height:100%;overflow-y:auto' v-if ="items.length > 0">
    <DynamicScroller
      class="scroller"
      :items="state.drawDatas"
      :min-item-size="defaultItemHeight"
    >
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :size-dependencies="[
            item.contents,
          ]"
          :data-index="index"
          :data-active="active"
        >
          <template v-if = "useSlot('content-row-template')">
            <slot name = "content-row-template" v-bind = "{data:item, rowIndex: index}"/>
          </template>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>
<script lang="ts">
import useContext from '@/composition/useContext';
import { defineComponent, inject, onMounted, reactive, watch } from 'vue'

export default defineComponent({
  name: 'VirtualScrollerUi',
  props: {
    items: {
      type: Object,
    },
    defaultItemHeight: {
      type: Number,
    }
  },
  setup(props, context) {
    const { useSlot } = useContext(context);
    const state = reactive({
      drawDatas: props.items ?? inject("items"),
    });

    const drawDatas =
    onMounted(() => {
      watch(
        () => props.items,
        () => {
          state.drawDatas = props.items;
        }
      )
    })

    return {
      useSlot,
      state
    }
  },
})
</script>
<style lang="scss" scoped>
.scroller {
  height: 100%;
}
</style>
