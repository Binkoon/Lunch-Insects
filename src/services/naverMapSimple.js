/**
 * 네이버 지도 API 간단한 서비스
 * CORS 문제 해결을 위한 프록시 사용
 */

// 환경변수에서 API 키 가져오기
const CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID
const CLIENT_SECRET = import.meta.env.VITE_NAVER_MAP_CLIENT_SECRET

/**
 * 네이버 지도 API 호출 (프록시 사용)
 */
export const callNaverAPI = async (endpoint, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString()
    const url = `/api/naver${endpoint}?${queryString}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    if (!response.ok) {
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
 * 네이버 지도 스크립트 로드
 */
export const loadNaverMapScript = () => {
  return new Promise((resolve, reject) => {
    if (window.naver && window.naver.maps) {
      resolve()
      return
    }
    
    const script = document.createElement('script')
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${CLIENT_ID}`
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('네이버 지도 스크립트 로드 실패'))
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
