import './bootstrap';
import {createApp} from 'vue';

import App from '@/views/App.vue';
import Router from '@/router/index';

import VueVirtualScroller from 'vue-virtual-scroller';

import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import directives from "@/directives";



const app = createApp(App);

directives(app)

app.use(VueVirtualScroller);
app
.use(Router)
.mount('#app');

