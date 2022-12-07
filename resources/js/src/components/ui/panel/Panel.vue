<template>
  <div :class = "getClassPrefix('panel-wrapper')" ref = "el">
    <div
      v-if = "useSlot('header-slot')"
      :class = "getClassPrefix('panel-header-wrapper')">
      <slot name = 'header-slot' />
    </div>
    <div :class = "getClassPrefix('panel-body-wrapper')">
      <slot name = 'body-slot' />
    </div>
    <div
      v-if = "useSlot('footer-slot')"
      :class = "getClassPrefix('panel-footer-wrapper')">
      <slot name = 'footer-slot' />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import useContext from '@/composition/useContext';
import useCssApi from '@/composition/useCssApi';

export default defineComponent({
  name:'panelUi',
  props: {
    cssPrefix: {
      type: String,
      default: '',
    },
    useFooter: {
      type: Boolean,
      default: false,
    },
    useHeader: {
      type: Boolean,
      default: false,
    }
  },
  setup(props, context) {
    const el = ref<HTMLDivElement>();
    const { useSlot } = useContext(context);
    const { getClassPrefix } = useCssApi(props.cssPrefix ?? '');

    onMounted(() => {
     //console.log('props.cssPrefix : ',props.cssPrefix);
    })

    return {
      el,
      getClassPrefix,
      useSlot,
    }
  },
})
</script>
<style lang="scss">

</style>
