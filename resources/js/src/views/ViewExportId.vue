<template>
  <div class = 'wrapper' >
    <!-- <div class = "extract-step-wrapper" v-show = "state.status === 'extracting'">
      <div class ='step'>
        <div class = 'step-icon' style ="--num:'1';"></div>
        <br>Bin에서 파일 리스트 추출
      </div>
      <div class ='step'>
        <div class = 'step-icon' style ="--num:'2';"></div>
        <br>파일에서 SBS ID 추출
      </div>
    </div> -->
    <div class = 'left-wrapper'>
      <div class = 'logo-text-wrapper'>
        <div class ='txt-title' :class = "{'logo-animation': state.status !== ''}" ref = "titleEl">
          SBS Premiere Plugin<br>&nbsp;<span class='txt-sub-title'>Video Content Analysis</span>
        </div>
      </div>
    </div>
    <div class = 'right-wrapper' ref = 'el'>
      <div class = 'button-wrapper' ref = 'buttonWrapperEl' v-show = "state.status !== 'extracting' || state.status !== 'complete'">
        <!-- <LodingIcon /> -->
        <button class = 'btn-large' @click.stop ="onExtractBtnClick"> Extract SBS Video ID </button>
        <span class ='status-text font-size-12' >
          * 버튼 클릭시 BIN 파일에서 SBS ID 추출하여 리스트로 보여줍니다.<br>
          &nbsp; 많은 파일 추출 시 시간이 오래 걸릴 수 있습니다.
        </span>
      </div>
      <div class = 'star-wrapper' ref = 'starAniEl'>
      </div>
    </div>
    <!-- <LodingIcon />
    <div class ='button-wrapper'>
      <button class = 'btn-large'> 빈 파일 SBS ID 추출  </button>
    </div>
    <div class = 'status-text'>
      버튼 클릭시 BIN 파일에서 SBS ID 추출하여 리스트로 보여줍니다.
    </div> -->
    <div class = 'extract-loading-status-wrapper hide' v-show = "state.status === 'extracting' || state.status === 'complete' " ref = 'extloadingWrapperEl'>
      <LodingIcon />
      <div class = 'extract-info-text'> {{ getExtractMsg }}</div>
      <div ref = 'extract-result-text'> 추출 파일 개수 : {{ state.extract.fileCnt }} 개 </div>

      <Transition name="bounce" mode="out-in">
        <div v-if = "state.status === 'complete'" class = 'complete-text-wrapper'>
          <div class ='extract-result-time-txt'>
              총 작업 시간 : {{ state.extractElapsedTime }}
          </div>
          <div class ='extract-result-action-buttons'>
            <button class ='btn-large' @click.stop = "onGoMainPage">메인 페이지로</button>
            <button class='btn-large' @click.stop = "onGoListPage">추출 리스트로</button>
          </div>
        </div>
      </Transition>

      <div ref = "stepWrapperEl" class = "extract-step-wrapper"  v-show = "state.status === 'extracting'">
        <div class ='step' :class = "getStepCss(1)">
          <div class = 'step-icon' style ="--num:'1';"></div>
          <br>Bin에서 파일 리스트 추출
        </div>
        <div class ='step' :class = "getStepCss(2)">
          <div class = 'step-icon' style ="--num:'2';"></div>
          <br>파일에서 SBS ID 추출
        </div>
      </div>
    </div>
    <div class = 'extract-progress-wrapper' v-if = "state.status === 'extracting'">
      <Progressbar
           :percent = "props.extractPercent" class ='render-progressbar-wrapper'/>
    </div>

    <div v-show = 'state.status === "error"' class ='extract-error-wrapper'>
      <div class ='extract-error-msg'>
        {{ state.msg }}
      </div>
      <button class ='btn-large' @click.stop = "onGoMainPage">메인 페이지로</button>
    </div>
  </div>
</template>
<script lang="ts">
import {computed, defineComponent, onMounted, reactive, ref } from 'vue'
import LodingIcon from '@/components/icons/LoadingIcon.vue';
import Progressbar from '@/components/ui/Progressbar.vue';
import usePremiereApi from '@/composition/usePremiereApi';
import { useRouter }  from 'vue-router';

export default defineComponent({
  name: 'view-export',
  components: {
    LodingIcon,
    Progressbar,
  },
  props:{
    extractPercent: {
      type: Number,
      default: 0,
    }
  },
  setup(props) {

    const el = ref<HTMLDivElement>();
    const starAniEl = ref<HTMLDivElement>();
    const buttonWrapperEl = ref<HTMLDivElement>();
    const extloadingWrapperEl = ref<HTMLDivElement>();
    const titleEl = ref<HTMLDivElement>();
    const stepWrapperEl = ref<HTMLDivElement>();

    const { getAllFileNameInBin, getExtractId } = usePremiereApi();
    const router = useRouter();
    const state = reactive({
      status : '',
      percent: 0,
      extract: {
        fileCnt: 0,
        step: 0,
      },
      msg: '',
      startTime: new Date() as any,
      extractElapsedTime: 0 as any,
      win : null
    });

    const getExtractMsg = computed(() => {
      let msg = '';
      switch(state.status) {
        case 'extracting':
          msg = '추출 작업이 진행 중입니다.';
          break;
        case 'complete':
          msg = '추출 작업이 완료되었습니다.';
          break;

        case 'error':
          msg = '오류가 발생하였습니다.'
          break;
      }

      return msg;
    });

    const getStepCss = computed(() => {
      return (step: number) => {
        let css = '';
        if (state.extract.step > step) css = 'complete';
        else if (state.extract.step === step) css = 'blink';
        return css;
      }
    });

    const onExtractBtnClick = () => {
      if (state.status === 'extractClick') return;
      buttonWrapperEl.value?.classList.add('hide');
      state.status = 'extractClick';
      setTimeout(()=> {
        state.status = 'extracting';
        setTimeout(() => {
          extloadingWrapperEl.value?.classList.remove('hide');
          extloadingWrapperEl.value?.classList.add('show');
          state.extract.step = 1;
          getResult();
        },50);
         titleEl.value?.classList.add('logo-animation');
      },500);
    }

    const getResult = async () => {
      state.startTime = new Date();
      const result: any = await getAllFileNameInBin();

      if (result.success === true) {
        const length = result.files.length;
        state.extract.fileCnt = length;
        state.extract.step = 2;

        console.log("result> ", result);

        // makeTree(result.files);
        // tree로 만들기가 필요하다..

        const res: any = await getExtractId(result.files, {
          callbackMessageType: 'extractResult'
        });

        console.log("res> ", res);

        if (res && res.success === true){
          state.status = 'complete';
          state.extractElapsedTime = `${((new Date() as any - state.startTime as any) / 1000).toString()}s`;
        } else {
          // 오류 처리
          state.status = 'error';
          state.msg = res.msg;
         // state.extract.step = 1;
        }

        console.log(res);
        // console.log(getExtractId);
      }
    }


    const onGoMainPage = () => {
      state.status = '';
      state.percent = 0;
      state.extract = {
        fileCnt: 0,
        step: 0,
      };

      if (buttonWrapperEl?.value) {
        buttonWrapperEl?.value.classList.remove('hide');
      }
    }

    const onGoListPage = () => {
      router.push({name: 'Export List'});
    }

    onMounted(() => {
      setTimeout(() => {
        const rect = el.value?.getBoundingClientRect();
        if (rect){
          const height = rect?.height;
          const width = rect?.width;

          for (var i = 0; i < 100; i++) {
            const starEl = document.createElement("div");
            starEl.classList.add('star');
            starEl.style.animation = `twinkle ${Math.random() * 5 + 3}s linear ${Math.random() * 5 + 3}s infinite`;
            starEl.style.top = `${Math.random()* height}px`;
            starEl.style.left = `${Math.random()* width}px`;
            starAniEl.value?.append(starEl);
          }
        }

      }, (1000));
    })


    return {
      el,
      starAniEl,
      onExtractBtnClick,
      buttonWrapperEl,
      extloadingWrapperEl,
      stepWrapperEl,
      titleEl,
      state,
      getStepCss,
      onGoListPage,
      onGoMainPage,
      props,
      getExtractMsg,

    }
  },
})
</script>
<style lang="scss" scoped>
   @import "@/scss/variables.scss";

  .txt-title {
    font-size: 4vw;
    font-weight: 800;
    line-height: 1em;
    letter-spacing: inherit;
    font-family: "SF Pro Display Medium";
    color: #fff; // #7300ff;
    transition: 0.5s;
    position: absolute;
    top: calc(50vh - 6vw);
    left:5vw;

    .txt-sub-title {
      font-size: 2vw;
      // color:rgb(0, 136, 255);
      // font-family: "SF Pro Display Thin";
    }

    &.logo-animation {
     // position: absolute;
      font-weight: 600;
     // font-family: "SF Pro Display";
      font-size: 14px;
      top:20px;
      left:7vw;
      .txt-sub-title {
        font-size: 10px;
      }
    }
  }

  .wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    // height:100vh;
    overflow: hidden;
    position: relative;
    padding:0;
    margin:0;
    flex:1;
    height:100vh;

    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    background: rgb(0,0,0);
    background: linear-gradient(90deg, $base-background-color 0%, rgba(40,40,40,1) 65%, rgba(74,42,111,0.9) 100%);

    .extract-step-wrapper {
      position:  absolute;
      top:10vh;
      width: 85vw;
      display:flex;
      align-items: center;
      justify-content: center;

      .step {
        flex:1;
        display:flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        opacity: 0;
        color: $step-color;
        // color: rgb(60, 60, 60);

        &.complete {
          color: $step-complete-color;
          opacity: 1;
          .step-icon {
            border: 1vh solid $step-complete-color;
          }
        }

        .step-icon {
          width:15vh;
          height:15vh;
          border: 1vh solid $step-color;
          // border: 1vh solid rgb(60, 60, 60);
          border-radius: 50%;
          box-sizing: border-box;
          position: relative;

          &::after {
            content: var(--num);
            position: absolute;
            left:4.5vh;
            top:2vh;
            border: 0;
            background: transparent;
            font-size: 8vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }
    }

    .left-wrapper {
      flex:1;
    }

    .button-wrapper {
      display: flex;
      // align-items: center;
      // justify-content: center;
      flex-direction: column;
      transition: 0.2s;
      opacity: 1;
      margin-left: 50px;

      &.hide {
       animation: hide-animation 0.5s forwards;
      //  transform-origin: 0%;
      }
    }

    .status-text {
      padding:15px 0px 0px 0px;
    }

    .right-wrapper {
      display: flex;
      width:100%;
      height:100%;
      align-items: center;
      // justify-content: center;
      flex:1;
      // background:#000 url(http://www.script-tutorials.com/demos/360/images/stars.png) repeat top center;
      z-index:0;
      position: relative;

      .star-wrapper {
        z-index:-1;
        position: absolute;
        top:0;
        left:0;
        width:100%;
        height:100%;
      }
    }

    .extract-loading-status-wrapper {
        position: absolute;
        display: flex;
        align-items: center;
        margin-left: 50px;
        transition: 2s;
        opacity: 0;
        flex-direction: column;
        top: 30vh;

        &.hide {
          opacity: 0;
        }

        &.show {
          opacity: 1;
        }

        .extract-info-text {
          padding-top: 1.5vh;
          //margin-left: 1.5vw;
          font-size: 5vh;
          display: flex;
          align-items: center;
        }
      }

    .logo-text-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .extract-progress-wrapper {
      position: absolute;
      bottom: 20vh;
      flex:1;
      height: 50px;
      display:flex;
      width:85vw;
    }
  }

  button {
    &.btn-large {
      width:300px;
      height:125px;
      cursor: pointer;
      font-size:20px;
      padding: 0px;
      margin: 0px;
      background: #000000;
      color: #e2e2e2;
      border:0px;
      border-radius: 10px;
      transition: 0.2s;

      &:hover {
        font-size:22px;
      }
    }

    &:hover {
      cursor: pointer;
    }
  }

  .blink {
    animation: blink-effect 1.5s ease-in-out infinite;
  }

  @keyframes blink-effect {
    50% {
      opacity: 0.7;
    }
  }

  .bounce-enter-active {
    animation: bounce-in 0.5s;
  }
  .bounce-leave-active {
    animation: bounce-in 0.5s reverse;
  }
  @keyframes bounce-in {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.25);
    }
    100% {
      transform: scale(1);
    }
  }

  .complete-text-wrapper {
    padding:20px;
    display:flex;
    align-content: center;
    justify-content: center;
    flex-direction: column;

    .extract-result-time-txt {
      font-size: 4vh;
    }

    .extract-result-action-buttons {
      padding: 20px;
      button {
        margin-left:10px;
        margin-right:10px;
      }
    }

    div {
      display:flex;
      align-content: center;
      justify-content: center;
    }
  }

  .extract-error-wrapper {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .extract-error-msg {
      display: flex;
      align-items: center;
      justify-content: center;
      padding:20px;
      font-size:40px;
      color:rgb(255, 82, 82);
      //font-weight: bold;
    }
  }

</style>
