import { ref } from 'vue';
import { getAllUsers, getAllRestaurants } from '@/services/firebaseDBv2.js';

/**
 * 통계 관련 비즈니스 로직을 관리하는 Composable
 * 단일책임: 플랫폼 통계, 사용자 통계 관리
 */
export const useStats = () => {
  // 상태
  const loading = ref(false);
  const nearbyStats = ref({
    activeUsers: 0,
    totalUsers: 0,
    restaurants: 0,
    groups: 0
  });

  // 통계 데이터 로드
  const loadStatsData = async () => {
    try {
      loading.value = true;
      console.log('통계 데이터 로드 시작...');
      
      // 전체 사용자 수 로드
      const users = await getAllUsers();
      
      // 음식점 수 로드
      const restaurants = await getAllRestaurants(1000); // 충분히 큰 수로 제한
      
      // 통계 데이터 업데이트
      nearbyStats.value.activeUsers = users.length; // 전체 등록자 수
      nearbyStats.value.totalUsers = users.length;
      nearbyStats.value.restaurants = restaurants.length;
      nearbyStats.value.groups = 1; // 현재 DT 4인방 그룹만 있음
      
      console.log('통계 데이터 로드 완료:', nearbyStats.value);
    } catch (error) {
      console.error('통계 데이터 로드 실패:', error);
      // 오류 시 기본값 설정
      nearbyStats.value.activeUsers = 0;
      nearbyStats.value.totalUsers = 0;
      nearbyStats.value.restaurants = 0;
      nearbyStats.value.groups = 0;
    } finally {
      loading.value = false;
    }
  };

  // 통계 새로고침
  const refreshStats = async () => {
    console.log('통계 새로고침 시작');
    await loadStatsData();
    console.log('통계 새로고침 완료');
  };

  // 통계 데이터 업데이트
  const updateStats = (newStats) => {
    nearbyStats.value = { ...nearbyStats.value, ...newStats };
    console.log('통계 업데이트:', nearbyStats.value);
  };

  return {
    // 상태
    loading,
    nearbyStats,
    
    // 메서드
    loadStatsData,
    refreshStats,
    updateStats
  };
};
