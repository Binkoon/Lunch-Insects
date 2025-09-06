import { createRouter, createWebHistory } from "vue-router";
import Intro from "../views/Intro.vue";
import Auth from "../views/Auth.vue";
import Onboarding from "../views/Onboarding.vue";
import HomeNew from "../views/HomeNew.vue";
import About from "../views/About.vue";

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
