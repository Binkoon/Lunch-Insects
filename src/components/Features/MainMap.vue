<template>
  <div class="main-map-container">
    <div v-if="loading" class="map-loading">
      <div class="loading-spinner"></div>
      <span>지도를 불러오는 중...</span>
    </div>
    <div v-if="error" class="map-error">
      <p>{{ error }}</p>
      <button @click="initMap" class="retry-btn">다시 시도</button>
    </div>
    <div id="main-map" ref="mapContainer" class="main-map"></div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { loadNaverMapScript, geocodeAddress } from '@/services/naverMapSimple.js'
import { getRestaurantLocations } from '@/services/firebaseDBv2.js'

export default {
  name: 'MainMap',
  props: {
    restaurants: {
      type: Array,
      default: () => []
    }
  },
  emits: ['restaurant-click'],
  setup(props, { emit }) {
    const mapContainer = ref(null)
    const loading = ref(false)
    const error = ref('')
    const map = ref(null)
    const markers = ref([])

    // 한진빌딩 중심 좌표 (서울특별시 중구 남대문로 63) - 네이버 지도 정확한 좌표
    const centerLocation = {
      lat: 37.5636,
      lng: 126.9780,
      name: '한진빌딩',
      address: '서울특별시 중구 남대문로 63'
    }

    // 지도 초기화
    const initMap = async () => {
      try {
        loading.value = true
        error.value = ''
        
        // 네이버 지도 스크립트 로드
        await loadNaverMapScript()
        
        if (!mapContainer.value) {
          throw new Error('지도 컨테이너를 찾을 수 없습니다.')
        }
        
        // 한진빌딩 정확한 좌표 사용
        const mapCenter = new naver.maps.LatLng(centerLocation.lat, centerLocation.lng)

        // 지도 초기화
        const mapOptions = {
          center: mapCenter,
          zoom: 15,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: naver.maps.MapTypeControlStyle.BUTTON,
            position: naver.maps.Position.TOP_RIGHT
          },
          zoomControl: true,
          zoomControlOptions: {
            style: naver.maps.ZoomControlStyle.SMALL,
            position: naver.maps.Position.RIGHT_CENTER
          }
        }
        
        map.value = new naver.maps.Map(mapContainer.value, mapOptions)
        
        // 한진빌딩 마커 추가
        addCenterMarker()
        
        // 음식점 마커들 추가
        await addRestaurantMarkers()
        
      } catch (err) {
        error.value = '지도 로드 실패: ' + err.message
        console.error('지도 초기화 실패:', err)
      } finally {
        loading.value = false
      }
    }

    // 한진빌딩 중심 마커 추가
    const addCenterMarker = () => {
      if (!map.value) return

      // 한진빌딩 정확한 좌표 사용
      const centerMarker = new naver.maps.Marker({
        position: new naver.maps.LatLng(centerLocation.lat, centerLocation.lng),
        map: map.value,
        title: centerLocation.name,
        icon: {
          content: `
            <div style="
              width: 0;
              height: 0;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-bottom: 16px solid #3b82f6;
              position: relative;
            ">
              <div style="
                position: absolute;
                top: 16px;
                left: -20px;
                background: #3b82f6;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: bold;
                white-space: nowrap;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              ">
                🏢 ${centerLocation.name}
              </div>
            </div>
          `,
          anchor: new naver.maps.Point(8, 16)
        }
      })
    }

    // 음식점 마커들 추가
    const addRestaurantMarkers = async () => {
      if (!map.value || !props.restaurants.length) return

      // 기존 마커들 제거
      markers.value.forEach(marker => marker.setMap(null))
      markers.value = []

      // 바스버거 테스트용 - 주소를 좌표로 변환
      const testRestaurant = props.restaurants.find(r => r.name.includes('바스버거'))
      if (testRestaurant && testRestaurant.address) {
        // 정확한 좌표 가져오기
        const coordinates = getRestaurantCoordinates(testRestaurant.name, testRestaurant.address)
        if (coordinates.success) {
          const marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(coordinates.lat, coordinates.lng),
            map: map.value,
            title: testRestaurant.name,
            icon: {
              content: `
                <div style="
                  background: #ff6b6b;
                  color: white;
                  padding: 8px 12px;
                  border-radius: 20px;
                  font-size: 12px;
                  font-weight: bold;
                  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
                  white-space: nowrap;
                  border: 2px solid white;
                  cursor: pointer;
                ">
                  🍽️ ${testRestaurant.name}
                </div>
              `,
              anchor: new naver.maps.Point(0, 0)
            }
          })

          // 마커 클릭 이벤트 - 거리 정보 포함
          naver.maps.Event.addListener(marker, 'click', () => {
            const restaurantWithDistance = {
              ...testRestaurant,
              distance: testRestaurant.distance || '거리 정보 없음'
            }
            emit('restaurant-click', restaurantWithDistance)
          })

          // 정보창 생성
          const infoWindow = new naver.maps.InfoWindow({
            content: `
              <div style="
                padding: 12px;
                min-width: 200px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border: 1px solid #e5e7eb;
              ">
                <div style="
                  font-weight: bold;
                  font-size: 14px;
                  color: #1f2937;
                  margin-bottom: 8px;
                ">
                  🍽️ ${testRestaurant.name}
                </div>
                <div style="
                  font-size: 12px;
                  color: #6b7280;
                  margin-bottom: 4px;
                ">
                  📍 ${testRestaurant.address}
                </div>
                <div style="
                  font-size: 12px;
                  color: #059669;
                  font-weight: 500;
                ">
                  🚶 한진빌딩에서 ${testRestaurant.distance || '거리 정보 없음'}
                </div>
              </div>
            `,
            anchorSize: new naver.maps.Size(10, 10),
            anchorOffset: new naver.maps.Point(0, 0)
          })

          // 마커 호버 이벤트
          naver.maps.Event.addListener(marker, 'mouseover', () => {
            infoWindow.open(map.value, marker)
          })

          naver.maps.Event.addListener(marker, 'mouseout', () => {
            infoWindow.close()
          })

          markers.value.push(marker)
        }
      }
    }

    // 음식점별 정확한 좌표 매핑
    const getRestaurantCoordinates = (restaurantName, address) => {
      // 바스버거 서소문시청역점 정확한 좌표
      if (restaurantName.includes('바스버거') && address.includes('다동길')) {
        return {
          success: true,
          lat: 37.5636,
          lng: 126.9769
        }
      }
      
      // 다른 음식점들은 geocoding 사용
      return { success: false }
    }

    // 음식점 데이터 변경 감지
    watch(() => props.restaurants, () => {
      if (map.value) {
        addRestaurantMarkers()
      }
    }, { deep: true })

    onMounted(() => {
      initMap()
    })

    onUnmounted(() => {
      // 마커들 정리
      markers.value.forEach(marker => marker.setMap(null))
    })

    return {
      mapContainer,
      loading,
      error,
      initMap
    }
  }
}
</script>

<style scoped>
.main-map-container {
  position: relative;
  width: 100%;
  height: 500px;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.main-map {
  width: 100%;
  height: 100%;
}

.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #ff6b6b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.map-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #dc2626;
  background: #fef2f2;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #fecaca;
}

.retry-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #ff6b6b;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.retry-btn:hover {
  background: #ef4444;
}
</style>
