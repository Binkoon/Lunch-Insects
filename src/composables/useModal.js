import { ref, computed } from 'vue';

/**
 * 모달 관련 비즈니스 로직을 관리하는 Composable
 * 단일책임: 모달 상태 관리, 모달 데이터 처리
 */
export const useModal = () => {
  // 상태
  const showStatusModal = ref(false);
  const modalData = ref({});
  const editingStatus = ref('');
  const mealDetails = ref({
    restaurant: '',
    vacationReason: '',
    otherReason: '',
    participants: [], // 함께 밥을 먹을 동료들
    mealCard: null, // 식권 금액
    cash: null, // 현금 금액
    mealType: 'lunch', // 점심/저녁 구분 (lunch/dinner)
    groupId: null, // 그룹 ID (다중 기록을 위한 식별자)
    externalMembers: 0 // 외부인원 수 (N빵 계산용)
  });
  
  const vacationDetails = ref({
    reason: ''
  });
  
  const otherDetails = ref({
    reason: ''
  });
  const dropdownOpen = ref(false);
  
  // 음식점 검색 관련 상태
  const restaurantSearchQuery = ref('');
  const restaurantSearchResults = ref([]);
  const isSearchingRestaurant = ref(false);
  const selectedRestaurant = ref(null);

  // 상태 옵션
  const statusOptions = [
    { value: 'available', label: '가능', icon: '✅' },
    { value: 'vacation', label: '불가능 (휴가)', icon: '🏖️' },
    { value: 'solo', label: '불가능 (혼밥)', icon: '🍱' },
    { value: 'skip', label: '불가능 (Skip)', icon: '⏭️' },
    { value: 'other', label: '불가능 (선약)', icon: '📅' }
  ];

  // 식사 타입 옵션
  const mealTypeOptions = [
    { value: 'lunch', label: '점심', icon: '🌞', color: '#10b981' },
    { value: 'dinner', label: '저녁', icon: '🌙', color: '#ef4444' }
  ];

  // 모달에서 사용할 필터링된 음식점 목록
  const modalFilteredRestaurants = computed(() => {
    if (!modalData.value.restaurants || !mealDetails.value.restaurant) {
      return modalData.value.restaurants || [];
    }
    return modalData.value.restaurants.filter(restaurant => 
      restaurant.toLowerCase().includes(mealDetails.value.restaurant.toLowerCase())
    );
  });

  // 모달 열기
  const openStatusModal = (data) => {
    console.log('🔍 모달 열기:', data);
    console.log('🔍 currentStatus:', data.currentStatus);
    console.log('🔍 details:', data.details);
    modalData.value = data;
    editingStatus.value = data.currentStatus;
    showStatusModal.value = true;
    
    // 상태에 따른 초기 데이터 설정
    if (data.currentStatus === 'available') {
      mealDetails.value = {
        restaurant: data.details?.restaurant || '',
        vacationReason: '',
        otherReason: '',
        participants: data.details?.participants || [],
        mealCard: data.details?.mealCard || null,
        cash: data.details?.cash || null,
        mealType: data.details?.mealType || 'lunch',
        groupId: data.details?.groupId || null,
        externalMembers: data.details?.externalMembers || 0
      };
    } else if (data.currentStatus === 'vacation') {
      if (data.details?.vacationReason) {
        vacationDetails.value = {
          reason: data.details.vacationReason
        };
      } else {
        vacationDetails.value = { reason: '' };
      }
    } else if (data.currentStatus === 'other') {
      if (data.details?.otherReason) {
        otherDetails.value = {
          reason: data.details.otherReason
        };
      } else {
        otherDetails.value = { reason: '' };
      }
    } else {
      // 새로운 날짜 선택 시 기본값으로 초기화
      mealDetails.value = {
        restaurant: '',
        vacationReason: '',
        otherReason: '',
        participants: [],
        mealCard: null,
        cash: null,
        mealType: 'lunch',
        groupId: null,
        externalMembers: 0
      };
      vacationDetails.value = { reason: '' };
      otherDetails.value = { reason: '' };
    }
  };

  // 모달 닫기
  const closeStatusModal = () => {
    showStatusModal.value = false;
    modalData.value = {};
    editingStatus.value = '';
    mealDetails.value = {
      restaurant: '',
      vacationReason: '',
      otherReason: '',
      participants: [],
      mealCard: null,
      cash: null,
      mealType: 'lunch',
      groupId: null,
      externalMembers: 0
    };
    vacationDetails.value = { reason: '' };
    otherDetails.value = { reason: '' };
    dropdownOpen.value = false;
  };

  // 음식점 선택
  const selectModalRestaurant = (restaurant) => {
    mealDetails.value.restaurant = restaurant;
    dropdownOpen.value = false;
  };

  // 드롭다운 토글
  const toggleDropdown = () => {
    dropdownOpen.value = !dropdownOpen.value;
  };

  // 드롭다운 외부 클릭 시 닫기
  const closeDropdown = () => {
    dropdownOpen.value = false;
  };

  // 동료 선택/해제
  const toggleParticipant = (memberId) => {
    const participants = mealDetails.value.participants;
    const index = participants.indexOf(memberId);
    if (index > -1) {
      participants.splice(index, 1);
    } else {
      participants.push(memberId);
    }
  };

  // 동료가 선택되었는지 확인
  const isParticipantSelected = (memberId) => {
    return mealDetails.value.participants.includes(memberId);
  };

  // 드롭다운 핸들러 함수들
  const handleInputFocus = () => {
    dropdownOpen.value = true;
  };
  
  const handleInputChange = () => {
    dropdownOpen.value = true;
  };
  
  const handleInputBlur = () => {
    setTimeout(() => {
      dropdownOpen.value = false;
    }, 200);
  };

  // 상태 클래스 반환 (원형 표시용)
  const getMemberStatusClass = (date, memberId) => {
    const memberStatus = modalData.value.memberStatuses?.[date]?.[memberId]?.status;
    return {
      'status-available': memberStatus === 'available',
      'status-unavailable': memberStatus === 'vacation' || memberStatus === 'solo' || memberStatus === 'skip' || memberStatus === 'other',
      'status-unknown': !memberStatus
    };
  };

  // 상태 텍스트 반환
  const getMemberStatusText = (date, memberId) => {
    const memberStatus = modalData.value.memberStatuses?.[date]?.[memberId]?.status;
    const statusTexts = {
      'available': '가능',
      'vacation': '불가능 (휴가)',
      'solo': '불가능 (혼밥)',
      'skip': '불가능 (Skip)',
      'other': '불가능 (선약)'
    };
    return statusTexts[memberStatus] || '미정';
  };

  // 상태 상세 정보 반환
  const getStatusDetails = () => {
    if (editingStatus.value === 'available') {
      return {
        restaurant: mealDetails.value.restaurant,
        participants: mealDetails.value.participants,
        mealCard: mealDetails.value.mealCard,
        cash: mealDetails.value.cash,
        mealType: mealDetails.value.mealType,
        groupId: mealDetails.value.groupId,
        externalMembers: mealDetails.value.externalMembers
      };
    } else if (editingStatus.value === 'vacation') {
      return {
        vacationReason: vacationDetails.value.reason
      };
    } else if (editingStatus.value === 'other') {
      return {
        otherReason: otherDetails.value.reason
      };
    }
    return {};
  };

  // 음식점 검색 함수들
  const searchRestaurantByName = async (query) => {
    if (!query.trim()) {
      restaurantSearchResults.value = [];
      return;
    }

    isSearchingRestaurant.value = true;
    try {
      const result = await searchRestaurant(query);
      if (result.success) {
        restaurantSearchResults.value = [result];
      } else {
        restaurantSearchResults.value = [];
        console.warn('음식점 검색 실패:', result.error);
      }
    } catch (error) {
      console.error('음식점 검색 오류:', error);
      restaurantSearchResults.value = [];
    } finally {
      isSearchingRestaurant.value = false;
    }
  };

  const selectRestaurantFromSearch = (restaurant) => {
    selectedRestaurant.value = restaurant;
    mealDetails.value.restaurant = restaurant.name;
    restaurantSearchQuery.value = restaurant.name;
    restaurantSearchResults.value = [];
  };

  const clearRestaurantSearch = () => {
    restaurantSearchQuery.value = '';
    restaurantSearchResults.value = [];
    selectedRestaurant.value = null;
  };

  // 상태 저장 (콜백 함수 방식)
  const saveStatus = (onSave) => {
    if (!editingStatus.value) {
      console.warn('상태를 선택해주세요.');
      return;
    }

    const statusDetails = getStatusDetails();
    const statusData = {
      status: editingStatus.value,
      details: statusDetails,
      member: modalData.value.member,
      date: modalData.value.date,
      groupId: modalData.value.groupId
    };

    console.log('상태 저장:', statusData);

    // 부모 컴포넌트의 저장 함수 호출
    if (onSave) {
      onSave(statusData);
    }
    
    closeStatusModal();
  };

  return {
    // 상태
    showStatusModal,
    modalData,
    editingStatus,
    mealDetails,
    vacationDetails,
    otherDetails,
    dropdownOpen,
    statusOptions,
    mealTypeOptions,
    
    // 계산된 속성
    modalFilteredRestaurants,
    
    // 메서드
    openStatusModal,
    closeStatusModal,
    saveStatus,
    selectModalRestaurant,
    toggleDropdown,
    closeDropdown,
    toggleParticipant,
    isParticipantSelected,
    handleInputFocus,
    handleInputChange,
    handleInputBlur,
    getMemberStatusClass,
    getMemberStatusText,
    getStatusDetails,
    
    // 음식점 검색 관련
    restaurantSearchQuery,
    restaurantSearchResults,
    isSearchingRestaurant,
    selectedRestaurant,
    searchRestaurantByName,
    selectRestaurantFromSearch,
    clearRestaurantSearch
  };
};