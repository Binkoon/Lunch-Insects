import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { HolidayUtils } from '@/config/constants.js';
import { db } from '@/services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { 
  saveMemberStatus, 
  getMemberStatus, 
  getGroupMemberStatuses, 
  deleteMemberStatus,
  getGroup,
  getUser,
  getAllRestaurants,
  addRestaurantVisit,
  getRestaurantVisitCounts,
  saveVisitRecord,
  cancelVisitRecord,
  getMonthlyVisitRecords,
  getVisitStatistics
} from '@/services/firebaseDBv2.js';
import { getCurrentUser } from '@/services/firebaseAuth.js';

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
  const currentUser = ref(null);
  const showProposalModal = ref(false);
  const selectedProposal = ref(null);
  const showRestaurantDetailModal = ref(false);
  const selectedRestaurantDetail = ref(null);
  const selectedRestaurantDate = ref('');

  // 계산된 속성
  const currentMonthText = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth() + 1;
    return `${year}년 ${month}월`;
  });

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  // 오늘 날짜 확인
  const isTodayDate = (date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

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
    
    // 주말이 아닌 경우 상태 모달 열기
    if (!day.isWeekendOrHoliday) {
      const currentMember = actualMembers.value.find(m => m.id === (currentUser.value?.uid || currentUser.value?.id))
        || { id: currentUser.value?.uid || currentUser.value?.id, name: currentUser.value?.name || '나' };
      
      const modalData = {
        member: currentMember,
        date: day.date,
        currentStatus: 'available',
        allMembers: actualMembers.value,
        memberStatuses: memberStatuses.value,
        restaurants: restaurants.value,
        groupId: props.groupId
      };
      
      emit('open-status-modal', modalData);
    }
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

      // 이미 로딩 중이면 무시
      if (loading.value) {
        return;
      }

      loading.value = true;

      const memberPromises = members.map(async (member, index) => {
        // 이미 객체 형태이고 이름이 있는 경우 (실제 Firebase 데이터인지 확인)
        if (typeof member === 'object' && member.name && !member.name.startsWith('사용자 ')) {
          const memberId = member.id || member.uid || member.userId || member;
          return {
            id: memberId,
            name: member.name,
            color: member.color || `#${Math.floor(Math.random()*16777215).toString(16)}`
          };
        }

        // UID만 있는 경우 - Firebase에서 사용자 정보 가져오기
        const memberId = typeof member === 'string' ? member : (member.id || member.uid || member.userId);
        
        try {
          const userData = await getUser(memberId);
          
          if (userData && userData.success && userData.data) {
            const userName = userData.data.name || userData.data.displayName || `사용자 ${String(memberId).slice(-4)}`;
            return {
              id: memberId,
              name: userName,
              color: `#${Math.floor(Math.random()*16777215).toString(16)}`
            };
          } else {
            // 사용자가 존재하지 않는 경우 기본 사용자 정보 생성
            try {
              const { createUser } = await import('@/services/firebaseDBv2.js');
              const shortId = String(memberId).slice(-4);
              const defaultName = `사용자${shortId}`;
              
              await createUser({
                uid: memberId,
                name: defaultName,
                displayName: defaultName,
                email: `${memberId}@temp.com`,
                createdAt: new Date(),
                lastActiveAt: new Date()
              });
              
              return {
                id: memberId,
                name: defaultName,
                color: `#${Math.floor(Math.random()*16777215).toString(16)}`
              };
            } catch (createError) {
              console.warn(`사용자 ${memberId} 기본 정보 생성 실패:`, createError);
            }
          }
        } catch (error) {
          console.warn(`사용자 ${memberId} 정보 가져오기 실패:`, error);
        }

        // Firebase에서 가져오기 실패한 경우 기본값 사용
        const shortId = String(memberId).slice(-4);
        const userName = `사용자${shortId}`;
        
        return {
          id: memberId,
          name: userName,
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        };
      });

      actualMembers.value = await Promise.all(memberPromises);
    } catch (error) {
      console.error('멤버 이름 로드 실패:', error);
      actualMembers.value = [];
    } finally {
      loading.value = false;
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

  // 월 변경 감지 (무한 루프 방지를 위해 immediate: false)
  watch(currentDate, async (newDate, oldDate) => {
    // 같은 월이면 무시
    if (oldDate && 
        newDate.getFullYear() === oldDate.getFullYear() && 
        newDate.getMonth() === oldDate.getMonth()) {
      return;
    }
    
    const year = newDate.getFullYear();
    const month = newDate.getMonth();
    
    // 이번 달의 시작일과 끝일 계산
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;
    
    console.log('월 변경:', { startDate, endDate });
    
    // 멤버 상태 로드
    await loadMemberStatuses(startDate, endDate);
  }, { immediate: false });

  // 멤버 상태 로드 (외부에서 호출)
  const loadMemberStatuses = async (startDate, endDate) => {
    try {
      console.log('멤버 상태 로드:', { startDate, endDate, groupId: props.groupId });
      
      if (!props.groupId) {
        console.warn('groupId가 없어서 멤버 상태를 로드할 수 없습니다.');
        return;
      }

      const { getGroupMemberStatuses } = await import('@/services/firebaseDBv2.js');
      const result = await getGroupMemberStatuses(props.groupId, startDate, endDate);
      
      if (result && result.success) {
        memberStatuses.value = result.data || {};
        console.log('멤버 상태 로드 완료:', memberStatuses.value);
      } else {
        console.warn('멤버 상태 로드 실패:', result);
        memberStatuses.value = {};
      }
    } catch (error) {
      console.error('멤버 상태 로드 중 오류:', error);
      memberStatuses.value = {};
    }
  };

  // 누락된 함수들 추가
  const getSelectedRestaurantsForDay = (day) => {
    const dayStatuses = memberStatuses.value[day.date] || {};
    const restaurants = [];
    
    Object.values(dayStatuses).forEach(status => {
      if (status.status === 'available' && status.details?.restaurant) {
        restaurants.push({
          name: status.details.restaurant,
          mealType: status.details.mealType || 'lunch',
          participants: status.details.participants || [],
          mealCard: status.details.mealCard || 0,
          cash: status.details.cash || 0,
          totalAmount: status.details.totalAmount || 0,
          externalMembers: status.details.externalMembers || []
        });
      }
    });
    
    return restaurants;
  };

  const openRestaurantDetailModal = async (restaurant, date) => {
    console.log('음식점 상세 모달 열기:', restaurant, date);
  };

  const closeRestaurantDetailModal = () => {
    console.log('음식점 상세 모달 닫기');
  };

  const loadGroupData = async () => {
    try {
      const { getGroup } = await import('@/services/firebaseDBv2.js');
      const group = await getGroup(props.groupId);
      if (group && group.members) {
        emit('group-loaded', group);
      }
    } catch (error) {
      console.error('그룹 데이터 로드 실패:', error);
    }
  };

  const loadProposals = async () => {
    proposals.value = [];
  };

  const saveMemberStatusToFirebase = async (userId, date, status, details = {}) => {
    try {
      const { saveMemberStatus } = await import('@/services/firebaseDBv2.js');
      const result = await saveMemberStatus(props.groupId, userId, date, status, details);
      if (result.success) {
        if (!memberStatuses.value[date]) {
          memberStatuses.value[date] = {};
        }
        memberStatuses.value[date][userId] = { status, details };
        return true;
      }
      return false;
    } catch (error) {
      console.error('멤버 상태 저장 실패:', error);
      return false;
    }
  };

  const deleteMemberStatusFromFirebase = async (userId, date) => {
    try {
      const { deleteMemberStatus } = await import('@/services/firebaseDBv2.js');
      const result = await deleteMemberStatus(props.groupId, userId, date);
      if (result.success) {
        if (memberStatuses.value[date] && memberStatuses.value[date][userId]) {
          delete memberStatuses.value[date][userId];
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('멤버 상태 삭제 실패:', error);
      return false;
    }
  };

  // 이벤트 핸들러들
  const handleDayClick = (day) => {
    if (!day.isWeekendOrHoliday) {
      selectDay(day);
      emit('date-selected', day);
    }
  };

  const handleRestaurantClick = (restaurant, date) => {
    openRestaurantDetailModal(restaurant, date);
  };

  const handleProposalClick = (proposal) => {
    console.log('제안 클릭:', proposal);
  };

  const handleProposalAccept = (proposal) => {
    console.log('제안 수락:', proposal);
  };

  const handleProposalReject = (proposal) => {
    console.log('제안 거절:', proposal);
  };

  const handleProposalCreate = (proposal) => {
    console.log('제안 생성:', proposal);
  };

  const handleProposalDelete = (proposal) => {
    console.log('제안 삭제:', proposal);
  };

  const handleDragStart = (proposal) => {
    console.log('드래그 시작:', proposal);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDragLeave = (event) => {
    // 드래그 리브 로직
  };

  const handleDrop = (event, day) => {
    event.preventDefault();
    console.log('드롭:', day);
  };

  const handleDragEnd = () => {
    console.log('드래그 종료');
  };

  // 누락된 함수들 추가
  const closeProposalModal = () => {
    showProposalModal.value = false;
    selectedProposal.value = null;
  };

  const handleProposalVote = (proposal, vote) => {
    console.log('제안 투표:', proposal, vote);
  };

  const handleProposalConfirmed = (proposal) => {
    console.log('제안 확인:', proposal);
  };

  const handleProposalMoved = (proposal, newDate) => {
    console.log('제안 이동:', proposal, newDate);
  };

  const getRestaurantMembers = (restaurant, date) => {
    const dayStatuses = memberStatuses.value[date] || {};
    const members = [];
    
    Object.entries(dayStatuses).forEach(([memberId, status]) => {
      if (status.status === 'available' && status.details?.restaurant === restaurant) {
        const member = actualMembers.value.find(m => m.id === memberId);
        if (member) {
          members.push({
            ...member,
            participants: status.details.participants || [],
            mealCard: status.details.mealCard || 0,
            cash: status.details.cash || 0,
            totalAmount: status.details.totalAmount || 0,
            externalMembers: status.details.externalMembers || []
          });
        }
      }
    });
    
    return members;
  };

  // 현재 사용자 로드
  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      currentUser.value = user;
      console.log('현재 사용자 로드 완료:', user);
    } catch (error) {
      console.error('현재 사용자 로드 실패:', error);
      currentUser.value = null;
    }
  };

  // 생명주기 훅
  onMounted(async () => {
    // 현재 사용자 로드
    await loadCurrentUser();
    
    if (props.groupId) {
      await loadMemberNames(props.members);
      await loadRestaurants();
      
      // 현재 월의 날짜 범위로 멤버 상태 로드
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;
      
      await loadMemberStatuses(startDate, endDate);
    }
  });

  // props 변경 감지 (무한 루프 방지)
  watch(() => props.groupId, async (newGroupId, oldGroupId) => {
    if (newGroupId && newGroupId !== oldGroupId) {
      console.log('groupId 변경 감지:', newGroupId);
      await loadMemberNames(props.members);
      await loadRestaurants();
      
      // 현재 월의 날짜 범위로 멤버 상태 로드
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();
      const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;
      
      await loadMemberStatuses(startDate, endDate);
    }
  }, { immediate: false });

  watch(() => props.members, async (newMembers, oldMembers) => {
    if (newMembers && newMembers.length > 0 && newMembers !== oldMembers) {
      console.log('members 변경 감지:', newMembers);
      await loadMemberNames(newMembers);
    }
  }, { immediate: false });

  return {
    // 상태
    currentDate,
    selectedDay,
    memberStatuses,
    actualMembers,
    restaurants,
    proposals,
    loading,
    currentUser,
    showProposalModal,
    selectedProposal,
    showRestaurantDetailModal,
    selectedRestaurantDetail,
    selectedRestaurantDate,
    
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
    getSelectedRestaurantsForDay,
    openRestaurantDetailModal,
    closeRestaurantDetailModal,
    
    // 데이터 로드 함수
    loadMemberNames,
    loadRestaurants,
    loadMemberStatuses,
    loadGroupData,
    loadProposals,
    loadCurrentUser,
    
    // 저장/삭제 함수
    saveMemberStatusToFirebase,
    deleteMemberStatusFromFirebase,
    
    // 이벤트 핸들러
    handleDayClick,
    handleRestaurantClick,
    handleProposalClick,
    handleProposalAccept,
    handleProposalReject,
    handleProposalCreate,
    handleProposalDelete,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    
    // 제안 관련 변수
    selectedProposal,
    showProposalModal,
    
    // 제안 관련 함수
    closeProposalModal,
    handleProposalVote,
    handleProposalConfirmed,
    handleProposalMoved,
    
    // 음식점 관련 변수
    showRestaurantDetailModal,
    selectedRestaurantDetail,
    selectedRestaurantDate,
    
    // 음식점 관련 함수
    getRestaurantMembers,
    
    // 유틸리티 함수
    createDayObject,
    isTodayDate
  };
};
