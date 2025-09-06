import { createRouter, createWebHistory } from "vue-router";
import Intro from "../pages/Intro.vue";
import Auth from "../pages/Auth.vue";
import Onboarding from "../pages/Onboarding.vue";
import HomeNew from "../pages/HomeNew.vue";
import About from "../pages/About.vue";

const routes = [
  {
    path: "/",
    name: "Intro",
    component: Intro,
  },
  {
    path: "/auth",
    name: "Auth",
    component: Auth,
  },
  {
    path: "/onboarding",
    name: "Onboarding",
    component: Onboarding,
  },
  {
    path: "/home",
    name: "HomeNew",
    component: HomeNew,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
  // 기존 루트 경로를 홈으로 리다이렉트
  {
    path: "/main",
    redirect: "/home"
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
