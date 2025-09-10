<template>
  <div class="visit-stats-section">
    <div class="section-header">
      <h2>🍽️ 음식점 방문 통계</h2>
      <div class="stats-controls">
        <button class="chart-btn" @click="refreshVisitStats">
          <i class="icon-refresh">↻</i>
          새로고침
        </button>
      </div>
    </div>
    
    <div class="visit-stats-container">
      <div class="stats-tabs">
        <button 
          :class="['chart-tab', { active: selectedStatsType === 'top10' }]"
          @click="selectStatsType('top10')"
        >
          TOP 10
        </button>
        <button 
          :class="['chart-tab', { active: selectedStatsType === 'category' }]"
          @click="selectStatsType('category')"
        >
          카테고리별
        </button>
      </div>
      
      <div class="stats-content">
        <div v-if="selectedStatsType === 'top10'" class="top-restaurants">
          <div class="restaurant-item" v-for="(restaurant, index) in topRestaurants" :key="restaurant.id">
            <div class="rank">{{ index + 1 }}</div>
            <div class="restaurant-info">
              <div class="restaurant-name">{{ restaurant.name }}</div>
              <div class="restaurant-category">{{ getCategoryName(restaurant.category) }}</div>
            </div>
            <div class="visit-count">
              <span class="count">{{ restaurant.visitCount }}</span>
              <span class="unit">회</span>
            </div>
            <div class="visit-bar">
              <div class="bar-fill" :style="{ width: getBarWidth(restaurant.visitCount) + '%' }"></div>
            </div>
          </div>
        </div>
        
        <div v-else class="category-stats">
          <div class="category-chart-area">
            <canvas ref="categoryChart" width="400" height="400"></canvas>
          </div>
          <div class="category-details">
            <div class="category-item" v-for="category in categoryStats" :key="category.category">
              <div class="category-color" :style="{ backgroundColor: category.color }"></div>
              <div class="category-info">
                <div class="category-name">{{ category.name }}</div>
                <div class="category-count">{{ category.count }}개 음식점</div>
              </div>
              <div class="category-visits">{{ category.totalVisits }}회 방문</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
import { useRestaurantStats } from '@/composables/useRestaurantStats.js';
import { CHART_COLORS } from '@/constants/chartConstants.js';

// Chart.js 등록
Chart.register(...registerables);

export default {
  name: 'RestaurantStats',
  props: {
    groupId: {
      type: String,
      default: 'default-group'
    }
  },
  emits: ['refresh'],
  setup(props, { emit }) {
    const selectedStatsType = ref('top10');
    const categoryChart = ref(null);
    
    // useRestaurantStats composable 사용
    const {
      topRestaurants,
      categoryStats,
      loading,
      error,
      getCategoryName,
      getBarWidth,
      loadVisitStats,
      resetStats
    } = useRestaurantStats();
    
    let categoryChartInstance = null;

    const selectStatsType = (type) => {
      selectedStatsType.value = type;
      if (type === 'category') {
        setTimeout(() => {
          drawCategoryChart();
        }, 100);
      }
    };

    const refreshVisitStats = async () => {
      console.log('🔄 실시간 방문 통계 갱신 시작...');
      await loadVisitStats(props.groupId);
      if (selectedStatsType.value === 'category') {
        setTimeout(() => {
          drawCategoryChart();
        }, 100);
      }
      console.log('✅ 실시간 방문 통계 갱신 완료');
      emit('refresh');
    };


    const drawCategoryChart = () => {
      if (!categoryChart.value || categoryStats.value.length === 0) return;
      
      // 기존 차트 인스턴스 제거
      if (categoryChartInstance) {
        categoryChartInstance.destroy();
        categoryChartInstance = null;
      }
      
      const ctx = categoryChart.value.getContext('2d');
      
      categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: categoryStats.value.map(cat => cat.name),
          datasets: [{
            data: categoryStats.value.map(cat => cat.count),
            backgroundColor: categoryStats.value.map(cat => cat.color),
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverBorderWidth: 4,
            hoverBorderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: '카테고리별 음식점 분포',
              font: { size: 16, weight: 'bold' }
            },
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const category = categoryStats.value[context.dataIndex];
                  return `${category.name}: ${category.count}개 (${category.totalVisits}회 방문)`;
                }
              }
            }
          }
        }
      });
    };

    onMounted(async () => {
      console.log('🔍 RestaurantStats 마운트됨, groupId:', props.groupId);
      await loadVisitStats(props.groupId);
    });

    onUnmounted(() => {
      if (categoryChartInstance) {
        categoryChartInstance.destroy();
      }
    });

    return {
      selectedStatsType,
      categoryChart,
      topRestaurants,
      categoryStats,
      selectStatsType,
      refreshVisitStats,
      getCategoryName,
      getBarWidth
    };
  }
};
</script>

<style scoped>
/* 방문 통계 스타일 */
.visit-stats-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 107, 107, 0.2);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  color: #2d3748;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.stats-controls {
  display: flex;
  gap: 1rem;
}

.chart-btn {
  background: linear-gradient(135deg, #ff6b6b, #ffa726);
  color: white;
  border: none;
  border-radius: 1rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.chart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

.icon-refresh {
  font-size: 1.2rem;
  display: inline-block;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.visit-stats-container {
  margin-top: 2rem;
}

.stats-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.chart-tab {
  background: rgba(255, 255, 255, 0.8);
  color: #6c757d;
  border: 2px solid rgba(255, 107, 107, 0.2);
  border-radius: 1rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chart-tab:hover {
  background: rgba(255, 107, 107, 0.1);
  border-color: #ff6b6b;
}

.chart-tab.active {
  background: linear-gradient(135deg, #ff6b6b, #ffa726);
  color: white;
  border-color: #ff6b6b;
}

.stats-content {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(255, 107, 107, 0.1);
}

/* TOP 10 음식점 스타일 */
.top-restaurants {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.restaurant-item {
  display: grid;
  grid-template-columns: 3rem 1fr auto 2fr;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.restaurant-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #ff6b6b, #ffa726);
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 1.1rem;
}

.restaurant-info {
  display: flex;
  flex-direction: column;
}

.restaurant-name {
  font-weight: 700;
  font-size: 1.1rem;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.restaurant-category {
  font-size: 0.9rem;
  color: #718096;
}

.visit-count {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  text-align: right;
}

.count {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff6b6b;
}

.unit {
  font-size: 1rem;
  color: #718096;
}

.visit-bar {
  position: relative;
  height: 0.5rem;
  background: #e2e8f0;
  border-radius: 0.25rem;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff6b6b, #ffa726);
  border-radius: 0.25rem;
  transition: width 0.8s ease;
}

/* 카테고리 통계 스타일 */
.category-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.category-chart-area {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.category-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-item {
  display: grid;
  grid-template-columns: 1rem 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.category-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.category-color {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
}

.category-info {
  display: flex;
  flex-direction: column;
}

.category-name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.category-count {
  font-size: 0.9rem;
  color: #718096;
}

.category-visits {
  font-weight: 600;
  color: #ff6b6b;
  text-align: right;
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .restaurant-item {
    grid-template-columns: 2.5rem 1fr;
    grid-template-rows: auto auto;
    gap: 0.75rem;
  }
  
  .visit-count {
    grid-column: 1;
    grid-row: 2;
    justify-self: center;
  }
  
  .visit-bar {
    grid-column: 2;
    grid-row: 2;
  }
  
  .category-stats {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .category-chart-area {
    height: 300px;
  }
}
</style>
