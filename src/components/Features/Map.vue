<template>
    <div class="map-container">
      <div id="naverMap"></div>
    </div>
  </template>
  
  <script>
  import { onMounted } from "vue";
  import { initNaverMap } from "@/utils/naverMap.js";
  
  export default {
    setup() {
      onMounted(() => {
        initNaverMap("naverMap", 37.5665, 126.9780); // 서울 좌표
      });
    },
  };
  </script>
  
  <style scoped>
  .map-container {
    width: 100%;
    height: 400px;
  }
  
  #naverMap {
    width: 100%;
    height: 100%;
    border-radius: 10px;
  }
  </style>
  