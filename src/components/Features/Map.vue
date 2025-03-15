<template>
  <div class="map-container">
    <div id="naverMap"></div>
  </div>
</template>

<script>
import { onMounted } from "vue";
import { initNaverMap, addMarkersToMap } from "@/utils/naverMap.js";

export default {
  setup() {
    onMounted(() => {
      // 음식점 리스트 (이제 직접 좌표 입력 필요!)
      const restaurantList = [
        { name: "금성관", lat: 37.56137, lng: 126.9788 },
        { name: "리원", lat: 37.5624, lng: 126.9819 },
        { name: "멘무샤", lat: 37.5637, lng: 126.97828 },
        { name: "맥도날드", lat: 37.5668, lng: 126.9795 },
        { name: "맘스터치", lat: 37.5670, lng: 126.9793 },
        { name: "신의주 부대찌개", lat: 37.5636, lng: 126.9781897 },
        { name: "콜리그", lat: 37.56329, lng: 126.9803 },
        { name: "왕비집", lat: 37.5611, lng: 126.9824 },
        { name: "26층", lat: 37.559, lng: 126.977 },
        { name: "26층 (VIP)", lat: 37.558, lng: 126.976 }
        // 좌표 직접 추가 가능
      ];

      // 지도 초기화 후 마커 추가
      initNaverMap("naverMap", 37.563, 126.9815, (map) => {
        addMarkersToMap(map, restaurantList);
      });
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
