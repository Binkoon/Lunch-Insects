// 차트 색상 상수
export const CHART_COLORS = {
  primary: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12'],
  secondary: ['#e74c3c', '#9b59b6', '#2ecc71', '#f1c40f'],
  ticket: '#3b82f6',
  cash: '#4ecdc4'
};

// 카테고리 이름 매핑
export const CATEGORY_NAMES = {
  'korean': '한식',
  'chinese': '중식',
  'japanese': '일식',
  'western': '양식',
  'fastfood': '치킨/햄버거/피자',
  'buffet': '뷔페',
  'cafe': '카페'
};

// 차트 옵션 상수
export const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  }
};

// 분기별 라벨 생성 함수
export const generateQuarterLabels = (startDate, endDate) => {
  const labels = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // 분기별로 라벨 생성
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  
  while (current <= end) {
    const quarter = Math.floor(current.getMonth() / 3) + 1;
    const year = current.getFullYear();
    labels.push(`${year}년 Q${quarter}`);
    
    // 다음 분기로 이동
    current.setMonth(current.getMonth() + 3);
  }
  
  return labels;
};

// 현재 연도 기준 분기별 라벨
export const getCurrentYearQuarterLabels = () => {
  const currentYear = new Date().getFullYear();
  return [
    `${currentYear}년 Q1`,
    `${currentYear}년 Q2`, 
    `${currentYear}년 Q3`,
    `${currentYear}년 Q4`
  ];
};

// 월별 라벨 (하위 호환성을 위해 유지)
export const generateMonthLabels = (startDate, endDate) => {
  const labels = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  
  while (current <= end) {
    labels.push(`${current.getMonth() + 1}월`);
    current.setMonth(current.getMonth() + 1);
  }
  
  return labels;
};

// 현재 연도 기준 월별 라벨
export const getCurrentYearMonthLabels = () => {
  return Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
};

// 차트 애니메이션 설정
export const CHART_ANIMATION = {
  duration: 0, // 애니메이션 없이 즉시 업데이트
  easing: 'linear'
};
