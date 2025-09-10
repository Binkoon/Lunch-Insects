import { ref } from 'vue';
import { getAllRestaurants, getVisitStatistics } from '@/services/firebaseDBv2.js';

export const useRestaurantStats = () => {
  const topRestaurants = ref([]);
  const categoryStats = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // 카테고리 이름 매핑
  const getCategoryName = (category) => {
    const categoryNames = {
      'korean': '한식',
      'chinese': '중식',
      'japanese': '일식',
      'western': '양식',
      'fastfood': '치킨/햄버거/피자',
      'buffet': '뷔페',
      'cafe': '카페'
    };
    return categoryNames[category] || category;
  };

  // 바 너비 계산
  const getBarWidth = (visitCount) => {
    if (topRestaurants.value.length === 0) return 0;
    const maxVisits = Math.max(...topRestaurants.value.map(r => r.visitCount));
    return (visitCount / maxVisits) * 100;
  };

  // 방문 통계 로드
  const loadVisitStats = async (groupId) => {
    try {
      loading.value = true;
      error.value = null;
      
      console.log('방문 통계 로드 시작...', groupId);
      
      const visitStatsResult = await getVisitStatistics(groupId);
      
      if (visitStatsResult.success && visitStatsResult.data.totalVisits > 0) {
        const { restaurantVisits } = visitStatsResult.data;
        
        // 방문 기록이 있는 음식점들의 상세 정보 가져오기
        const allRestaurants = await getAllRestaurants();
        
        // TOP 10 음식점 (실제 방문 기록 기준)
        const visitedRestaurants = Object.entries(restaurantVisits)
          .map(([name, visitCount]) => {
            const restaurant = allRestaurants.find(r => r.name === name);
            return {
              name,
              visitCount,
              category: restaurant ? restaurant.category : 'unknown',
              rating: restaurant ? restaurant.rating : 4.0,
              distance: restaurant ? restaurant.distance : 5
            };
          })
          .sort((a, b) => b.visitCount - a.visitCount)
          .slice(0, 10);
        
        topRestaurants.value = visitedRestaurants;
        
        // 카테고리별 통계 (실제 방문 기록 기준)
        const categoryMap = {};
        Object.entries(restaurantVisits).forEach(([restaurantName, visitCount]) => {
          const restaurant = allRestaurants.find(r => r.name === restaurantName);
          const category = restaurant ? restaurant.category : 'unknown';
          
          if (!categoryMap[category]) {
            categoryMap[category] = {
              count: 0,
              totalVisits: 0
            };
          }
          categoryMap[category].count++;
          categoryMap[category].totalVisits += visitCount;
        });
        
        const colors = [
          '#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', 
          '#e74c3c', '#9b59b6', '#2ecc71', '#f1c40f'
        ];
        
        categoryStats.value = Object.entries(categoryMap)
          .map(([category, data], index) => ({
            category,
            name: getCategoryName(category),
            count: data.count,
            totalVisits: data.totalVisits,
            color: colors[index % colors.length]
          }))
          .sort((a, b) => b.count - a.count);
          
      } else {
        console.warn('⚠️ 방문 기록이 없거나 조회 실패, 기존 방식으로 대체:', visitStatsResult.success ? '데이터 없음' : visitStatsResult.error);
        
        // 실패 시 기존 방식으로 대체 (restaurants 컬렉션의 visitCount 사용)
        const restaurants = await getAllRestaurants();
        
        const sortedRestaurants = restaurants
          .filter(r => (r.visitCount || 0) > 0)
          .sort((a, b) => (b.visitCount || 0) - (a.visitCount || 0))
          .slice(0, 10);
        
        topRestaurants.value = sortedRestaurants;
        
        // 기존 카테고리 통계 로직
        const categoryMap = {};
        restaurants.forEach(restaurant => {
          const category = restaurant.category || 'unknown';
          if (!categoryMap[category]) {
            categoryMap[category] = {
              count: 0,
              totalVisits: 0
            };
          }
          categoryMap[category].count++;
          categoryMap[category].totalVisits += (restaurant.visitCount || 0);
        });
        
        const colors = [
          '#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', 
          '#e74c3c', '#9b59b6', '#2ecc71', '#f1c40f'
        ];
        
        categoryStats.value = Object.entries(categoryMap)
          .map(([category, data], index) => ({
            category,
            name: getCategoryName(category),
            count: data.count,
            totalVisits: data.totalVisits,
            color: colors[index % colors.length]
          }))
          .sort((a, b) => b.count - a.count);
      }
      
    } catch (err) {
      console.error('❌ 방문 통계 로드 실패:', err);
      error.value = err.message;
      topRestaurants.value = [];
      categoryStats.value = [];
    } finally {
      loading.value = false;
    }
  };

  // 통계 초기화
  const resetStats = () => {
    topRestaurants.value = [];
    categoryStats.value = [];
    error.value = null;
  };

  return {
    topRestaurants,
    categoryStats,
    loading,
    error,
    getCategoryName,
    getBarWidth,
    loadVisitStats,
    resetStats
  };
};
