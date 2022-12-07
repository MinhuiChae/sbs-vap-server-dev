import {
  createWebHistory,
  createRouter,
  RouteRecordRaw,
  Router
} from 'vue-router';

// import DefaultView from '@/views/MainView.vue';
import ViewPeopleSearch from '@/views/ViewPeopleSearch.vue';
import ViewSubtitleList from '@/views/ViewSubtitleList.vue';
import ViewExportId from '@/views/ViewExportId.vue';
import ViewExportList from '@/views/ViewExportList.vue';
import ViewVttList from '@/views/ViewVttList.vue';
import ViewTest from '@/views/ViewTest.vue';
import ViewActorManage from '@/views/ViewActorManage.vue';
import ViewActorGroup from '@/views/ViewActorGroup.vue';
import ViewFlexTest from '@/views/ViewFlexTest.vue';

const routes: RouteRecordRaw[] = [
  {
    path: "/test",
    name: 'test test',
    component: ViewTest,
    meta: { transition: 'slide-left' },
    props: {
      default: true
    },
  },
  {
    path: "/flex",
    name: 'flex test',
    component: ViewFlexTest,
    meta: { transition: 'slide-left' },
    props: {
      default: true
    },
  },
  {
    path: "/actor",
    name: 'people List',
    component: ViewPeopleSearch,
    meta: { transition: 'slide-left' },
    props: {
      default: true
    },
  },
  {
    path: "/actor/group",
    name: 'actor group List',
    component: ViewActorGroup,
    meta: { transition: 'slide-left' },
    props: {
      default: true
    },
  },
  {
    path: "/actor/group/:id/actors",
    name: 'actors manage',
    component: ViewActorManage,
    meta: { transition: 'slide-left' },
    props: {
      default: true
    },
  },
  {
    path: "/export-list",
    name: 'Export List',
    component: ViewExportList,
    meta: { transition: 'slide-left' },
    props: {
      default: true
    },
  },
  {
    path: "/list",
    name: 'view list',
    component: ViewVttList,
    meta: { transition: 'slide-left' },
    props: {
      default: true
    },
  },
  {
    path: "/subtitle",
    name: 'Subtitle list',
    component: ViewSubtitleList,
    meta: { transition: 'slide-left' },
    props: {
      default: true
    },
  },
  {
    path: "/",
    name: 'home',
    component: ViewExportId,
    meta: { transition: 'slide-left' },
    props: {
      default: true
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: 'home',
    component: ViewExportId,
    meta: { transition: 'slide-left' },
    props: {
      default: true
    },
  }
];

const router: Router = createRouter({
  history: createWebHistory(),
  routes,
});


export default router;
