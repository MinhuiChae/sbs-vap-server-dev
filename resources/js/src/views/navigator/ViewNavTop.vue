<template>
  <div class ='top-navigator-wrapper'>
    <div class = 'title-wrapper'>
      <span @click.stop.prevent="onOpenModal" class = 'home'>
        <p class = 'title'>홈</p>
      </span>
      <span v-for = "(t) in title" :key = "t" >
        <a @click.stop.prevent="onTitleClick(t)">{{ t.name }}</a>
      </span>
      <!-- <span class = 'present-title'> {{ title }} </span> -->
    </div>
    <div class = 'search-wrapper'>
      <slot name='search-slot'/>
    </div>
  </div>
  <teleport to="body">
    <ConfirmModalUi v-if="state.isOpenModal"
    :useOuterClose="true"
    :width = "800"
    :message = "state.confirmMessage"
    :desp = "state.confirmDesp"
    @closeAction = "onCloseAction"
    :btns="confirmBtns"
    >
    </ConfirmModalUi>
  </teleport>
</template>
<script lang="ts">
import { defineComponent, reactive } from 'vue'
import ConfirmModalUi from '@/components/ui/confirm/Confirm.vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'ViewNaviTop',
  components: {
    ConfirmModalUi,
  },
  props: {
    title: {
      type: Array(Object),
      default: ' ',
    }
  },
  setup() {
    const router = useRouter();
    const state = reactive({
      isOpenModal: false,
      confirmMessage: '홈으로 이동 하시 겠습니까?',
      confirmDesp: '현재 리스트가 전체 초기화 될 수 있습니다.'
    });

    const onOpenModal = () => {
      state.isOpenModal = true;
    }

    const onCloseAction = () => {
      state.isOpenModal = false;
    }

    const onMoveHome = () => {
      router.push({name: 'home'})
    }

    const onBeforeDeleteLayer = () => {

    }

    const onTitleClick = (routeTarget: any) => {
      console.log("routeName >", routeTarget);
      if (routeTarget.routeName) {
        router.push({
          name: routeTarget.routeName,
          query: {
            refresh: 1
          }
        });
      } else if(routeTarget.path )  {
        router.push({
          path: routeTarget.path,
          query: {
            refresh: 1
          }
        });
      } else if(routeTarget.evt && typeof routeTarget.evt === 'function')  {
        routeTarget.evt.bind(this).call();
      }
    }

    const confirmBtns = [{
      type: "ok",
      text: '예',
      onClickAction: onMoveHome,
      // onclickCloseAction: true,
      // beforeClickAction: onBeforeDeleteLayer,
    },{
      type: "",
      text: "아니요",
      onclickCloseAction: true,
    }];

    return {
      state,
      confirmBtns,
      onOpenModal,
      onCloseAction,
      onTitleClick,
    }
  },
})
</script>
<style lang="scss">
.home-icon {
  fill: rgb(139, 139, 139);
  cursor: pointer;
  width: 25px;
  height: 25px;
  transition: 0.5s;

  &:hover {
    fill: #f1f1f1;
  }
}
</style>
