<template>
  <div class = "radio-group-wrapper">
    <template v-for="(radioData, index) in radioGroupData" :key = "index">
      <div class = "radio-group-cell"
        :class = "{'selected' : radioData.selected}"
        @click.stop="onRadioClick(radioData)"
        >
        <template  v-if = "useSlot('body-slot')">
          <slot name = 'body-slot' v-bind="radioData"/>
        </template>
        <template v-else>
           <template v-if = "useRadioButton">
            <input type = "radio" :name = "radioData.name" :id = "radioData.value + '_id'"/>
          </template>
          <label class = "radio-group-label" :for = "radioData.value + '_id'"> {{ radioData.label }} </label>
        </template>
      </div>
    </template>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, PropType, ref, watch } from 'vue'
import { IRadioGroupData } from '@/interfaces';
import useContext from '@/composition/useContext';

export default defineComponent({
  name: 'radioGroupUi',
  emits: ['onSelected'],
  props: {
    datas: Array(Object) as PropType<IRadioGroupData[]>,
    useMultiSelect: {
      type: Boolean,
      default: false,
    },
    useRadioButton: {
      type: Boolean,
      default: true,
    }
  },
  setup(props, context) {
    const radioGroupData = ref([]);
    const { useSlot } = useContext(context);
    const onRadioClick = (selectedRatioData: IRadioGroupData) => {
      if (props.useMultiSelect === true) {
        selectedRatioData.selected = true;
      } else {
        radioGroupData.value.forEach((radioData) => {
          radioData.selected = radioData === selectedRatioData ? true : false;
        });
      }
      const selectedDatas = radioGroupData.value.filter((groupData) => groupData.selected === true);
      context.emit('onSelected', [...selectedDatas]);
    }

    onMounted(() => {
      watch(
        () => props.datas,
        () => {
          radioGroupData.value = [...props.datas];
        },
        { deep: true, immediate: true}
      )
    })

    return {
      useSlot,
      radioGroupData,
      onRadioClick,
    }
  },
})
</script>
<style lang="scss" scoped>
   .radio-group-wrapper {
    display:flex;
    align-items: center;
    justify-content: center;
    height:100%;
    .radio-group-cell {
      transition: 0.2s;
      //padding: 5px;
      display:flex;
      align-items: center;
      justify-content: center;
      // margin-right: 10px;
      cursor: pointer;
      font-size:14px;
      position: relative;
      color:#eee;

      input, label {
        cursor: pointer;
      }

      // &::after {
      //   content: ".";
      //   position: absolute;
      //   top:0px;
      // }

      &.selected {
        font-size:20px;
        .radio-group-label {
          color:#fff;
        }
        // ackground-color: rgb(112, 0, 197);

        &:hover{
          font-size:20px;
          // &::after {
          //   content: "..";
          //   position: absolute;
          //   top:15px;
          //   opacity: 1;
          // }
        }
      }

      &:hover {
        //min-width:150px;
        font-size:20px;

        // input[type="radio"] {
        //   width:25px;
        //   height:25px;
        //   position: relative;
        // }
      }

      .radio-group-label {
        color:#ccc;
      }
    }
  }
</style>
