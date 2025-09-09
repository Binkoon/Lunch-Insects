import { ref } from 'vue';

/**
 * 상태 관리 관련 비즈니스 로직을 관리하는 Composable
 * 단일책임: 멤버 상태 관리, 상태 업데이트 처리
 */
export const useStatus = () => {
  // 상태
  const loading = ref(false);
  const selectedDateForProposal = ref(null);

  // 상태 업데이트 핸들러
  const handleStatusUpdated = async (updateInfo) => {
    console.log('🔄 상태 업데이트됨:', updateInfo);
    
    try {
      // ExpenseChart 실시간 갱신
      if (updateInfo.expenseChart && updateInfo.expenseChart.refreshVisitStats) {
        console.log('📊 ExpenseChart 통계 갱신 중...');
        await updateInfo.expenseChart.refreshVisitStats();
      }
      
      // 업데이트 타입별 처리
      switch (updateInfo.type) {
        case 'restaurant-selected':
          console.log('🍽️ 음식점 선택됨:', updateInfo.restaurant);
          break;
        case 'status-changed':
          console.log('📝 상태 변경됨:', updateInfo.status);
          break;
        case 'member-joined':
          console.log('👥 멤버 추가됨:', updateInfo.member);
          break;
        default:
          console.log('🔄 일반 상태 업데이트');
      }
      
      console.log('✅ 실시간 업데이트 완료');
    } catch (error) {
      console.error('❌ 실시간 업데이트 실패:', error);
    }
  };

  // 날짜 선택 핸들러
  const handleDateSelected = (date) => {
    selectedDateForProposal.value = new Date(date);
    console.log('선택된 날짜:', date);
  };

  // 제안 날짜 설정
  const setSelectedDateForProposal = (date) => {
    selectedDateForProposal.value = new Date(date);
    console.log('제안 날짜 설정:', date);
  };

  // 제안 날짜 초기화
  const clearSelectedDateForProposal = () => {
    selectedDateForProposal.value = null;
    console.log('제안 날짜 초기화');
  };

  return {
    // 상태
    loading,
    selectedDateForProposal,
    
    // 메서드
    handleStatusUpdated,
    handleDateSelected,
    setSelectedDateForProposal,
    clearSelectedDateForProposal
  };
};
