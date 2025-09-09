<template>
  <div class="naver-map-container">
    <div id="naver-map" ref="mapContainer" class="map"></div>
    <div v-if="loading" class="loading">지도 로딩 중...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { loadNaverMapScript, getDirections, calculateDistance } from '@/services/naverMapSimple.js'

export default {
  name: 'NaverMapSimple',
  props: {
    lat: {
      type: Number,
      default: 37.5665
    },
    lng: {
      type: Number,
      default: 126.9780
    },
    restaurant: {
      type: Object,
      default: null
    }
  },
  emits: ['distance-calculated'],
  setup(props, { emit }) {
    const mapContainer = ref(null)
    const loading = ref(false)
    const error = ref('')
    const map = ref(null)

    const initMap = async () => {
      try {
        loading.value = true
        error.value = ''
        
        // 네이버 지도 스크립트 로드
        await loadNaverMapScript()
        
        // 지도 초기화
        const mapOptions = {
          center: new naver.maps.LatLng(props.lat, props.lng),
          zoom: 15
        }
        
        map.value = new naver.maps.Map(mapContainer.value, mapOptions)
        
        // 현재 위치 마커
        const currentMarker = new naver.maps.Marker({
          position: new naver.maps.LatLng(props.lat, props.lng),
          map: map.value,
          title: '현재 위치'
        })
        
        // 음식점 마커 (있는 경우)
        if (props.restaurant && props.restaurant.location) {
          const restaurantMarker = new naver.maps.Marker({
            position: new naver.maps.LatLng(
              props.restaurant.location.latitude, 
              props.restaurant.location.longitude
            ),
            map: map.value,
            title: props.restaurant.name
          })
          
          // 거리 계산
          const distance = calculateDistance(
            props.lat, props.lng,
            props.restaurant.location.latitude,
            props.restaurant.location.longitude
          )
          
          emit('distance-calculated', distance)
        }
        
      } catch (err) {
        error.value = '지도 로드 실패: ' + err.message
        console.error('지도 초기화 실패:', err)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      initMap()
    })

    onUnmounted(() => {
      if (map.value) {
        map.value = null
      }
    })

    return {
      mapContainer,
      loading,
      error
    }
  }
}
</script>

<style scoped>
.naver-map-container {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 100%;
}

.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  z-index: 1000;
}

.error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ef4444;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  z-index: 1000;
}
</style>
