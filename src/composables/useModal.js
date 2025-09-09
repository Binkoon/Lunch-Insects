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
    otherReason: ''
  });
  const dropdownOpen = ref(false);

  // 상태 옵션
  const statusOptions = [
    { value: 'available', label: '밥 먹기', icon: '🍽️' },
    { value: 'skip', label: '밥 스킵', icon: '⏭️' },
    { value: 'vacation', label: '휴가', icon: '🏖️' },
    { value: 'other', label: '기타', icon: '📝' }
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
    modalData.value = data;
    editingStatus.value = data.currentStatus;
    showStatusModal.value = true;
    
    // 상태에 따른 초기 데이터 설정
    if (data.currentStatus === 'available' && data.details?.restaurant) {
      mealDetails.value = {
        restaurant: data.details.restaurant,
        vacationReason: '',
        otherReason: ''
      };
    } else if (data.currentStatus === 'vacation' && data.details?.vacationReason) {
      mealDetails.value = {
        restaurant: '',
        vacationReason: data.details.vacationReason,
        otherReason: ''
      };
    } else if (data.currentStatus === 'other' && data.details?.otherReason) {
      mealDetails.value = {
        restaurant: '',
        vacationReason: '',
        otherReason: data.details.otherReason
      };
    } else {
      mealDetails.value = { restaurant: '', vacationReason: '', otherReason: '' };
    }
  };

  // 모달 닫기
  const closeStatusModal = () => {
    showStatusModal.value = false;
    modalData.value = {};
    editingStatus.value = '';
    mealDetails.value = { restaurant: '', vacationReason: '', otherReason: '' };
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

  // 상태 클래스 반환
  const getMemberStatusClass = (date, memberId) => {
    const memberStatus = modalData.value.memberStatuses?.[date]?.[memberId]?.status;
    return {
      'member-item': true,
      'available': memberStatus === 'available',
      'skip': memberStatus === 'skip',
      'vacation': memberStatus === 'vacation',
      'other': memberStatus === 'other'
    };
  };

  // 상태 텍스트 반환
  const getMemberStatusText = (date, memberId) => {
    const memberStatus = modalData.value.memberStatuses?.[date]?.[memberId]?.status;
    const statusTexts = {
      'available': '밥 먹기',
      'skip': '밥 스킵',
      'vacation': '휴가',
      'other': '기타'
    };
    return statusTexts[memberStatus] || '미정';
  };

  // 상태 상세 정보 반환
  const getStatusDetails = () => {
    if (editingStatus.value === 'available') {
      return {
        restaurant: mealDetails.value.restaurant
      };
    } else if (editingStatus.value === 'vacation') {
      return {
        vacationReason: mealDetails.value.vacationReason
      };
    } else if (editingStatus.value === 'other') {
      return {
        otherReason: mealDetails.value.otherReason
      };
    }
    return {};
  };

  return {
    // 상태
    showStatusModal,
    modalData,
    editingStatus,
    mealDetails,
    dropdownOpen,
    statusOptions,
    
    // 계산된 속성
    modalFilteredRestaurants,
    
    // 메서드
    openStatusModal,
    closeStatusModal,
    selectModalRestaurant,
    toggleDropdown,
    closeDropdown,
    getMemberStatusClass,
    getMemberStatusText,
    getStatusDetails
  };
};