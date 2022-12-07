<template>
  <div>
    <div class = 'paging-cell-wrapper'>
      <div class = 'paging-cell' @click.stop.prevent="onClickPage(1)">
        <span class ='paging-arrow roate-90' :class = "{'allow': isAllowArrow('prevPage')}"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 3.795l2.995-2.98 11.132 11.185-11.132 11.186-2.995-2.981 8.167-8.205-8.167-8.205zm18.04 8.205l-8.167 8.205 2.995 2.98 11.132-11.185-11.132-11.186-2.995 2.98 8.167 8.206z"/></svg></span>
      </div>
      <div class = 'paging-cell' @click.stop.prevent="onClickPage(currentPage-1)">
        <span class = 'paging-arrow roate-90' :class = "{'allow': isAllowArrow('prevPage')}"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z"/></svg></span>
      </div>
      <div v-for="n in pageRange" :key="n" class = 'paging-cell' @click.stop.prevent="onClickPage(n)">
        <span :class = "{'active': n === currentPage}"> {{ n }} </span>
      </div>
      <div class = 'paging-cell' @click.stop.prevent="onClickPage(currentPage+1)">
        <span class = 'paging-arrow' :class = "{'allow': isAllowArrow('lastPage')}"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z"/></svg></span>
      </div>
      <div class = 'paging-cell' @click.stop.prevent="onClickPage(totalPage)">
         <span class ='paging-arrow' :class = "{'allow': isAllowArrow('lastPage')}"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 3.795l2.995-2.98 11.132 11.185-11.132 11.186-2.995-2.981 8.167-8.205-8.167-8.205zm18.04 8.205l-8.167 8.205 2.995 2.98 11.132-11.185-11.132-11.186-2.995 2.98 8.167 8.206z"/></svg></span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'

export default defineComponent({
  name: 'PagingUi',
  emits: ["onChangeCurrentPage"],
  props: {
    page: {
      type: Number,
      required: true,
      default: 1,
    },
    perPage: {
      type: Number,
      required: true,
      default: 1,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    }
  },
  setup(props, context) {
    const defaultShowPageNum = 2; // 앞뒤로 보여야 할 수를 표현 2 / 12345 // 이렇게
    const currentPage = computed(() => props.page);
    const totalPage = computed(()=> Math.ceil(props.total / props.perPage));
    const pageRange = computed(() => {
      const rangePageList = [];
      let startPage = 1;
      let endPage = 1;
      if(totalPage.value > defaultShowPageNum) {
        startPage = currentPage.value <= defaultShowPageNum + 1 ? 1 : currentPage.value - defaultShowPageNum;
        endPage = currentPage.value <= defaultShowPageNum + 1 ? defaultShowPageNum*2 + 1 : currentPage.value + defaultShowPageNum;
        if (endPage >= totalPage.value ) {
          endPage = totalPage.value;
          startPage = totalPage.value - defaultShowPageNum*2 > 0 ? totalPage.value - defaultShowPageNum*2 : 1;
        }
      } else {
        startPage = 1;
        endPage = totalPage.value;
      }

      for (let i = startPage; i <= endPage; i++) {
        rangePageList.push(i);
      }

      return rangePageList;
    })

    const onClickPage = (page: number) => {
      if (page <= totalPage.value && page >= 1)  {
        context.emit("onChangeCurrentPage", page);
      }
    }

    const isAllowArrow = computed(() => (type: string) => {
      if (type === 'prevPage') {
        return currentPage.value !== 1;
      } else if (type === 'lastPage') {
        return currentPage.value !== totalPage.value;
      }
    });

    onMounted(() => {

    });


    return {
      totalPage,
      currentPage,
      pageRange,
      onClickPage,
      isAllowArrow,
    }
  },
})
</script>
<style lang="scss" scoped>
  .paging-arrow {
    width:8px;
    height:8px;
    fill: #aaa;
    cursor: not-allowed;
    opacity: 0.5;

    &.allow {
      fill: #000;
      cursor: pointer;
      opacity: 1;
    }
  }

  .roate-90 {
    transform: rotate(180deg);
  }

  .paging-cell-wrapper {
    display: flex;
    align-items: center;
    height: 35px;
    user-select: none;
    .paging-cell {
      font-size:13px;
      width:25px;
      height:25px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: 0.2s;

      span {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        top:0px;
      }

      .active {
        border:0px solid #e2e2e2;
        border-radius: 13px;
        background-color: #555;
        color:#fff;
        width:25px;
        height:25px;
      }

      &:hover {
        cursor: pointer;
      }
    }
  }

</style>
