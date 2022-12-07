<template>
  <svg width="24" height="24"
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg">
  <path v-if="doWork === 'addGroup'" :fill="iconColor" d="M22 6v16h-16v-16h16zm2-2h-20v20h20v-20zm-24-4v20h2v-18h18v-2h-20zm18 13h-3v-3h-2v3h-3v2h3v3h2v-3h3v-2z"/>
  <path v-if="doWork === 'deleteGroup'" :fill="iconColor" d="M22 6v16h-16v-16h16zm2-2h-20v20h20v-20zm-24-4v20h2v-18h18v-2h-20zm18 13h-8v2h8v-2z"/>
  <path v-if="doWork === 'fixGroup'" :fill="iconColor" d="M20 0v2h-18v18h-2v-20h20zm-7.281 20.497l-.719 3.503 3.564-.658-2.845-2.845zm8.435-8.436l2.846 2.845-7.612 7.612-2.845-2.845 7.611-7.612zm-17.154-8.061v20h6v-2h-4v-16h16v4.077l2 2v-8.077h-20z"/>
  </svg>
</template>
<script lang="ts">
export default {
  props: {
    iconColor: { type: String, default: "currentColor" },
    doWork : {type: String, default: ""}
  },
};
</script>