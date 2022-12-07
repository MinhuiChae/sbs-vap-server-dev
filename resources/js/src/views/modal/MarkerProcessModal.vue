<!-- MarkerProcessModal -->
<template>
  <div class = 'confirm-wrapper'>
  <ModalUi
    ref = "modalComp"
    @closeAction="onCloseAction"
    >
    <template #header-slot>
      &nbsp; &nbsp; 알림
    </template>
    <template #body-slot>
      <div class = 'marker-progress-wrapper'>
        {{ markerProcessMessage }}
      </div>
      <div class ='marker-progress-progressbar-wrapper'>
        <ProgrssBar
          :percent = "percent"
         />
      </div>
    </template>
  </ModalUi>
  </div>
</template>
<script lang="ts">
import ModalUi from '@/components/ui/modal/Modal.vue';
import ProgrssBar from '@/components/ui/Progressbar.vue';
import { computed, defineComponent, reactive, ref } from 'vue'

export default defineComponent({
  components: { ModalUi, ProgrssBar },
  emits: ['closeAction', 'selectAction', 'acceptAction'],
  props: {
    percent: {
      type: Number,
      default: 0,
    }
  },
  setup(props, context) {
    const modalComp = ref<InstanceType<typeof ModalUi>>();
    const onCloseAction = () => {
      context.emit('closeAction');
    }

    const state = reactive({
      color: '0',
    })

    const markerProcessMessage = computed(() => {
      if(props.percent === 100) {
        return '마커 적용이 완료 되었습니다.';
      }

      return '마커를 적용하고 있습니다.';
    });

    const onCloseBtnClick = () => {
      modalComp.value.onCloseAction();
    }

    const onAcceptBtnClick = () => {
      // context.emit('selectAction', state.color);
      context.emit('acceptAction', state.color);
      onCloseBtnClick();
    }

    return {
      onCloseAction,
      onCloseBtnClick,
      onAcceptBtnClick,
      markerProcessMessage,
      modalComp,
    }
  },
})
</script>
<style lang="scss" scoped>
@import '@/scss/variables.scss';

.marker-progress-wrapper {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}

.marker-progress-progressbar-wrapper {
  display: flex;
  height: 50px;
}

.marker-footer-btns-wrapper {
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

.marker-select-wrapper {
  background-color: #490076;
  display: flex;
  /* width: 100%; */
  height: 100%;
  flex-direction: column;
  padding: 20px;
  margin: 30px;
  position: relative;
  box-sizing: border-box;
  border-radius: 5px;


  .marker-select-row {
    display: flex;
    height: 45px;
    align-items: center;

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
          opacity: 1;
          outline-style: solid;
          outline-width: 2px;
          // border: 3px solid #000;
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
      width: calc(100% - 200px);
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
}
</style>
