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

// 지도 초기화 (기본 위치 마커 포함)
export function initNaverMap(mapContainerId, lat = 37.563, lng = 126.9815, callback) {
  loadNaverMapScript(() => {
    if (window.naver && window.naver.maps) {
      const mapOptions = {
        center: new naver.maps.LatLng(lat, lng),
        zoom: 15.5,
      };

      const map = new naver.maps.Map(mapContainerId, mapOptions);

      // 기본 위치 마커 (빨간색 아이콘)
      const defaultMarker = new naver.maps.Marker({
        position: new naver.maps.LatLng(lat, lng),
        map: map,
        title: "기본 위치",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", // 빨간색 마커 아이콘
          scaledSize: new naver.maps.Size(40, 40), // 크기 조정 가능
        },
      });

      if (callback) {
        callback(map);
      }
    } else {
      console.error("❌ 네이버 지도 API 로드 실패");
    }
  });
}

// 지도에 음식점 마커 추가 (사용자가 입력한 좌표값 활용)
export function addMarkersToMap(map, restaurantList) {
  restaurantList.forEach(({ name, lat, lng }) => {
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(lat, lng),
      map: map,
      title: name,
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png", // 음식점 마커 (파란색)
        scaledSize: new naver.maps.Size(40, 40),
      },
    });

    // 마커 클릭 시 음식점 이름을 보여주는 InfoWindow 추가
    const infoWindow = new naver.maps.InfoWindow({
      content: `<div style="padding:10px;font-size:14px;">🍽️ ${name}</div>`,
    });

    naver.maps.Event.addListener(marker, "click", () => {
      infoWindow.open(map, marker);
    });
  });
}
