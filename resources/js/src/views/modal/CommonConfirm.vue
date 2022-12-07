<template>
  <div class = 'confirm-wrapper'>
    <ConfirmModalUi
      ref = "modalComp"
      :useOuterClose="true"
      :width = "500"
      :message = "state.confirmMessage"
      :desp = "state.confirmDesp"
      @closeAction = "onCloseAction"
      :btns="confirmBtns"
      >
    </ConfirmModalUi>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import ConfirmModalUi from '@/components/ui/confirm/Confirm.vue';


export default defineComponent({
  name: 'CommonConfirmModal',
  emits: ['closeAction', 'onOkAction'],
  components: {
    ConfirmModalUi,
  },
  props: {
    confirmMessage: {
      type: String,
      default: 'Please Confirm Message',
    },
    confirmDesp: {
      type: String,
      default: '',
    }
  },
  setup(props, context) {
    const modalComp = ref<InstanceType<typeof ConfirmModalUi>>();
    const onCloseAction = () => context.emit('closeAction');

    const state = reactive({
      groupName: '',
      confirmMessage: props.confirmMessage,
      confirmDesp: props.confirmDesp
    })

    const doOkAction = () =>  {
      console.log(state);
      context.emit('onOkAction', '');
    }

    const confirmBtns = [{
      type: "ok",
      text: '예',
      onClickAction: () => {
        doOkAction();
      },
      onclickCloseAction: true,
      // beforeClickAction: onBeforeDeleteLayer,
    },{
      type: "",
      text: "아니요",
      onclickCloseAction: true,
    }];

    const onAcceptBtnClick = () => {

    }

    const onCloseBtnClick = () => {
      modalComp.value.onCloseAction();
    }

    onMounted(() => {
      watch(
        () => props.confirmMessage,
        () => state.confirmMessage = props.confirmMessage
      )

      watch(
        () => props.confirmDesp,
        () => state.confirmDesp = props.confirmDesp
      )
    })

    return {
      state,
      modalComp,
      onCloseAction,
      onAcceptBtnClick,
      onCloseBtnClick,
      confirmBtns
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
    margin: 20px;

    .flex-ul {
      display: flex;

      .marker-color {
        align-items: center;
        display: flex;
        // padding:10px;
        width: 30px;
        height: 30px;
        border-radius: 5px;
        margin:5px;
        opacity: 0.6;
        transition: opacity 0.5s;

        &.selected {
          // opacity: 1;
          // outline-style: solid;
          // outline-width: 2px;
          border: 3px solid #000;
          -webkit-box-shadow: 0 0 20px #fff;
          -moz-box-shadow: 0 0 20px #fff;
          box-shadow: 0 0 20px #fff;
        }


        &:first-child {
         // margin:5px 5px 5px 0px;
        }

        &:hover {
          cursor: pointer;
          opacity: 1;
        }
      }
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
      width:100%;
    }
  }
</style>
