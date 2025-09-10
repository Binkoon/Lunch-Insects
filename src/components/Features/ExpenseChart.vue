<template>
  <section class="expense-chart-section">
    <!-- 대시보드 통계 카드 -->
    <DashboardStats
      :monthly-visits="monthlyVisits"
      :total-visits="totalVisits"
      :total-ticket-points="totalTicketPoints"
      :total-cash="totalCash"
      :current-month-ticket-points="currentMonthTicketPoints"
      :current-month-cash="currentMonthCash"
    />

    <!-- 월별 소비금액 분석 차트 -->
    <ExpenseChartComponent
      :monthly-expense-data="monthlyExpenseData"
      @refresh="handleRefresh"
    />
    
    <!-- 음식점 방문 통계 -->
    <RestaurantStats
      :group-id="groupId"
      @refresh="handleRefresh"
    />
  </section>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import DashboardStats from './DashboardStats.vue';
import ExpenseChartComponent from './ExpenseChartComponent.vue';
import RestaurantStats from './RestaurantStats.vue';

export default {
  name: 'ExpenseChart',
  components: {
    DashboardStats,
    ExpenseChartComponent,
    RestaurantStats
  },
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
    },
    groupId: {
      type: String,
      default: 'default-group'
    }
  },
  emits: ['refresh'],
  setup(props, { emit }) {
    // 대시보드 통계 데이터
    const monthlyVisits = ref(0);
    const totalVisits = ref(0);
    const totalTicketPoints = ref(0);
    const totalCash = ref(0);
    const currentMonthTicketPoints = ref(0);
    const currentMonthCash = ref(0);

    // 통계 계산
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

    const sumArray = (arr) => {
      return arr.reduce((sum, val) => sum + val, 0);
    };

    const handleRefresh = () => {
      emit('refresh');
    };

    // 데이터 변경 감지
    watch(() => props.monthlyExpenseData, () => {
      setTimeout(() => {
        calculateDashboardStats();
      }, 100);
    }, { deep: true });

    onMounted(() => {
      setTimeout(() => {
        calculateDashboardStats();
      }, 100);
    });

    return {
      monthlyVisits,
      totalVisits,
      totalTicketPoints,
      totalCash,
      currentMonthTicketPoints,
      currentMonthCash,
      handleRefresh
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

/* 반응형 디자인 */
@media (max-width: 768px) {
  .expense-chart-section {
    padding: 1.5rem;
    margin-top: 1.5rem;
  }
}
</style>