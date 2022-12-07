<!-- MarkerSelectModal -->
<template>
  <div class = 'confirm-wrapper'>
  <ModalUi
    ref = "modalComp"
    @closeAction="onCloseAction"
    >
    <template #header-slot>
      &nbsp; &nbsp; 마커 적용
    </template>
    <template #body-slot>
      <div class = 'marker-select-wrapper'>
        <div class ='marker-select-row'>
          <div class ='label'> 마커이름 </div>
          <div class ='item'> <input type ='text' v-model ="state.markerName" width = 100 class ='input-normal'/> </div>
        </div>
        <div class ='marker-select-row'>
          <div class ='label'> 마커 색상 </div>
          <div class ='item'>
            <div class ='flex-ul'>
              <RadioGroupUi
                :useRadioButton = "false"
                :datas = "radioGroupData"
                @onSelected = "onSelected"
              >
                <template #body-slot = "radioData">
                  <span class = 'marker-color' :class = "{'selected' : radioData.selected}" :style="{'background':radioData.value}" />
                </template>
              </RadioGroupUi>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #footer-slot>
      <div class ='marker-footer-btns-wrapper'>
        <div class ='button' @click.stop.prevent = "onAcceptBtnClick"> 적용 </div>
        <div class ='button' @click.stop.prevent = "onCloseBtnClick"> 취소 </div>
      </div>
    </template>
  </ModalUi>
  </div>
</template>
<script lang="ts">
import ModalUi from '@/components/ui/modal/Modal.vue';
import RadioGroupUi from '@/components/ui/radiogroup/RadioGroup.vue';
import { defineComponent, inject, onMounted, reactive, ref } from 'vue'

export default defineComponent({
  components: { ModalUi, RadioGroupUi },
  emits: ['closeAction', 'selectAction', 'acceptAction'],
  setup(props, context) {
    const _state = inject('state') as any;
    const modalComp = ref<InstanceType<typeof ModalUi>>();
    const onCloseAction = () => {
      context.emit('closeAction');
    }

    const state = reactive({
      color: '0',
      markerName: '',
    })
    const radioGroupData = [{
      label: '대사',
      name: '0',
      value: '#718637',
      selected: true,
    },{
      label: '자막',
      name: '1',
      value: '#D22C36',
      selected: false,
    },{
      label: '인물',
      name: '2',
      value: '#AF8BB1',
      selected: false,
    },{
      label: '오디오레벨',
      name: '3',
      value: '#E96F24',
      selected: false,
    },{
      label: '오디오레벨',
      name: '4',
      value: '#D0A12B',
      selected: false,
    },{
      label: '오디오레벨',
      name: '5',
      value: '#FFFFFF',
      selected: false,
    },{
      label: '오디오레벨',
      name: '6',
      value: '#428DFC',
      selected: false,
    },{
      label: '오디오레벨',
      name: '7',
      value: '#19F4D6',
      selected: false,
    }];

    const onCloseBtnClick = () => {
      modalComp.value.onCloseAction();
    }

    const onAcceptBtnClick = () => {
      // context.emit('selectAction', state.color);
      context.emit('acceptAction', state.color , state.markerName);
      onCloseBtnClick();
    }

    const onSelected = (selectedItem: any) => {
      state.color = selectedItem[0].name;
      const findColorIndex = radioGroupData.findIndex((data) => data.name === state.color);
      _state.selectedColor = findColorIndex === -1 ? 0 : findColorIndex;
      // console.log("selectedItem ", selectedItem[0].name);
      // context.emit('onSelected', selectedItem && selectedItem[0] ? selectedItem[0].name : '');
    }

    onMounted(() => {
      radioGroupData.forEach((data, i) => {
        if(i === _state.selectedColor) {
          data.selected = true;
        } else {
          data.selected = false;
        }
      });
    })

    return {
      radioGroupData,
      onCloseAction,
      onCloseBtnClick,
      onAcceptBtnClick,
      onSelected,
      modalComp,
      state,

    }
  },
})
</script>
<style lang="scss" scoped>
@import '@/scss/variables.scss';

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
  background-color: $popup-content-background-color;
  display: flex;
  /* width: 100%; */
  height: 100%;
  flex-direction: column;
  padding: 20px;
  // margin: 30px;
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

        &:first-child {
          margin: 5px 5px 5px 0px;
        }

        &.selected {
          opacity: 1;
         // outline-style: solid;
          // outline-width: 2px;
           border: 2px solid #fff;
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
