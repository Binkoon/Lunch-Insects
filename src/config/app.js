// 앱 전역 설정
export const APP_CONFIG = {
  // 기본 위치 (서울 중구)
  DEFAULT_LOCATION: {
    lat: 37.563,
    lng: 126.9815
  },
  
  // 점심시간 설정 (분)
  LUNCH_TIME_MINUTES: 75,
  
  // 음식 준비 시간 범위 (분)
  FOOD_PREP_TIME: {
    min: 5,
    max: 10
  },
  
  // 도보 시간 보정 계수 (1km당 분)
  WALKING_TIME_FACTOR: 12,
  
  // 도보 시간 보정 임계값 (정상 시간의 배수)
  WALKING_TIME_THRESHOLD: 2,
  
  // 캘린더 설정
  CALENDAR: {
    height: 400,
    dayButtonHeight: 250,
    minDayWidth: 140
  },
  
  // 지도 설정
  MAP: {
    height: 400,
    zoom: 15.5
  },
  
  // 모달 설정
  MODAL: {
    width: 420,
    padding: 20,
    borderRadius: 10
  },
  
  // 애니메이션 설정
  ANIMATION: {
    duration: 300,
    easing: 'ease-in-out'
  }
};

// API 엔드포인트 설정
export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  // 향후 무료 지도 API 엔드포인트 추가 예정
};

// 기본 공휴일 설정
export const DEFAULT_HOLIDAYS = {
  "01-01": "신정",
  "03-01": "삼일절", 
  "05-05": "어린이날",
  "06-06": "현충일",
  "08-15": "광복절",
  "10-03": "개천절",
  "10-09": "한글날",
  "12-25": "크리스마스"
};
