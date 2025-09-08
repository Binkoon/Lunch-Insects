<template>
  <section class="expense-chart-section">
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
  </section>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';

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
    const expenseChart = ref(null);
    let chartInstance = null;

    const selectChartType = (type) => {
      selectedChartType.value = type;
      drawChart();
    };

    const refreshChart = () => {
      emit('refresh');
      drawChart();
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
      }, 100);
    }, { deep: true });

    onMounted(() => {
      setTimeout(() => {
        drawChart();
      }, 100);
    });

    onUnmounted(() => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    });

    return {
      selectedChartType,
      expenseChart,
      selectChartType,
      refreshChart
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
}
</style>
