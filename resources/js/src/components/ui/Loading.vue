<template>
  <div class = "loading">
    <LodingIcon />
    <div class = "loader-text">Loading</div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import LodingIcon from '@/icons/LoadingIcon.vue';

export default defineComponent({
  name:'comp-loading',
  components: {
    LodingIcon,
  },
  setup() {

  },
})
</script>
<style lang="scss" scoped>
.loading {
  position: absolute;
  display: flex;
  width: 100%;
  height: 100vh;
  align-items: center;
  justify-content: center;
  color:#fff;
  flex-direction: column;

  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  .loader-text {
    padding:10px;
  }
}

</style>
