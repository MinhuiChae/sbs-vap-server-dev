<template>
  <div class="w height-100">
    <div class ="header">
      header
    </div>
    <div class ="header flex-1 overflow-hidden " style="display:flex;flex-direction: column;position:relative"> <!-- 부보의 height 를 가져가게 만들어야 되는건가.. -->
      <div style="height:55px;">
        <table><tr><td>table Header</td></tr></table>
      </div>
      <div class = 'overflow-auto' style="height:200%;">
        <table>
          <tr v-for = "data in datas" :key ="data">
            <td>
              {{ data }}
            </td>
          </tr>
        </table>
      </div>
    </div>
    <div class ="header">
      footer
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  setup() {

    const datas = ref([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]);

    return {
      datas
    }
  },
})
</script>
<style lang="scss" scoped>
  .w {
    display:flex;
    background: red;
    flex-direction: column;
    overflow: hidden;
  }

  .height-100 { height: 100%; }

  .flex-1 {
    flex:1;
  }

  .display-none {
    display: none;
  }

  .overflow-hidden {
    overflow: hidden;
  }

  .overflow-auto {
    overflow: auto;
  }
</style>
