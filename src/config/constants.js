/**
 * 애플리케이션 상수 정의
 * 식충이 캘린더 v2.0
 */

// 기본 위치 정보
export const DEFAULT_LOCATION = {
  name: '한진빌딩',
  address: '서울특별시 중구 남대문로 63',
  lat: 37.5665,
  lng: 126.9780
};

// 기본 사용자 정보
export const DEFAULT_USER = {
  id: 'guest',
  name: '게스트',
  email: '',
  avatar: null,
  expenses: { 
    ticketPoints: 0, 
    cash: 0 
  },
  location: DEFAULT_LOCATION
};

// 기본 그룹 정보
export const DEFAULT_GROUP = {
  id: 'default-group',
  name: 'DT 4인방',
  description: '기본 그룹',
  members: [],
  createdBy: 'system',
  createdAt: new Date(),
  isActive: true
};
