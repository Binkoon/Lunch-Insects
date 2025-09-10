/**
 * 네이버 지도 API 간단한 서비스
 * CORS 문제 해결을 위한 프록시 사용
 */

// 환경변수에서 API 키 가져오기
const CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID
const CLIENT_SECRET = import.meta.env.VITE_NAVER_MAP_CLIENT_SECRET

// API 키 유효성 검사
if (!CLIENT_ID || CLIENT_ID === 'your_naver_map_client_id_here') {
  console.warn('⚠️ 네이버 지도 API 키가 설정되지 않았습니다. .env 파일을 확인하세요.')
} else {
  console.log('✅ 네이버 Maps API v3 키 설정됨:', CLIENT_ID.substring(0, 8) + '...')
}

/**
 * 네이버 Maps API 호출 (새로운 API 구조)
 */
export const callNaverAPI = async (endpoint, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString()
    const url = `/api/naver-maps${endpoint}?${queryString}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-NCP-APIGW-API-KEY-ID': CLIENT_ID,
        'X-NCP-APIGW-API-KEY': CLIENT_SECRET
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API 호출 실패: ${response.status}`, errorText)
      throw new Error(`API 호출 실패: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('네이버 API 호출 오류:', error)
    throw error
  }
}

/**
 * 경로 검색 (Direction API)
 */
export const getDirections = async (start, goal) => {
  try {
    // 기존 Directions API 사용
    const result = await callNaverAPI('/map-direction/v1/driving', {
      start: `${start.lat},${start.lng}`,
      goal: `${goal.lat},${goal.lng}`,
      option: 'trafast'
    })
    
    
    if (result.route && result.route.traoptimal && result.route.traoptimal.length > 0) {
      const route = result.route.traoptimal[0]
      return {
        distance: route.summary.distance,
        duration: route.summary.duration,
        success: true
      }
    }
    
    return { success: false, error: '경로를 찾을 수 없습니다.' }
  } catch (error) {
    console.error('경로 검색 실패:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 주소 검색 (Geocoding API)
 */
export const geocodeAddress = async (address) => {
  try {
    // 기존 Geocoding API 사용
    const result = await callNaverAPI('/map-geocode/v2/geocode', {
      query: address
    })
    
    
    if (result.addresses && result.addresses.length > 0) {
      const addr = result.addresses[0]
      return {
        lat: parseFloat(addr.y),
        lng: parseFloat(addr.x),
        address: addr.roadAddress || addr.jibunAddress,
        success: true
      }
    }
    
    return { success: false, error: '주소를 찾을 수 없습니다.' }
  } catch (error) {
    console.error('주소 검색 실패:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 음식점 검색 (정확한 위치 찾기)
 * 체인점의 경우 지점명과 주소를 함께 사용
 */
export const searchRestaurant = async (restaurantName, branchName = '', address = '') => {
  try {
    // 검색 쿼리 구성
    let searchQuery = restaurantName
    if (branchName) {
      searchQuery += ` ${branchName}`
    }
    if (address) {
      searchQuery += ` ${address}`
    }
    
    // 네이버 지도 검색 API 사용
    const result = await callNaverAPI('/maps/v3/search', {
      query: searchQuery,
      type: 'place'
    })
    
    if (result.places && result.places.length > 0) {
      const place = result.places[0]
      return {
        success: true,
        name: place.name,
        address: place.address,
        location: {
          latitude: parseFloat(place.y),
          longitude: parseFloat(place.x)
        },
        phone: place.phone || '',
        category: place.category || '',
        rating: place.rating || 0
      }
    }
    
    return { success: false, error: '음식점을 찾을 수 없습니다.' }
  } catch (error) {
    console.error('음식점 검색 실패:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 네이버 지도 스크립트 로드 (CORS 오류 방지)
 */
export const loadNaverMapScript = () => {
  return new Promise((resolve, reject) => {
    if (window.naver && window.naver.maps) {
      console.log('✅ 네이버 지도 이미 로드됨')
      resolve()
      return
    }
    
    // API 키가 없으면 에러
    if (!CLIENT_ID || CLIENT_ID === 'your_naver_map_client_id_here') {
      const error = new Error('네이버 지도 API 키가 설정되지 않았습니다.')
      console.error('❌', error.message)
      reject(error)
      return
    }
    
    // 콜백 함수를 전역으로 등록
    window.naverMapCallback = () => {
      console.log('✅ 네이버 지도 API v3 로드 완료')
      delete window.naverMapCallback
      resolve()
    }
    
    // 네이버 지도 API v3 스크립트 로드 (콜백 방식)
    const script = document.createElement('script')
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${CLIENT_ID}&callback=naverMapCallback`
    script.crossOrigin = 'anonymous'
    
    script.onerror = (error) => {
      console.error('❌ 네이버 지도 스크립트 로드 실패:', error)
      delete window.naverMapCallback
      reject(new Error('네이버 지도 스크립트 로드 실패'))
    }
    
    document.head.appendChild(script)
  })
}

/**
 * 간단한 거리 계산 (Haversine 공식)
 * API 호출 없이 직선 거리 계산
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371 // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c
  
  return {
    distance: Math.round(distance * 1000), // 미터로 변환
    duration: Math.round(distance * 12), // 대략적인 도보 시간 (분)
    success: true
  }
}
