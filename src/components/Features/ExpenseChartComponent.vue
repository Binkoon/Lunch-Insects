<template>
  <div class="expense-chart-container">
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
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useChart } from '@/composables/useChart.js';
import { CHART_COLORS, getCurrentYearQuarterLabels, getCurrentYearMonthLabels, CHART_OPTIONS } from '@/constants/chartConstants.js';

export default {
  name: 'ExpenseChartComponent',
  props: {
    monthlyExpenseData: {
      type: Object,
      default: () => ({
        personal: {
          daily: [],
          monthly: {
            ticketPoints: 0,
            cash: 0,
            total: 0
          }
        },
        group: {
          daily: {},
          monthly: {}
        }
      })
    }
  },
  emits: ['refresh'],
  setup(props, { emit }) {
    const selectedChartType = ref('personal');
    const expenseChart = ref(null);
    let chartInstance = null;
    
    const { createChart, updateChart, destroyChart } = useChart();

    const selectChartType = (type) => {
      selectedChartType.value = type;
      updateChartData();
    };

    const refreshChart = () => {
      emit('refresh');
      updateChartData();
    };

    const sumArray = (arr) => {
      return arr.reduce((sum, val) => sum + val, 0);
    };

    const updateChartData = () => {
      if (!expenseChart.value) return;
      
      const newData = getChartData();
      
      // 차트가 없으면 새로 생성, 있으면 업데이트
      if (!chartInstance) {
        chartInstance = createChart(expenseChart.value, newData);
      } else {
        updateChart(newData.data, newData.options);
      }
    };

    // 데이터 기반 라벨 생성
    const generateLabelsFromData = (data) => {
      if (!data || Object.keys(data).length === 0) {
        return getCurrentYearQuarterLabels();
      }
      
      // 분기별 데이터인지 확인 (Q1, Q2, Q3, Q4 키가 있는지)
      const dataKeys = Object.keys(data).sort();
      const isQuarterlyData = dataKeys.some(key => key.startsWith('Q'));
      
      if (isQuarterlyData) {
        // 분기별 데이터인 경우
        return dataKeys.map(key => {
          const quarter = key.replace('Q', '');
          return `${new Date().getFullYear()}년 Q${quarter}`;
        });
      } else {
        // 월별 데이터인 경우
        return dataKeys.map(key => `${key}월`);
      }
    };

    const getChartData = () => {
      if (selectedChartType.value === 'personal') {
        // 개인 소비 - 일별 누적 꺾은선 그래프
        const dailyData = props.monthlyExpenseData.personal.daily || [];
        
        if (dailyData.length === 0) {
          return {
            type: 'line',
            data: {
              labels: ['데이터 없음'],
              datasets: [{
                label: '데이터 없음',
                data: [0],
                borderColor: 'rgba(200, 200, 200, 0.5)',
                backgroundColor: 'rgba(200, 200, 200, 0.1)'
              }]
            },
            options: {
              ...CHART_OPTIONS,
              plugins: {
                ...CHART_OPTIONS.plugins,
                title: {
                  display: true,
                  text: '개인 일별 누적 소비 (이번 달)',
                  font: { size: 16, weight: 'bold' }
                }
              }
            }
          };
        }
        
        // 일별 라벨 생성 (1일부터 해당 월의 마지막 일까지)
        const labels = dailyData.map(day => `${day.day}일`);
        
        return {
          type: 'line',
          data: {
            labels,
            datasets: [
              {
                label: '식권포인트 (누적)',
                data: dailyData.map(day => day.cumulativeTicketPoints),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                borderWidth: 3
              },
              {
                label: '현금 (누적)',
                data: dailyData.map(day => day.cumulativeCash),
                borderColor: '#4ecdc4',
                backgroundColor: 'rgba(78, 205, 196, 0.1)',
                tension: 0.4,
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#4ecdc4',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                borderWidth: 3
              }
            ]
          },
          options: {
            ...CHART_OPTIONS,
            plugins: {
              ...CHART_OPTIONS.plugins,
              title: {
                display: true,
                text: '개인 일별 누적 소비 (이번 달)',
                font: { size: 16, weight: 'bold' }
              },
              legend: {
                display: true,
                position: 'top',
                labels: {
                  usePointStyle: true,
                  padding: 20
                }
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: '일 (DAY)',
                  font: { size: 14, weight: 'bold' }
                },
                grid: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              },
              y: {
                beginAtZero: true,
                min: 0,
                title: {
                  display: true,
                  text: '금액 (원)',
                  font: { size: 14, weight: 'bold' }
                },
                ticks: {
                  stepSize: 50000,
                  callback: function(value) {
                    return value.toLocaleString() + '원';
                  }
                },
                grid: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              }
            },
            interaction: {
              intersect: false,
              mode: 'index'
            }
          }
        };
      } else {
        // 그룹 소비 - 멤버별 막대 그래프
        const groupMonthlyData = props.monthlyExpenseData.group.monthly || {};
        const memberIds = Object.keys(groupMonthlyData);
        
        if (memberIds.length === 0) {
          return {
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
              ...CHART_OPTIONS,
              plugins: {
                ...CHART_OPTIONS.plugins,
                title: {
                  display: true,
                  text: '그룹 멤버별 월별 소비',
                  font: { size: 16, weight: 'bold' }
                }
              }
            }
          };
        }
        
        // 멤버 이름을 가져오기 위해 임시로 UID 사용 (실제로는 useCalendar에서 가져온 멤버 정보 사용)
        const memberNames = memberIds.map(id => `사용자 ${id.slice(-4)}`);
        const ticketTotals = memberIds.map(id => groupMonthlyData[id]?.ticketPoints || 0);
        const cashTotals = memberIds.map(id => groupMonthlyData[id]?.cash || 0);
        
        return {
          type: 'bar',
          data: {
            labels: memberNames,
            datasets: [
              {
                label: '식권포인트',
                data: ticketTotals,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: '#3b82f6',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
              },
              {
                label: '현금',
                data: cashTotals,
                backgroundColor: 'rgba(78, 205, 196, 0.8)',
                borderColor: '#4ecdc4',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
              }
            ]
          },
          options: {
            ...CHART_OPTIONS,
            plugins: {
              ...CHART_OPTIONS.plugins,
              title: {
                display: true,
                text: '그룹 멤버별 월별 소비 (이번 달)',
                font: { size: 16, weight: 'bold' }
              },
              legend: {
                display: true,
                position: 'top',
                labels: {
                  usePointStyle: true,
                  padding: 20
                }
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: '그룹 멤버',
                  font: { size: 14, weight: 'bold' }
                },
                grid: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              },
              y: {
                beginAtZero: true,
                min: 0,
                title: {
                  display: true,
                  text: '금액 (원)',
                  font: { size: 14, weight: 'bold' }
                },
                ticks: {
                  stepSize: 50000,
                  callback: function(value) {
                    return value.toLocaleString() + '원';
                  }
                },
                grid: {
                  display: true,
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              }
            },
            interaction: {
              intersect: false,
              mode: 'index'
            }
          }
        };
      }
    };

    // 데이터 변경 감지
    watch(() => props.monthlyExpenseData, () => {
      setTimeout(() => {
        updateChartData();
      }, 100);
    }, { deep: true });

    onMounted(() => {
      setTimeout(() => {
        updateChartData();
      }, 100);
    });

    onUnmounted(() => {
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
      destroyChart();
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
.expense-chart-container {
  margin-top: 2rem;
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