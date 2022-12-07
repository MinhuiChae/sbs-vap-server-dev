<template>
  <div class = 'confirm-wrapper'>
    <ModalUi
      ref = "modalComp"
      @closeAction="onCloseAction"
      >
      <template #header-slot>
        &nbsp; &nbsp; 선택 그룹 수정
      </template>
      <template #body-slot>
        <div class ='marker-select-row'>
          <div class ='label'> 그룹이름 </div>
          <div class ='item'> <input type ='text' :placeholder="state.groupName" @focus="onInputFocus" v-model ="state.groupName" class ='input-normal'/> </div>
          <div class = 'msg emphasize'> <div class = 'confirm-body' :data-message = "state.invalidMsg" v-if = "state.invalidMsg"></div></div>
        </div>
      </template>
      <template #footer-slot>
        <div class ='footer-btns-wrapper'>
          <div class ='button' @click.stop.prevent = "onAcceptBtnClick"> 적용 </div>
          <div class ='button' @click.stop.prevent = "onCloseBtnClick"> 취소 </div>
        </div>
     </template>
    </ModalUi>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import ModalUi from '@/components/ui/modal/Modal.vue';
import { propsToAttrMap } from '@vue/shared';

export default defineComponent({
  name: 'groupAddModal',
  emits: ['closeAction', 'acceptAction'],
  components: {
    ModalUi,
  },
  props: {
    closed: {
      type: Boolean,
      default: false,
    },
    selectedGroupForUpdate: {
      type: Object,
      default: ''
    }
  },
  setup(props, context) {
    const modalComp = ref<InstanceType<typeof ModalUi>>();
    const onCloseAction = () => context.emit('closeAction');

    const state = reactive({
      groupName: props.selectedGroupForUpdate[0]?.name,
      invalidMsg: '',
    })

    const onAcceptBtnClick = () => {
      if (!state.groupName.trim()) {
        state.invalidMsg = '그룹 이름을 입력해 주세요';
        return;
      }
      context.emit('acceptAction', state.groupName);
    }

    const onInputFocus = () => {
      state.invalidMsg = "";
    }

    const onCloseBtnClick = () => {
      modalComp.value.onCloseAction();
    }

    onMounted(()=> {
      watch(
        () => props.closed,
        () => {
          if(props.closed) {
            onCloseBtnClick();
          }
        }
      )
    })

    return {
      state,
      modalComp,
      onCloseAction,
      onAcceptBtnClick,
      onCloseBtnClick,
      onInputFocus,
    }
  },
})
</script>
<style lang="scss" scoped>
@import '@/scss/variables.scss';
  .footer-btns-wrapper {
    height:55px;
    display: flex;
    width:100%;
    .button {
      flex:1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: 0.2s;
      &:hover {
        background-color: $base-dark-color;
      }
    }
  }

  .marker-select-row {
    display: flex;
    height: 45px;
    align-items: center;
    margin-bottom: 10px;
    position: relative;

    .msg {
      position: absolute;
      bottom: 0;
      bottom: -10px;
      left: 10px;
      width:100%;
    }

    .label {
      width: 100px
    }

    .item {
      padding-right: 10px;
      // width: calc(100% - 100px);
    }

    .input-normal {
      border:1px solid #999;
      background: transparent;
      border-radius: 5px;
      padding: 5px 10px;
      text-indent: 5px;
      height: 35px;
      color: #e2e2e2;
      font-size: 1.2em;
    }
  }
</style>
