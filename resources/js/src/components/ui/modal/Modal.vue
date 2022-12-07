<template>
  <div ref = 'el' :class = "getClassPrefix('modal-ui-background-wrapper')"
  @click.stop = "onOuterClick" v-if="state.destoried">
    <div class = 'modal-ui-background' />

    <PanelUi class = 'modal-ui-content-panel show'
        :style = "{'width':width + 'px'}"
       >

      <template #header-slot="data">
        <div class = 'modal-ui-close-btn-wrapper' @click.stop.prevent="onCloseAction">
          <CloseBtnIcon />
        </div>
        <slot name = "header-slot" v-bind="data"/>
      </template>
      <template #body-slot="data">
        <slot name = "body-slot" v-bind="data"/>
      </template>
      <template #footer-slot="data">
        <slot name = "footer-slot" v-bind="data"/>
      </template>
    </PanelUi>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from 'vue'
import useCssApi from '@/composition/useCssApi';
import PanelUi from '@/components/ui/panel/Panel.vue';
import CloseBtnIcon from '@/components/icons/closeBtnIcon.vue';

export default defineComponent({
  name:'ModalUi',
  components: { PanelUi, CloseBtnIcon },
  emits:['onOuterClick', 'closeAction'],
  props: {
    cssPrefix: {
      type: String,
      default: '',
    },
    modalAction: {
      type: String,
      default : 'close',
    },
    useOuterClose: {
      type: Boolean,
      default: false,
    },
    width: {
      type: Number,
    },
  },
  setup(props, context) {
    const el = ref<HTMLDivElement>();
    const { getClassPrefix } = useCssApi(props.cssPrefix ?? '');
    const state = reactive({
      destoried: true,
    })

    const onOuterClick = () => {
      if (props.useOuterClose === true) {
        onCloseAction();
      } else {
        context.emit('onOuterClick');
      }
    }

    const onCloseAction = () => {
      el.value.classList.add('hide');
      doDestroy('closeAction');
    }

    const doDestroy = (emitStr: 'onOuterClick' | 'closeAction') => {
      setTimeout(()=> {
        context.emit(emitStr);
        state.destoried = false;
      },200);
    }

    onMounted(()=> {
      setTimeout( async() => {
        el.value.classList.add('show');
      })
    })

    return {
      getClassPrefix,
      onOuterClick,
      onCloseAction,
      state,
      el
    }
  },
})
</script>
