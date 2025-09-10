import { ref } from 'vue';

/**
 * 위치 관련 비즈니스 로직을 관리하는 Composable
 * 단일책임: 위치 정보 관리, 지도 관련 기능
 */
export const useLocation = () => {
  // 상태
  const currentLocation = ref({
    name: '한진빌딩',
    address: '서울특별시 중구 남대문로 63',
    lat: 37.5665,
    lng: 126.9780
  });
  const distanceInfo = ref(null);
  const loading = ref(false);

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          currentLocation.value = {
            name: '현재 위치',
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            lat: lat,
            lng: lng
          };
          console.log('현재 위치 업데이트:', currentLocation.value);
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error);
          // alert 대신 콘솔 로그만 출력하고 기본 위치 사용
          console.warn('위치 정보 접근 실패, 기본 위치 사용:', currentLocation.value);
        }
      );
    } else {
      console.warn('이 브라우저는 위치 정보를 지원하지 않습니다. 기본 위치 사용:', currentLocation.value);
    }
  };

  // 네이버 지도 열기
  const openNaverMap = (restaurant) => {
    if (!restaurant || !restaurant.lat || !restaurant.lng) {
      console.warn('음식점 위치 정보가 없습니다.');
      return;
    }

    const naverMapUrl = `https://map.naver.com/v5/search/${encodeURIComponent(restaurant.name)}`;
    window.open(naverMapUrl, '_blank');
    console.log('네이버 지도 열기:', restaurant.name);
  };

  // 카카오 지도 열기
  const openKakaoMap = (restaurant) => {
    if (!restaurant || !restaurant.lat || !restaurant.lng) {
      console.warn('음식점 위치 정보가 없습니다.');
      return;
    }

    const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(restaurant.name)}`;
    window.open(kakaoMapUrl, '_blank');
    console.log('카카오 지도 열기:', restaurant.name);
  };

  // 거리 계산 완료 핸들러
  const onDistanceCalculated = (distanceInfo) => {
    console.log('거리 계산 완료:', distanceInfo);
    // 거리 정보를 상태에 저장하거나 다른 로직 처리
  };

  // 위치 업데이트
  const updateLocation = (location) => {
    currentLocation.value = location;
    console.log('위치 업데이트:', location);
  };

  return {
    // 상태
    currentLocation,
    distanceInfo,
    loading,
    
    // 메서드
    getCurrentLocation,
    openNaverMap,
    openKakaoMap,
    onDistanceCalculated,
    updateLocation
  };
};
