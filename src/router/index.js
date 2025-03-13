import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";

const routes = [
  { path: "/", component: Home }, // 🚀 홈 페이지 경로 설정
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
