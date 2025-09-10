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

// 고정 공휴일 (매년 같은 날짜)
export const FIXED_HOLIDAYS = {
  '01-01': '신정',
  '03-01': '삼일절',
  '05-05': '어린이날',
  '06-06': '현충일',
  '08-15': '광복절',
  '10-03': '개천절',
  '10-09': '한글날',
  '12-25': '성탄절'
};

// 2025년 특별 공휴일 (설날, 추석 등)
export const HOLIDAYS_2025 = [
  '2025-01-01', // 신정
  '2025-01-28', // 설날 연휴
  '2025-01-29', // 설날
  '2025-01-30', // 설날 연휴
  '2025-03-01', // 삼일절
  '2025-05-05', // 어린이날
  '2025-05-12', // 부처님오신날
  '2025-06-06', // 현충일
  '2025-08-15', // 광복절
  '2025-10-03', // 개천절
  '2025-10-05', // 추석 연휴
  '2025-10-06', // 추석
  '2025-10-07', // 추석 연휴
  '2025-10-08', // 추석 대체휴일
  '2025-10-09', // 한글날
  '2025-12-25'  // 성탄절
];

// 공휴일 유틸리티 함수들
export const HolidayUtils = {
  // 특정 연도의 공휴일 목록 생성
  getHolidaysForYear: (year) => {
    const holidays = [];
    
    // 고정 공휴일 추가
    Object.keys(FIXED_HOLIDAYS).forEach(monthDay => {
      holidays.push(`${year}-${monthDay}`);
    });
    
    // 특별 공휴일 추가 (해당 연도인 경우만)
    if (year === 2025) {
      holidays.push(...HOLIDAYS_2025);
    }
    
    return [...new Set(holidays)]; // 중복 제거
  },
  
  // 날짜가 공휴일인지 확인
  isHoliday: (dateStr, year = new Date().getFullYear()) => {
    const holidays = HolidayUtils.getHolidaysForYear(year);
    return holidays.includes(dateStr);
  },
  
  // 주말 또는 공휴일인지 확인
  isWeekendOrHoliday: (dateStr, dayOfWeek, year = new Date().getFullYear()) => {
    // 특별 처리: 2025년 9월 8일은 평일로 처리
    if (dateStr === '2025-09-08') return false;
    
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 일요일=0, 토요일=6
    const isHolidayDate = HolidayUtils.isHoliday(dateStr, year);
    return isWeekend || isHolidayDate;
  }
};