const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;

// 🔹 네이버 지도 API 스크립트 로드
export function loadNaverMapScript(callback) {
  if (!NAVER_CLIENT_ID) {
    console.error("⚠️ 네이버 지도 API 키가 설정되지 않았습니다. `.env` 파일 확인 필요!");
    return;
  }

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

// 🔹 지도 초기화 (기본 위치 마커 포함)
export function initNaverMap(mapContainerId, lat = 37.563, lng = 126.9815, callback) {
  loadNaverMapScript(() => {
    if (window.naver && window.naver.maps) {
      const mapOptions = {
        center: new naver.maps.LatLng(lat, lng),
        zoom: 15.5,
      };

      const map = new naver.maps.Map(mapContainerId, mapOptions);

      // 기본 위치 마커 (빨간색 아이콘)
      new naver.maps.Marker({
        position: new naver.maps.LatLng(lat, lng),
        map: map,
        title: "기본 위치",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          scaledSize: new naver.maps.Size(40, 40),
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

// 🚶‍♂️ 네이버 Directions API를 사용해 도보 이동 시간 및 거리 계산
export function getWalkingTime(startLat, startLng, destLat, destLng, callback) {
  if (!NAVER_CLIENT_ID) {
    console.error("⚠️ 네이버 Directions API 키가 설정되지 않았습니다.");
    callback(null);
    return;
  }

  const url = `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start=${startLng},${startLat}&goal=${destLng},${destLat}&option=pedestrian`;

  fetch(url, {
    method: "GET",
    headers: {
      "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
    },
  })
    .then(response => response.json())
    .then(data => {
      console.log("🚶‍♂️ Walking Directions API 응답 데이터:", data);
      if (data.code === 0 && data.route.traoptimal.length > 0) {
        const route = data.route.traoptimal[0].summary;
        const walkingTime = route.duration / 60; // 초 → 분 변환
        const distance = route.distance / 1000; // 미터 → 킬로미터 변환
        callback({ walkingTime: Math.round(walkingTime), distance: distance.toFixed(2) });
      } else {
        console.error("❌ 도보 경로 탐색 실패", data);
        callback(null);
      }
    })
    .catch(error => {
      console.error("❌ 네트워크 오류", error);
      callback(null);
    });
}

// 📍 지도에 음식점 마커 추가 (도보 이동 시간 포함)
export function addMarkersToMap(map, restaurantList) {
  const startLat = 37.563;
  const startLng = 126.9815;

  restaurantList.forEach(({ name, lat, lng }) => {
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(lat, lng),
      map: map,
      title: name,
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        scaledSize: new naver.maps.Size(40, 40),
      },
    });

    // 도보 이동 시간 계산 후 InfoWindow에 표시
    getWalkingTime(startLat, startLng, lat, lng, (data) => {
      const timeText = data
        ? `🚶‍♂️ ${data.walkingTime}분 (${data.distance} km)`
        : "시간 정보 없음";
      const infoWindow = new naver.maps.InfoWindow({
        content: `<div style="padding:10px;font-size:14px;">🍽️ ${name}<br>${timeText}</div>`,
      });

      naver.maps.Event.addListener(marker, "click", () => {
        infoWindow.open(map, marker);
      });
    });
  });
}

// 📍 네이버 Geocoding API를 사용해 주소 → 좌표 변환
export function getLatLngFromAddress(address, callback) {
  if (!NAVER_CLIENT_ID) {
    console.error("⚠️ 네이버 Geocoding API 키가 설정되지 않았습니다.");
    callback(null);
    return;
  }

  const url = `http://localhost:5000/api/geocode?address=${encodeURIComponent(address)}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log(`📍 Geocoding API 응답 (${address}):`, data);
      if (data.status === "OK" && data.addresses.length > 0) {
        const { y: lat, x: lng } = data.addresses[0];
        console.log(`✅ 변환 완료: ${address} → lat: ${lat}, lng: ${lng}`);
        callback({ lat: parseFloat(lat), lng: parseFloat(lng) });
      } else {
        console.error(`❌ Geocoding 실패: ${address}`, data);
        callback(null);
      }
    })
    .catch(error => {
      console.error("❌ 네트워크 오류", error);
      callback(null);
    });
}