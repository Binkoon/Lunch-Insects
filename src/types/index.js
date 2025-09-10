/**
 * 식충이 캘린더 v2.0 - 데이터 타입 정의
 */

// 사용자 정보
export const User = {
  id: String,
  name: String,
  email: String,
  avatar: String,
  preferences: {
    favoriteCategories: [String], // ['한식', '일식', '양식', '중식']
    maxWalkingTime: Number, // 최대 도보 시간 (분)
    budget: {
      min: Number,
      max: Number
    },
    dietaryRestrictions: [String] // ['채식', '할랄', '글루텐프리']
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  createdAt: Date,
  lastActiveAt: Date
};

// 그룹 정보
export const Group = {
  id: String,
  name: String,
  description: String,
  members: [String], // User IDs
  admins: [String], // User IDs
  settings: {
    defaultMeetingTime: String, // "12:00"
    notificationEnabled: Boolean,
    autoRecommend: Boolean
  },
  createdAt: Date,
  updatedAt: Date
};

// 음식점 정보
export const Restaurant = {
  id: String,
  name: String, // 음식점 이름 (예: "바스버거")
  branchName: String, // 지점명 (예: "서소문시청역점")
  fullName: String, // 전체 이름 (예: "바스버거 서소문시청역점")
  category: String, // '한식', '일식', '양식', '중식', '카페', '패스트푸드'
  address: String, // 상세 주소
  location: {
    latitude: Number,
    longitude: Number
  },
  phone: String,
  rating: Number, // 1-5
  priceRange: String, // '저렴', '보통', '비쌈'
  images: [String], // 이미지 URL 배열
  features: [String], // ['와이파이', '주차', '단체석', '배달']
  openingHours: {
    monday: String,
    tuesday: String,
    wednesday: String,
    thursday: String,
    friday: String,
    saturday: String,
    sunday: String
  },
  menu: [{
    name: String,
    price: Number,
    description: String,
    image: String
  }],
  partnership: {
    hasDiscount: Boolean,
    discountRate: Number,
    description: String
  },
  distance: Number, // 현재 위치에서의 거리 (미터)
  walkingTime: Number, // 도보 시간 (분)
  createdAt: Date,
  updatedAt: Date
};

// 일정 정보
export const Schedule = {
  id: String,
  groupId: String,
  date: String, // YYYY-MM-DD
  time: String, // HH:MM
  type: String, // 'lunch', 'meeting', 'free', 'busy'
  title: String,
  description: String,
  participants: [String], // User IDs
  restaurant: String, // Restaurant ID (선택사항)
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  status: String, // 'confirmed', 'pending', 'cancelled'
  createdAt: Date,
  updatedAt: Date
};

// 메뉴 기록
export const MenuRecord = {
  id: String,
  userId: String,
  groupId: String,
  restaurantId: String,
  menuName: String,
  category: String,
  price: Number,
  rating: Number, // 1-5
  review: String,
  images: [String],
  date: String, // YYYY-MM-DD
  createdAt: Date
};

// 알림 정보
export const Notification = {
  id: String,
  userId: String,
  groupId: String,
  type: String, // 'schedule_reminder', 'group_invite', 'restaurant_recommendation'
  title: String,
  message: String,
  data: Object, // 추가 데이터
  read: Boolean,
  createdAt: Date
};

// 그룹 초대
export const GroupInvite = {
  id: String,
  groupId: String,
  inviterId: String,
  inviteeEmail: String,
  status: String, // 'pending', 'accepted', 'declined', 'expired'
  expiresAt: Date,
  createdAt: Date
};

// 사용자 선호도 (AI 추천용)
export const UserPreference = {
  userId: String,
  groupId: String,
  categoryPreferences: {
    [String]: Number // 카테고리별 선호도 점수 (0-100)
  },
  pricePreferences: {
    [String]: Number // 가격대별 선호도 점수
  },
  timePreferences: {
    [String]: Number // 시간대별 선호도 점수
  },
  lastUpdated: Date
};

// 통계 데이터
export const Statistics = {
  userId: String,
  groupId: String,
  period: String, // 'week', 'month', 'year'
  data: {
    totalVisits: Number,
    favoriteCategories: [String],
    averageSpending: Number,
    mostVisitedRestaurants: [String],
    participationRate: Number // 그룹 일정 참여율
  },
  createdAt: Date
};
