<template>
  <div class = 'closeBtn-button' :style = "Style">
    <span class ='close-line' />
    <span class ='close-line2' />
  </div>
</template>
<script lang="ts">
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name:'CloseBtnIcon',
  props: {
    width: {
      type: Number,
      default: 20,
    },
    height: {
      type: Number,
      default: 20,
    }
  },
  setup(props) {
    const Style = computed(() => {
      return {
        'width': `${props.width}px`,
        'height': `${props.height}px`
      }
    })

    return {
      Style
    }
  },
})
</script>
<style lang="scss" scoped>
  .close-line, .close-line2 {
    width:14px;
    height:2px;
    background-color: #fff;
    transition: all 0.2s;
    transform-origin: 50% 50%;
    position: absolute;
  }

  .closeBtn-button {
    // width:45px;
    // height:45px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0.8;
    &:hover {
      opacity: 1;
      .close-line {
        transform: rotate(45deg);
      }

      .close-line2 {
        transform: rotate(-45deg);
      }

    }
  }
</style>
