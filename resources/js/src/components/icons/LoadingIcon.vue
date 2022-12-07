<template>
  <div class = "loader"></div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  setup() {

  },
})
</script>
<style lang="scss" scoped>
  .loader {
    width: 48px;
    height: 48px;
    display: inline-block;
    position: relative;
  }
  .loader::after,
  .loader::before {
    content: '';
    box-sizing: border-box;
    width: 48px;
    height: 48px;
    border: 2px solid #FFF;
    position: absolute;
    left: 0;
    top: 0;
    animation: rotationBreak 3s ease-in-out infinite alternate;
  }

  .loader::after {
    border-color: #FF3D00;
    animation-direction: alternate-reverse;
  }

  .loader-text {
    padding:10px;
  }

  @keyframes rotationBreak {
    0% {
      transform: rotate(0);
    }
    25% {
      transform: rotate(90deg);
    }
    50% {
      transform: rotate(180deg);
    }
    75% {
      transform: rotate(270deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
