import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';
import Publish from '@/pages/Publish.vue';
import Detail from '@/pages/Detail.vue';
import Mine from '@/pages/Mine.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/publish',
    name: 'publish',
    component: Publish,
  },
  {
    path: '/detail/:id',
    name: 'detail',
    component: Detail,
  },
  {
    path: '/mine',
    name: 'mine',
    component: Mine,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
