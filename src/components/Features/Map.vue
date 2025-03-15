<template>
  <div class="map-container">
    <div id="naverMap"></div>
    <button class="toggle-marker-btn" @click="toggleMarkers">
      {{ showMarkers ? "음식점 숨기기" : "음식점 표시하기" }}
    </button>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import { initNaverMap } from "@/utils/naverMap.js";

export default {
  setup() {
    const map = ref(null);
    const showMarkers = ref(true);
    const markers = ref([]);

    const restaurantList = [
      { name: "금성관", lat: 37.5665, lng: 126.9780 },
      { name: "리원", lat: 37.5678, lng: 126.9762 },
      { name: "멘무샤", lat: 37.5652, lng: 126.9775 },
      { name: "맥도날드", lat: 37.5641, lng: 126.9821 },
      { name: "맘스터치", lat: 37.5632, lng: 126.9843 },
      { name: "신의주 부대찌개", lat: 37.5684, lng: 126.9799 },
      { name: "콜리그", lat: 37.5623, lng: 126.9768 },
      { name: "왕비집", lat: 37.5660, lng: 126.9812 }
    ];

    // ✅ 지도 & 마커 초기화
    const initMap = () => {
      map.value = initNaverMap("naverMap", 37.563, 126.9815);

      // ✅ 음식점 위치에 마커 추가
      restaurantList.forEach((restaurant) => {
        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(restaurant.lat, restaurant.lng),
          map: map.value,
          title: restaurant.name,
        });

        // ✅ 마커 클릭 시 정보창 표시
        const infoWindow = new naver.maps.InfoWindow({
          content: `<div class="info-window">${restaurant.name}</div>`,
        });

        naver.maps.Event.addListener(marker, "click", () => {
          infoWindow.open(map.value, marker);
        });

        markers.value.push(marker);
      });
    };

    // ✅ 마커 표시/숨김 기능
    const toggleMarkers = () => {
      showMarkers.value = !showMarkers.value;

      markers.value.forEach((marker) => {
        marker.setMap(showMarkers.value ? map.value : null);
      });
    };

    onMounted(() => {
      initMap();
    });

    return {
      showMarkers,
      toggleMarkers,
    };
  },
};
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 400px;
  position: relative;
}

#naverMap {
  width: 100%;
  height: 100%;
  border-radius: 10px;
}

/* ✅ 토글 버튼 스타일 */
.toggle-marker-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
}

.toggle-marker-btn:hover {
  background: #0056b3;
}

/* ✅ 마커 정보창 스타일 */
.info-window {
  padding: 5px 10px;
  font-size: 14px;
  font-weight: bold;
  background: white;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
