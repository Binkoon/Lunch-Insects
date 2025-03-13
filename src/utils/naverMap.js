const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;

// 네이버 지도 API 스크립트 로드
export function loadNaverMapScript(callback) {
  if (!NAVER_CLIENT_ID) {
    console.error("⚠️ 네이버 지도 API 키가 설정되지 않았습니다. `.env` 파일 확인 필요!");
    return;
  }

  // 이미 스크립트가 로드된 경우 콜백 실행
  if (document.getElementById("naver-map-script")) {
    callback();
    return;
  }

  const script = document.createElement("script");
  script.id = "naver-map-script";
  script.type = "text/javascript";
  script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_CLIENT_ID}`;
  script.onload = callback;
  document.head.appendChild(script);
}

// 지도 초기화
export function initNaverMap(mapContainerId, lat = 37.6665, lng = 126.9780) {
  loadNaverMapScript(() => {
    if (window.naver && window.naver.maps) {
      const mapOptions = {
        center: new naver.maps.LatLng(lat, lng),
        zoom: 15.5,
      };

      const map = new naver.maps.Map(mapContainerId, mapOptions);

      new naver.maps.Marker({
        position: new naver.maps.LatLng(lat, lng),
        map: map,
      });
    } else {
      console.error("❌ 네이버 지도 API 로드 실패");
    }
  });
}
