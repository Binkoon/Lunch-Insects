<template>
  <div class="naver-map-container">
    <div id="naver-map" ref="mapContainer" class="map"></div>
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>지도 로딩 중...</p>
    </div>
    <div v-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="retryLoad" class="retry-btn">다시 시도</button>
    </div>
    
    <!-- 거리/시간 정보 -->
    <div v-if="distanceInfo && !loading" class="distance-info">
      <div class="distance-item">
        <span class="distance-icon">📏</span>
        <span class="distance-text">{{ distanceInfo.distance }}m</span>
      </div>
      <div class="distance-item">
        <span class="distance-icon">⏱️</span>
        <span class="distance-text">{{ distanceInfo.duration }}분</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { loadNaverMapScript, getDirections, calculateDistance } from '@/services/naverMapSimple.js'

export default {
  name: 'NaverMap',
  props: {
    restaurant: {
      type: Object,
      required: true
    },
    currentLocation: {
      type: Object,
      default: () => ({ lat: 37.5665, lng: 126.9780 }) // 서울시청 기본값
    }
  },
  emits: ['distance-calculated'],
  setup(props, { emit }) {
    const mapContainer = ref(null)
    const loading = ref(false)
    const error = ref('')
    const map = ref(null)
    const distanceInfo = ref(null)

    const initMap = async () => {
      try {
        loading.value = true
        error.value = ''
        
        // 네이버 지도 스크립트 로드
        await loadNaverMapScript()
        
        if (!props.restaurant?.location) {
          throw new Error('음식점 위치 정보가 없습니다.')
        }
        
        // 지도 초기화
        const mapOptions = {
          center: new naver.maps.LatLng(
            props.restaurant.location.latitude, 
            props.restaurant.location.longitude
          ),
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
        
        // 음식점 마커
        const restaurantMarker = new naver.maps.Marker({
          position: new naver.maps.LatLng(
            props.restaurant.location.latitude, 
            props.restaurant.location.longitude
          ),
          map: map.value,
          title: props.restaurant.name,
          icon: {
            content: `
              <div style="
                background: #ff6b6b;
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                white-space: nowrap;
              ">
                🍽️ ${props.restaurant.name}
              </div>
            `,
            anchor: new naver.maps.Point(0, 0)
          }
        })
        
        // 현재 위치 마커
        const currentMarker = new naver.maps.Marker({
          position: new naver.maps.LatLng(props.currentLocation.lat, props.currentLocation.lng),
          map: map.value,
          title: '현재 위치',
          icon: {
            content: `
              <div style="
                background: #3b82f6;
                color: white;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                white-space: nowrap;
              ">
                📍 현재 위치
              </div>
            `,
            anchor: new naver.maps.Point(0, 0)
          }
        })
        
        // 거리 계산
        await calculateDistanceInfo()
        
      } catch (err) {
        error.value = '지도 로드 실패: ' + err.message
        console.error('지도 초기화 실패:', err)
      } finally {
        loading.value = false
      }
    }

    const calculateDistanceInfo = async () => {
      try {
        if (!props.restaurant?.location) return
        
        // 먼저 직선 거리 계산 (빠름)
        const straightDistance = calculateDistance(
          props.currentLocation.lat,
          props.currentLocation.lng,
          props.restaurant.location.latitude,
          props.restaurant.location.longitude
        )
        
        distanceInfo.value = straightDistance
        emit('distance-calculated', straightDistance)
        
        // 그 다음 실제 경로로 거리 계산 (느림)
        try {
          const routeDistance = await getDirections(
            { lat: props.currentLocation.lat, lng: props.currentLocation.lng },
            { lat: props.restaurant.location.latitude, lng: props.restaurant.location.longitude }
          )
          
          if (routeDistance.success) {
            distanceInfo.value = {
              distance: routeDistance.distance,
              duration: Math.round(routeDistance.duration / 60), // 초를 분으로 변환
              success: true
            }
            emit('distance-calculated', distanceInfo.value)
          }
        } catch (routeError) {
          console.log('경로 검색 실패, 직선 거리 사용:', routeError)
        }
        
      } catch (err) {
        console.error('거리 계산 실패:', err)
      }
    }

    const retryLoad = () => {
      initMap()
    }

    // 음식점이 변경되면 지도 다시 초기화
    watch(() => props.restaurant, () => {
      if (props.restaurant) {
        initMap()
      }
    }, { deep: true })

    onMounted(() => {
      if (props.restaurant) {
        initMap()
      }
    })

    onUnmounted(() => {
      if (map.value) {
        map.value = null
      }
    })

    return {
      mapContainer,
      loading,
      error,
      distanceInfo,
      retryLoad
    }
  }
}
</script>

<style scoped>
.naver-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(248, 250, 252, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading p {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
}

.error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(239, 68, 68, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.error p {
  color: #dc2626;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  text-align: center;
}

.retry-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.retry-btn:hover {
  background: #b91c1c;
}

.distance-info {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.95);
  padding: 0.75rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  z-index: 100;
}

.distance-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #374151;
}

.distance-icon {
  font-size: 1rem;
}

.distance-text {
  font-weight: 600;
}
</style>
