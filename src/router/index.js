import { createRouter, createWebHistory } from "vue-router";

// 코드 스플리팅을 위한 동적 import
const Intro = () => import("../pages/Intro.vue");
const Auth = () => import("../pages/Auth.vue");
const HomeNew = () => import("../pages/HomeNew.vue");
const About = () => import("../pages/About.vue");

const routes = [
  {
    path: "/",
    redirect: "/intro"
  },
  {
    path: "/intro",
    name: "Intro",
    component: Intro,
  },
  {
    path: "/auth",
    name: "Auth",
    component: Auth,
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
