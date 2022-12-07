<template>
  <div class ='loader'>
    <div>
      <div class ='dot'></div>
      <div class ='dot'></div>
      <div class ='dot'></div>
      <div class ='dot'></div>
      <div class ='dot'></div>
    </div>
    <div>
      <div class = 'text'> {{ text }} </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    text: {
      type: String,
      default: "로딩 중입니다."
    }
  },
  setup() {

  },
})
</script>
<style lang="scss" scoped>
.loader {
  display: flex;
  position: absolute;
  align-items: center;
  justify-content: center;
  width:100%;
  height:100%;
  flex-direction: column;
  //top: 50%;
  //left: 40%;
  //margin-left: 10%;
  //transform: translate3d(-50%, -50%, 0);

  .text {
    display: flex;
    width:100%;
    height:100%;
    align-items: center;
    padding:5px;
    justify-content: center;
  }
}
.dot {
  width: 24px;
  height: 24px;
  background: rgb(78, 115, 125);
  border-radius: 100%;
  display: inline-block;
  animation: slide 1s infinite;
}
.dot:nth-child(1) {
  animation-delay: 0.1s;
  background: #4b007c;
}
.dot:nth-child(2) {
  animation-delay: 0.2s;
  background: #6400a6;
}
.dot:nth-child(3) {
  animation-delay: 0.3s;
  background: #7400c2;
}
.dot:nth-child(4) {
  animation-delay: 0.4s;
  background: #8a00e6;
}
.dot:nth-child(5) {
  animation-delay: 0.5s;
  background: #a41bff;
}
@-moz-keyframes slide {
  0% {
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(2);
  }
  100% {
    transform: scale(1);
  }
}
@-webkit-keyframes slide {
  0% {
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(2);
  }
  100% {
    transform: scale(1);
  }
}
@-o-keyframes slide {
  0% {
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(2);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes slide {
  0% {
    transform: scale(1);
  }
  50% {
    opacity: 0.3;
    transform: scale(2);
  }
  100% {
    transform: scale(1);
  }
}
</style>
