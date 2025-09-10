import { ref, computed, watch } from 'vue';
import { HolidayUtils } from '@/config/constants.js';

/**
 * 캘린더 관련 비즈니스 로직을 관리하는 Composable
 * 단일책임: 캘린더 데이터 관리, 날짜 계산, 멤버 상태 관리
 */
export const useCalendar = (props, emit) => {
  // 상태
  const currentDate = ref(new Date());
  const selectedDay = ref(null);
  const memberStatuses = ref({});
  const actualMembers = ref([]);
  const restaurants = ref([]);
  const proposals = ref([]);
  const loading = ref(false);

  // 계산된 속성
  const currentMonthText = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth() + 1;
    return `${year}년 ${month}월`;
  });

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  // 캘린더 날짜 생성
  const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();
    
    // 이번 달의 첫째 날과 마지막 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 이번 달의 첫째 날이 시작하는 요일 (0=일요일)
    const startDay = firstDay.getDay();
    
    // 이번 달의 마지막 날
    const lastDate = lastDay.getDate();
    
    const days = [];
    
    // 이전 달의 마지막 날들 (빈 칸 채우기)
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push(createDayObject(date, true));
    }
    
    // 이번 달의 모든 날들
    for (let date = 1; date <= lastDate; date++) {
      const dayDate = new Date(year, month, date);
      days.push(createDayObject(dayDate, false));
    }
    
    // 다음 달의 첫째 날들 (빈 칸 채우기)
    const remainingDays = 42 - days.length; // 6주 * 7일 = 42일
    for (let date = 1; date <= remainingDays; date++) {
      const dayDate = new Date(year, month + 1, date);
      days.push(createDayObject(dayDate, true));
    }
    
    return days;
  });

  // 날짜 객체 생성
  const createDayObject = (date, isOtherMonth) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = HolidayUtils.isHoliday(dateStr);
    const isWeekendOrHoliday = isWeekend || isHoliday;
    const isToday = isTodayDate(date);
    
    return {
      date: dateStr,
      day: date.getDate(),
      isOtherMonth,
      isWeekend,
      isHoliday,
      isWeekendOrHoliday,
      isToday,
      availableMembers: actualMembers.value.map(m => m.id)
    };
  };

  // 오늘 날짜 확인
  const isTodayDate = (date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  // 공휴일 확인
  const isHoliday = (dateStr) => {
    return HolidayUtils.isHoliday(dateStr);
  };

  // 주말 또는 공휴일 확인
  const isWeekendOrHoliday = (dateStr, dayOfWeek) => {
    return HolidayUtils.isWeekendOrHoliday(dateStr, dayOfWeek);
  };

  // 날짜 포맷팅
  const formatSelectedDate = (dateStr) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  };

  // 요일 가져오기
  const getDayOfWeek = (dateStr) => {
    const date = new Date(dateStr);
    return weekdays[date.getDay()];
  };

  // 월 이동
  const prevMonth = async () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
  };

  const nextMonth = async () => {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
  };

  // 날짜 선택
  const selectDay = (day) => {
    selectedDay.value = day;
    emit('date-selected', day.date);
  };

  // 상세 정보 닫기
  const closeDetails = () => {
    selectedDay.value = null;
  };

  // 멤버 상태 관련 함수들
  const getMemberStatusClass = (day, memberId) => {
    const status = memberStatuses.value[day.date]?.[memberId]?.status;
    if (!status) return '';
    
    const statusClasses = {
      'available': 'status-available',
      'vacation': 'status-vacation',
      'solo': 'status-solo',
      'skip': 'status-skip',
      'other': 'status-other'
    };
    
    return statusClasses[status] || '';
  };

  const getMemberStatusText = (day, memberId) => {
    const memberStatus = memberStatuses.value[day.date]?.[memberId]?.status;
    const statusTexts = {
      'available': '가능',
      'vacation': '휴가',
      'solo': '혼밥',
      'skip': 'Skip',
      'other': '선약'
    };
    return statusTexts[memberStatus] || '미정';
  };

  const getMemberRestaurant = (day, memberId) => {
    const memberStatus = memberStatuses.value[day.date]?.[memberId];
    if (memberStatus?.status === 'available' && memberStatus?.details?.restaurant) {
      return memberStatus.details.restaurant;
    }
    return null;
  };

  const getMemberStatus = (day, memberId) => {
    return memberStatuses.value[day.date]?.[memberId]?.status || '';
  };

  // 제안 관련 함수들
  const getProposalsForDay = (date) => {
    return proposals.value.filter(proposal => proposal.date === date);
  };

  const getProposalStatus = (proposal) => {
    const totalMembers = actualMembers.value.length;
    const acceptedCount = proposal.votes.accepted.length;
    const rejectedCount = proposal.votes.rejected.length;
    
    if (rejectedCount > 0) {
      return 'rejected';
    } else if (acceptedCount >= Math.ceil(totalMembers / 2)) {
      return 'confirmed';
    } else {
      return 'pending';
    }
  };

  const getProposalIcon = (proposal) => {
    const status = getProposalStatus(proposal);
    switch (status) {
      case 'confirmed': return '🎉';
      case 'rejected': return '❌';
      case 'pending': 
      default: return '⏳';
    }
  };

  const getConfirmedMealForDay = (date) => {
    const confirmedProposal = proposals.value.find(p => 
      p.date === date && getProposalStatus(p) === 'confirmed'
    );
    return confirmedProposal?.restaurant.name || null;
  };

  // 이벤트 관련 함수들
  const getDayEvents = (date) => {
    // TODO: Firebase 이벤트 연동 시 교체
    return [];
  };

  const getDayMemo = (date) => {
    // TODO: Firebase 메모 연동 시 교체
    return '';
  };

  const getEventIcon = (type) => {
    const icons = {
      'meal': '🍽️',
      'vacation': '🏖️',
      'other': '📅'
    };
    return icons[type] || '📝';
  };

  // 음식점 관련 함수들
  const selectRestaurant = (restaurant) => {
    // 음식점 선택 로직
    console.log('음식점 선택:', restaurant);
  };

  const getAvailableMembersForDay = (day) => {
    return actualMembers.value.filter(member => 
      day.availableMembers.includes(member.id)
    );
  };

  // 데이터 로드 함수들
  const loadMemberNames = async (members) => {
    try {
      if (!members || members.length === 0) {
        actualMembers.value = [];
        return;
      }

      const memberPromises = members.map(async (member) => {
        // 이미 객체 형태이고 이름이 있는 경우
        if (typeof member === 'object') {
          const memberId = member.id || member.uid || member.userId || member;
          return {
            id: memberId,
            name: member.name || `사용자 ${String(memberId).slice(-4)}`,
            color: member.color || `#${Math.floor(Math.random()*16777215).toString(16)}`
          };
        }

        // UID만 있는 경우
        const memberId = typeof member === 'string' ? member : member.id;
        return {
          id: memberId,
          name: `사용자 ${String(memberId).slice(-4)}`,
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        };
      });

      actualMembers.value = await Promise.all(memberPromises);
      console.log('캘린더 멤버 이름 로드 완료:', actualMembers.value);
    } catch (error) {
      console.error('멤버 이름 로드 실패:', error);
      actualMembers.value = [];
    }
  };

  const loadRestaurants = async () => {
    try {
      const { getAllRestaurants } = await import('@/services/firebaseDBv2.js');
      const restaurantList = await getAllRestaurants(200);
      restaurants.value = restaurantList.map(r => r.name);
      console.log('음식점 목록 로드 완료:', restaurants.value.length, '개');
    } catch (error) {
      console.error('음식점 목록 로드 실패:', error);
      restaurants.value = [];
    }
  };

  // 월 변경 감지
  watch(currentDate, async (newDate) => {
    const year = newDate.getFullYear();
    const month = newDate.getMonth();
    
    // 이번 달의 시작일과 끝일 계산
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;
    
    console.log('월 변경:', { startDate, endDate });
    
    // 멤버 상태 로드
    await loadMemberStatuses(startDate, endDate);
  });

  // 멤버 상태 로드 (외부에서 호출)
  const loadMemberStatuses = async (startDate, endDate) => {
    // Firebase에서 멤버 상태 로드
    console.log('멤버 상태 로드:', { startDate, endDate });
  };

  return {
    // 상태
    currentDate,
    selectedDay,
    memberStatuses,
    actualMembers,
    restaurants,
    proposals,
    loading,
    
    // 계산된 속성
    currentMonthText,
    weekdays,
    calendarDays,
    
    // 날짜 관련 함수
    isHoliday,
    isWeekendOrHoliday,
    formatSelectedDate,
    getDayOfWeek,
    prevMonth,
    nextMonth,
    selectDay,
    closeDetails,
    
    // 멤버 상태 관련 함수
    getMemberStatusClass,
    getMemberStatusText,
    getMemberRestaurant,
    getMemberStatus,
    
    // 제안 관련 함수
    getProposalsForDay,
    getProposalStatus,
    getProposalIcon,
    getConfirmedMealForDay,
    
    // 이벤트 관련 함수
    getDayEvents,
    getDayMemo,
    getEventIcon,
    
    // 음식점 관련 함수
    selectRestaurant,
    getAvailableMembersForDay,
    
    // 데이터 로드 함수
    loadMemberNames,
    loadRestaurants,
    loadMemberStatuses
  };
};
