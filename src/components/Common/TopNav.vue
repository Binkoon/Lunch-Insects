<template>
  <nav class="top-nav" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <h1 class="nav-title">KMTC INSECTS</h1>
  </nav>
</template>

<script>
import headerBg from "/src/assets/header_img_light.webp"; 

export default {
  data() {
    return {
      backgroundImage: headerBg, 
    };
  },
};
</script>

<style scoped>
.top-nav {
  width: 100%;
  height: 300px; /* ✅ 기존 200px → 300px로 변경 */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px; /* ✅ 폰트도 조금 키워서 비율 맞춤 */
  font-weight: bold;
  color: white;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;

  /* ✅ 배경 이미지 설정 */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* ✅ 반투명 오버레이 */
.top-nav::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
}

/* ✅ 텍스트를 배경보다 잘 보이게 */
.nav-title {
  position: relative;
  z-index: 1;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.6); /* ✅ 텍스트 가독성 UP */
}
</style>
