
<!-- App vue -->
<template>
  <router-view v-slot="{Component}">
    <!-- Use any custom transition and fallback to `fade` -->
    <component :is="Component"
      :extractPercent = "extractPercent"
      />
  </router-view>
  <template v-if ="state.isMounted">
    <component :is="Teleport" to="body">
      <Modal v-if = "state.showPopupMessage"
      :useOuterClose="true"
      @closeAction="onPopupClose"
      class = "messagePopup"
      >
        <template #header-slot>
          <span class ='popup-title'> 알림</span>
        </template>
        <template #body-slot>
          <div class = 'popup-message'> {{ state.popUPmessage }} </div>
        </template>
      </Modal>
    </component>
  </template>
</template>
<script lang ='ts'>
import { defineComponent, onMounted, reactive, ref, provide, defineProps } from 'vue';
import { Teleport as teleport_, TeleportProps, VNodeProps} from 'vue';

import {
  IParent
} from "@/interfaces";
import { useRouter, useRoute } from 'vue-router';
import Modal from '@/components/ui/modal/Modal.vue';
import usePremiereApi from '@/composition/usePremiereApi';


export default defineComponent({
  name: 'App',
  components: {
    Modal
  },
  setup() {
    const extractPercent = ref<Number>(0);
    const extractList = ref([]);
    const extractMarker = ref(new Map<string, object>());
    const { params } = useRoute();
    const { getReadSettingGroup } = usePremiereApi();

    const Teleport = teleport_ as {
      new (): {
        $props: VNodeProps & TeleportProps;
      }
    }

    const state = reactive({
      datas: [], // extract 에서 선택한 데이터만
      markerDatas: [], // extract 에서 선택한 marker 데이터만
      lastedView: '',
      selectedGroup: null,
      group: null,
      showPopupMessage: false,
      popUPmessage: '',
      selectedColor: 0,
      isMounted: false,
    });

    const onPopupClose = () => {
      state.showPopupMessage = false;
    }

    provide('extractList', extractList);
    provide('extractMarker', extractMarker);
    provide('state', state);

    onMounted(() => {
      document.addEventListener('popUpMessage', (event: any) => {
        state.showPopupMessage = true;
        state.popUPmessage = event.detail.msg;
      });

      window.addEventListener('message', (e) => {
        // console.log(" APP Receive Mesaage :", e);
        const { type, data } = e.data;
        if (type === "extractResult") {

          const { msg , status } = data;
          if (status === 'processing') {
            const percent =  Math.round(Number(msg));
            extractPercent.value = percent >= 100 ? 0 : percent;
          }

          if(status === 'error') {
            console.error(" ERROR MEssgae : ",msg);
          }

          if(status === 'complete') {
            extractList.value = []; // init
            extractMarker.value = new Map<string, object>(); // init
            extractList.value =  e.data.data.data;
            extractList.value.forEach((data) => {
              if(!extractMarker.value.has(data.id)) {
                extractMarker.value.set(data.id, data.markers.length ? data.markers: []);
              }
            });

            console.log("extractListDatas", extractList.value);
            // 마커 정보를 가져오자...
            // 어떻게 저장해야하는가.
          }
        }

        if (type === "lastedPeopleGroup") {
          const { group } = data;
          state.group = group;
        }

      });
    })

    // @ts-ignore
    if (parent && (parent as IParent).premiereApiInterface === undefined) {
      console.error(" API 로딩에 실패하여 이용할 수 없습니다. ");
    } else {
      getReadSettingGroup();
    }

    onMounted(()=> state.isMounted = true);

    return {
      extractPercent,
      extractList,
      state,
      onPopupClose,
      Teleport,
    }
  }
});
</script>
<style lang="scss">
#app {
  padding:0;
  margin:0;
  width:100%;
  height:100%;
  min-width: 1000px;
}

.popup-title {
  text-indent: 1rem;
}

.popup-message {
  text-align: center;
  padding: 10px 15px;
}

.messagePopup {
  z-index: 5000000;
}
</style>
