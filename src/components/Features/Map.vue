<template>
  <div class="map-container">
    <div id="naverMap"></div>
  </div>
</template>

<script>
import { onMounted } from "vue";
import { initNaverMap, addMarkersToMap, getLatLngFromAddress } from "@/utils/naverMap.js";

export default {
  setup() {
    onMounted(() => {
      // 음식점 리스트 (주소 기반)
      const restaurantList = [
        { name: "금성관", address: "서울 중구 남대문로3가 96" },
        { name: "리원", address: "서울 중구 명동2가 99-2" },
        { name: "멘무샤", address: "서울 중구 세종대로18길 20-2" },
        { name: "미쓰족발", address: "서울 중구 을지로2가 199-45" },
        { name: "맥도날드", address: "서울 중구 을지로1가 32" },
        { name: "청진동 해장국", address: "서울 중구 북창동 101" },
        { name: "일품향", address: "서울 중구 명동2가 105" },
        { name: "칙바이칙", address: "서울 중구 을지로2가 199-40" },
        { name: "보노보스", address: "서울특별시 중구 소공로 106" },
        { name: "왕비집", address: "서울특별시 중구 충무로1가 25-6" },
        { name: "애성회관", address: "서울 중구 북창동 93-36" },
        { name: "맘스터치", address: "서울 중구 무교동 21-3" },
        { name: "KFC", address: "서울 종로구 서린동 88" },
        { name: "밀피유", address: "서울 중구 명동2가 33-5" },
        { name: "군자대한곱창", address: "서울 중구 명동1가 42-2" },
        { name: "콜리그", address: "서울 중구 소공동 50" },
        { name: "신의주 부대찌개", address: "서울 중구 세종대로18길 20" },
        { name: "박씨화로숯불구이", address: "서울 중구 북창동 94-7" },
        { name: "돈우가", address: "서울 중구 북창동 94-20" },
        { name: "알로프트", address: "서울 중구 명동2가 104" },
        { name: "모모카페", address: "서울 중구 남대문로4가 17-23" },
        { name: "은앤정 닭갈비", address: "서울 중구 을지로2가 199-41" },
        { name: "월가갈비", address: "서울 중구 북창동 11-7" },
        { name: "강남면옥", address: "서울 중구 명동1가 48-2" }
      ];

      // 지도 초기화 후 마커 추가 
      initNaverMap("naverMap", 37.563, 126.9815, (map) => {
        // 모든 주소를 좌표로 변환한 후 마커 추가
        const convertedList = [];
        let processedCount = 0;

        restaurantList.forEach((restaurant) => {
          getLatLngFromAddress(restaurant.address, (coords) => {
            processedCount++;
            if (coords) {
              convertedList.push({ name: restaurant.name, lat: coords.lat, lng: coords.lng });
            }
            // 모든 주소 변환이 끝나면 마커 추가
            if (processedCount === restaurantList.length) {
              addMarkersToMap(map, convertedList);
            }
          });
        });
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
