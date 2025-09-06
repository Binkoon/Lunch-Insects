import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { MotionPlugin } from "@vueuse/motion";
import "./styles/variables.css"; // CSS 변수 파일 추가

const app = createApp(App);

app.use(router);
app.use(MotionPlugin);
app.mount("#app");
