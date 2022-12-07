<template>
  <div class = 'progessbar-wrapper' ref = 'el'>
    <div class = 'progressbar-percent' ref = 'percentEl' :style = "{width: state.gerPercent +'%'}">

    </div>
    <div class = 'progressbar-percent-txt-wrapper'> <span class ='progressbar-percent-txt'>{{state.gerPercent}}% </span></div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue'

export default defineComponent({
  name: 'ProgrssBar-Ui',
  props: {
    percent: {
      type: Number,
      default: 0,
    }
  },
  setup(props) {

    const el = ref<HTMLDivElement>();
    const percentEl = ref<HTMLDivElement>();

    const state = reactive({
      gerPercent: computed(() => props.percent > 100 ? 100 : props.percent ),
    });

    onMounted(() => {
      const elRect = el.value?.getBoundingClientRect();
      const width = elRect?.width ?? 0;
      console.log("width >", width);
    })

    return {
      state,
      el,
      percentEl,
    }
  },
})
</script>
<style lang="scss" scoped>
  .progessbar-wrapper {
    display: flex;
    background-color: transparent;
    flex:1;
    justify-content: flex-start;
    border-radius: 5px;
    position: relative;
    background: #3f007255;

    .progressbar-percent {
      transition: 0.5s;
      border-radius: 5px;
      background-color: #3f0072;
    }

    .progressbar-percent-txt-wrapper{
      position: absolute;
      flex:1;
      display: flex;
      align-items: center;
      justify-content: center;
      height:100%;
      width:100%;
      font-size:5vh;

      .progressbar-percent-txt {
        width: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
</style>
