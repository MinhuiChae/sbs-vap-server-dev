<template>
  <div ref ="el" class ="confirm-wrapper">
    <ModalUi ref = "modalEl"
      :cssPrefix = "cssPrefix"
      :useOuterClose = "useOuterClose"
      @closeAction = "closeAction"
    >
      <template #header-slot>
        <div class = 'confirm-header'>
          <AttentionMarkAniIcon :width ="40" :height = "40" class ='confirmIcon'/>
        </div>
      </template>
      <template #body-slot>
        <div class = 'confirm-body'>
          <div class = 'confirm-content'>
            {{ state.message }}
          </div>
        </div>
        <div class = 'confirm-desp'>
          {{ state.desp }}
        </div>
      </template>

      <template #footer-slot>
        <div class ='footer-wrapper'>
        <slot name = 'btns' >
          <button v-for = "btn in state.btns"
          :key="btn.id"
          :class ="btn.type" @click.stop.prevent = "onBtnClick(btn)" @mousedown.stop>
            {{ btn.text }}
          </button>
        </slot>
      </div>
      </template>

    </ModalUi>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import ModalUi from '@/components/ui/modal/Modal.vue';
import AttentionMarkAniIcon from '@/components/icons/attentionMarkAniIcon.vue';

export default defineComponent({
  name: 'ConfirmModalUi',
  emits:['onOuterClick', 'closeAction'],
  components: { ModalUi, AttentionMarkAniIcon },
  props: {
    cssPrefix: {
      type: String,
      default: '',
    },
    btns: {
      type: Array(Object),
      default: [],
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
    message: {
      type: String,
      default: '',
    },
    desp: {
      type: String,
      default: '',
    }
  },
  setup(props, context) {
    const el = ref<HTMLElement>();
    const modalEl = ref<InstanceType<typeof ModalUi>>();
    const state = reactive({
      //modalAction: props.modalAction,
      // useOuterClose: props.useOuterClose,
      btns: props.btns,
      message: props.message,
      desp: props.desp,
    });

    const updateShowMessage = () => {
      setTimeout(() => {
        // el.value.classList.add('emphasize');
        state.message = props.message;
      },200);
    }

    const closeAction = () => {
      context.emit('closeAction');
    }

    const onBtnClick = (btn) => {
      if (btn.onClickAction && btn.onClickAction instanceof Function) {
        btn.onClickAction();
      }

      if (btn?.onclickCloseAction) {
        modalEl.value.onCloseAction();
      }
    }

    onMounted(() => {
      updateShowMessage();
      watch(
        () => props.message,
        () => {
          updateShowMessage();
        },
        { deep: true }
      )
    })

    return {
      el,
      modalEl,
      state,
      closeAction,
      onBtnClick,
    }
  },
})
</script>
<style lang="scss" scoped>
  .confirm-header {
    padding-left:10px;
    display: flex;
    align-items: center;
    font-size:1.4rem;
  }
</style>
