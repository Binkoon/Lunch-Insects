<template>
  <section class="expense-chart-section">
    <!-- 대시보드 통계 카드 -->
    <div class="dashboard-stats">
      <div class="stats-card">
        <div class="card-icon">📅</div>
        <div class="card-content">
          <div class="card-title">이번달 방문</div>
          <div class="card-value">{{ monthlyVisits }}회</div>
          <div class="card-subtitle">{{ getCurrentMonth() }}</div>
        </div>
      </div>
      
      <div class="stats-card">
        <div class="card-icon">🏆</div>
        <div class="card-content">
          <div class="card-title">총 방문</div>
          <div class="card-value">{{ totalVisits }}회</div>
          <div class="card-subtitle">누적 카운팅</div>
        </div>
      </div>
      
      <div class="stats-card">
        <div class="card-icon">🎟️</div>
        <div class="card-content">
          <div class="card-title">식권 사용</div>
          <div class="card-value">{{ formatCurrency(totalTicketPoints) }}</div>
          <div class="card-subtitle">{{ getMonthlyChange(currentMonthTicketPoints, 'ticket') }}</div>
        </div>
      </div>
      
      <div class="stats-card">
        <div class="card-icon">💰</div>
        <div class="card-content">
          <div class="card-title">현금 사용</div>
          <div class="card-value">{{ formatCurrency(totalCash) }}</div>
          <div class="card-subtitle">{{ getMonthlyChange(currentMonthCash, 'cash') }}</div>
        </div>
      </div>
    </div>

    <div class="section-header">
      <h2>📊 월별 소비금액 분석</h2>
      <div class="chart-controls">
        <button class="chart-btn" @click="refreshChart">
          <i class="icon-refresh">↻</i>
          새로고침
        </button>
      </div>
    </div>
    
    <div class="chart-container">
      <div class="chart-tabs">
        <button 
          :class="['chart-tab', { active: selectedChartType === 'personal' }]"
          @click="selectChartType('personal')"
        >
          개인 소비
        </button>
        <button 
          :class="['chart-tab', { active: selectedChartType === 'group' }]"
          @click="selectChartType('group')"
        >
          그룹 소비
        </button>
      </div>
      
      <div class="chart-content">
        <div class="chart-legend">
          <div class="legend-item">
            <div class="legend-color ticket"></div>
            <span>식권포인트</span>
          </div>
          <div class="legend-item">
            <div class="legend-color cash"></div>
            <span>현금</span>
          </div>
        </div>
        
        <div class="chart-area">
          <canvas ref="expenseChart" width="800" height="400"></canvas>
        </div>
      </div>
    </div>
    
    <!-- 음식점 방문 통계 섹션 -->
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
  </section>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';
    import { getAllRestaurants, getVisitStatistics } from '../../services/firebaseDBv2.js';

// Chart.js 등록
Chart.register(...registerables);

export default {
  name: 'ExpenseChart',
  props: {
    monthlyExpenseData: {
      type: Object,
      default: () => ({
        personal: {
          ticketPoints: [0, 0, 0, 0, 0, 0],
          cash: [0, 0, 0, 0, 0, 0]
        },
        group: {}
      })
    }
  },
  emits: ['refresh'],
  setup(props, { emit }) {
    const selectedChartType = ref('personal');
    const selectedStatsType = ref('top10');
    const expenseChart = ref(null);
    const categoryChart = ref(null);
    const topRestaurants = ref([]);
    const categoryStats = ref([]);
    
    // 대시보드 통계 데이터
    const monthlyVisits = ref(0);
    const totalVisits = ref(0);
    const totalTicketPoints = ref(0);
    const totalCash = ref(0);
    const currentMonthTicketPoints = ref(0);
    const currentMonthCash = ref(0);
    
    let chartInstance = null;
    let categoryChartInstance = null;

    const selectChartType = (type) => {
      selectedChartType.value = type;
      drawChart();
    };

    const refreshChart = () => {
      emit('refresh');
      drawChart();
    };

    const selectStatsType = (type) => {
      selectedStatsType.value = type;
      if (type === 'category') {
        setTimeout(() => {
          drawCategoryChart();
        }, 100);
      }
    };

    const refreshVisitStats = async () => {
      await loadVisitStats();
      if (selectedStatsType.value === 'category') {
        setTimeout(() => {
          drawCategoryChart();
        }, 100);
      }
    };

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

    const getBarWidth = (visitCount) => {
      if (topRestaurants.value.length === 0) return 0;
      const maxVisits = Math.max(...topRestaurants.value.map(r => r.visitCount));
      return (visitCount / maxVisits) * 100;
    };

    // 대시보드 통계 헬퍼 함수들
    const getCurrentMonth = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      return `${year}년 ${month}월`;
    };

    const formatCurrency = (amount) => {
      if (amount === 0) return '0원';
      return amount.toLocaleString() + '원';
    };

    const getMonthlyChange = (currentAmount, type) => {
      const icon = type === 'ticket' ? '🎟️' : '💰';
      if (currentAmount === 0) return `${icon} 이번달 사용 없음`;
      return `${icon} 이번달 ${formatCurrency(currentAmount)}`;
    };

    const calculateDashboardStats = () => {
      // 개인 소비 데이터에서 통계 계산
      const personalData = props.monthlyExpenseData.personal;
      
      // 총 식권/현금 사용량 계산 (6개월 누적)
      totalTicketPoints.value = sumArray(personalData.ticketPoints || []);
      totalCash.value = sumArray(personalData.cash || []);
      
      // 이번달 사용량 (배열의 마지막 값이 최신 월이라고 가정)
      const ticketArray = personalData.ticketPoints || [];
      const cashArray = personalData.cash || [];
      currentMonthTicketPoints.value = ticketArray[ticketArray.length - 1] || 0;
      currentMonthCash.value = cashArray[cashArray.length - 1] || 0;
    };

    const loadVisitStats = async () => {
      try {
        console.log('방문 통계 로드 시작...');
        
        // TODO: 실제 그룹 ID를 props나 store에서 가져와야 함
        // 현재는 방문 기록 시스템 테스트를 위해 임시 그룹 ID 사용
        const groupId = 'default-group'; // 실제 구현 시 props나 store에서 가져와야 함
        
        // 실제 방문 기록 데이터 가져오기
        const visitStatsResult = await getVisitStatistics(groupId);
        
        if (visitStatsResult.success) {
          const { totalVisits: realTotalVisits, monthlyVisits: realMonthlyVisits, restaurantVisits } = visitStatsResult.data;
          
          // 실제 방문 데이터로 설정
          totalVisits.value = realTotalVisits;
          monthlyVisits.value = realMonthlyVisits;
          
          console.log('✅ 실제 방문 통계:', { totalVisits: realTotalVisits, monthlyVisits: realMonthlyVisits });
          
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
          console.warn('⚠️ 방문 통계 조회 실패, 기존 방식으로 대체:', visitStatsResult.error);
          
          // 실패 시 기존 방식으로 대체 (restaurants 컬렉션의 visitCount 사용)
          const restaurants = await getAllRestaurants();
          totalVisits.value = restaurants.reduce((sum, restaurant) => sum + (restaurant.visitCount || 0), 0);
          monthlyVisits.value = Math.ceil(totalVisits.value * 0.1); // 임시 계산
          
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
        
      } catch (error) {
        console.error('❌ 방문 통계 로드 실패:', error);
        // 오류 시 기본값 설정
        totalVisits.value = 0;
        monthlyVisits.value = 0;
        topRestaurants.value = [];
        categoryStats.value = [];
      }
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

    const sumArray = (arr) => {
      return arr.reduce((sum, val) => sum + val, 0);
    };

    const drawChart = () => {
      if (!expenseChart.value) return;
      
      // 기존 차트 인스턴스 제거
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
      
      const ctx = expenseChart.value.getContext('2d');
      
      if (selectedChartType.value === 'personal') {
        // 개인 소비 - 꺾은선 그래프
        const data = props.monthlyExpenseData.personal;
        chartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
            datasets: [
              {
                label: '식권포인트',
                data: data.ticketPoints,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
              },
              {
                label: '현금',
                data: data.cash,
                borderColor: '#4ecdc4',
                backgroundColor: 'rgba(78, 205, 196, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#4ecdc4',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: '개인 월별 소비 추이',
                font: { size: 16, weight: 'bold' }
              },
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return value.toLocaleString() + '원';
                  }
                }
              }
            }
          }
        });
      } else {
        // 그룹 소비 - 막대 그래프
        const groupData = props.monthlyExpenseData.group;
        const memberNames = Object.keys(groupData);
        
        if (memberNames.length === 0) {
          // 데이터가 없는 경우
          chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['데이터 없음'],
              datasets: [{
                label: '데이터 없음',
                data: [0],
                backgroundColor: 'rgba(200, 200, 200, 0.5)'
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: '그룹 멤버별 총 소비',
                  font: { size: 16, weight: 'bold' }
                }
              }
            }
          });
          return;
        }
        
        const ticketTotals = memberNames.map(name => sumArray(groupData[name]?.ticketPoints || []));
        const cashTotals = memberNames.map(name => sumArray(groupData[name]?.cash || []));
        
        chartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: memberNames,
            datasets: [
              {
                label: '식권포인트',
                data: ticketTotals,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: '#3b82f6',
                borderWidth: 1,
                borderRadius: 8,
                borderSkipped: false
              },
              {
                label: '현금',
                data: cashTotals,
                backgroundColor: 'rgba(78, 205, 196, 0.6)',
                borderColor: '#4ecdc4',
                borderWidth: 1,
                borderRadius: 8,
                borderSkipped: false
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: '그룹 멤버별 총 소비 (6개월 누적)',
                font: { size: 16, weight: 'bold' }
              },
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return value.toLocaleString() + '원';
                  }
                }
              }
            }
          }
        });
      }
    };

    // 데이터 변경 감지
    watch(() => props.monthlyExpenseData, () => {
      setTimeout(() => {
        drawChart();
        calculateDashboardStats();
      }, 100);
    }, { deep: true });

    onMounted(async () => {
      setTimeout(() => {
        drawChart();
        calculateDashboardStats();
      }, 100);
      await loadVisitStats();
    });

    onUnmounted(() => {
      if (chartInstance) {
        chartInstance.destroy();
      }
      if (categoryChartInstance) {
        categoryChartInstance.destroy();
      }
    });

    return {
      selectedChartType,
      selectedStatsType,
      expenseChart,
      categoryChart,
      topRestaurants,
      categoryStats,
      // 대시보드 통계
      monthlyVisits,
      totalVisits,
      totalTicketPoints,
      totalCash,
      currentMonthTicketPoints,
      currentMonthCash,
      // 함수들
      selectChartType,
      selectStatsType,
      refreshChart,
      refreshVisitStats,
      getCategoryName,
      getBarWidth,
      getCurrentMonth,
      formatCurrency,
      getMonthlyChange
    };
  }
};
</script>

<style scoped>
/* 소비금액 그래프 섹션 */
.expense-chart-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1.5rem;
  padding: 2rem;
  margin-top: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

/* 대시보드 통계 카드 */
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stats-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #ff6b6b, #ffa726, #4ecdc4, #45b7d1);
  background-size: 200% 100%;
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.card-icon {
  font-size: 2.5rem;
  padding: 0.75rem;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 4rem;
  height: 4rem;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #718096;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
  line-height: 1.1;
}

.card-subtitle {
  font-size: 0.85rem;
  color: #4a5568;
  font-weight: 500;
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

.chart-controls {
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

.chart-container {
  margin-top: 2rem;
}

.chart-tabs {
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

.chart-content {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(255, 107, 107, 0.1);
}

.chart-legend {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #4a5568;
}

.legend-color {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
}

.legend-color.ticket {
  background-color: #3b82f6;
}

.legend-color.cash {
  background-color: #4ecdc4;
}

.chart-area {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.chart-area canvas {
  max-width: 100%;
  height: auto;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .dashboard-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .stats-card {
    padding: 1.25rem;
  }
  
  .card-icon {
    font-size: 2rem;
    min-width: 3.5rem;
    height: 3.5rem;
  }
  
  .card-value {
    font-size: 1.5rem;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .chart-tabs {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .chart-legend {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
  
  .chart-area {
    min-height: 300px;
  }
  
  .visit-stats-container {
    flex-direction: column;
  }
  
  .category-chart-area {
    height: 300px;
  }
  
  .category-details {
    margin-top: 1rem;
  }
}

/* 방문 통계 스타일 */
.visit-stats-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 107, 107, 0.2);
}

.stats-controls {
  display: flex;
  gap: 1rem;
}

.visit-stats-container {
  margin-top: 2rem;
}

.stats-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
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
