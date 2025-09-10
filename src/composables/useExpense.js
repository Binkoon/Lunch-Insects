import { ref, computed } from 'vue';
import { getUserMonthlyExpenses, getGroupMembersMonthlyExpenses } from '@/services/firebaseDBv2.js';

/**
 * 지출 관련 비즈니스 로직을 관리하는 Composable
 * 단일책임: 지출 데이터 관리, 통계, 차트 데이터
 */
export const useExpense = () => {
  // 상태
  const loading = ref(false);
  const monthlyExpenseData = ref({
    personal: {
      ticketPoints: 0,
      cash: 0,
      total: 0
    },
    group: {}
  });
  const statsData = ref({
    totalVisits: 0,
    averageSpending: 0,
    topCategory: '',
    monthlyTrend: []
  });
  const expenseChart = ref(null);

  // 월별 지출 데이터 로드 (개인)
  const loadMonthlyExpenseData = async (userId) => {
    if (!userId || userId === 'guest') {
      console.log('게스트 사용자 - 지출 데이터 로드 스킵');
      return;
    }

    try {
      loading.value = true;
      console.log('개인 월별 지출 데이터 로드 시작...');
      
      // Firebase에서 실제 월별 지출 데이터 가져오기
      const expenses = await getUserMonthlyExpenses(userId);
      
      if (expenses) {
        // 분기별 데이터로 변환
        const quarterlyData = convertToQuarterlyData(expenses);
        monthlyExpenseData.value.personal = quarterlyData;
      } else {
        // 데이터가 없는 경우 기본값 설정 (분기별)
        monthlyExpenseData.value.personal = {
          Q1: { ticketPoints: 0, cash: 0, total: 0 },
          Q2: { ticketPoints: 0, cash: 0, total: 0 },
          Q3: { ticketPoints: 0, cash: 0, total: 0 },
          Q4: { ticketPoints: 0, cash: 0, total: 0 }
        };
      }
      
      console.log('개인 월별 지출 데이터 로드 완료:', monthlyExpenseData.value.personal);
    } catch (error) {
      console.error('개인 월별 지출 데이터 로드 실패:', error);
      // 오류 시 기본값 설정
      monthlyExpenseData.value.personal = {
        Q1: { ticketPoints: 0, cash: 0, total: 0 },
        Q2: { ticketPoints: 0, cash: 0, total: 0 },
        Q3: { ticketPoints: 0, cash: 0, total: 0 },
        Q4: { ticketPoints: 0, cash: 0, total: 0 }
      };
    } finally {
      loading.value = false;
    }
  };

  // 월별 데이터를 분기별 데이터로 변환
  const convertToQuarterlyData = (monthlyData) => {
    const quarters = {
      Q1: { ticketPoints: 0, cash: 0, total: 0 },
      Q2: { ticketPoints: 0, cash: 0, total: 0 },
      Q3: { ticketPoints: 0, cash: 0, total: 0 },
      Q4: { ticketPoints: 0, cash: 0, total: 0 }
    };

    // 월별 데이터를 분기별로 집계
    Object.entries(monthlyData).forEach(([month, data]) => {
      const monthNum = parseInt(month);
      const quarter = Math.ceil(monthNum / 3);
      const quarterKey = `Q${quarter}`;
      
      if (quarters[quarterKey]) {
        quarters[quarterKey].ticketPoints += data.ticketPoints || 0;
        quarters[quarterKey].cash += data.cash || 0;
        quarters[quarterKey].total += (data.ticketPoints || 0) + (data.cash || 0);
      }
    });

    return quarters;
  };

  // 월별 지출 데이터 로드 (그룹)
  const loadGroupMonthlyExpenseData = async (groupId) => {
    if (!groupId) {
      console.log('그룹 ID 없음 - 그룹 지출 데이터 로드 스킵');
      monthlyExpenseData.value.group = {};
      return;
    }

    try {
      loading.value = true;
      console.log('그룹 월별 지출 데이터 로드 시작...');
      
      // Firebase에서 그룹 월별 지출 데이터 가져오기
      const groupData = await getGroupMonthlyExpenses(groupId);
      
      if (groupData) {
        monthlyExpenseData.value.group = groupData;
        console.log('그룹 월별 지출 데이터 로드 완료:', groupData);
      } else {
        monthlyExpenseData.value.group = {};
        console.log('그룹 월별 지출 데이터 없음');
      }
    } catch (error) {
      console.error('그룹 월별 지출 데이터 로드 실패:', error);
      monthlyExpenseData.value.group = {};
    } finally {
      loading.value = false;
    }
  };

  // 통계 데이터 로드
  const loadStatsData = async (userId, groupId) => {
    try {
      loading.value = true;
      console.log('통계 데이터 로드 시작...');
      
      // 실제 통계 데이터 계산 로직 (Firebase에서 데이터 가져와서 계산)
      // 여기서는 임시 데이터로 구현
      statsData.value = {
        totalVisits: Math.floor(Math.random() * 50) + 10,
        averageSpending: Math.floor(Math.random() * 50000) + 20000,
        topCategory: '한식',
        monthlyTrend: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          amount: Math.floor(Math.random() * 100000) + 50000
        }))
      };
      
      console.log('통계 데이터 로드 완료:', statsData.value);
    } catch (error) {
      console.error('통계 데이터 로드 실패:', error);
      statsData.value = {
        totalVisits: 0,
        averageSpending: 0,
        topCategory: '',
        monthlyTrend: []
      };
    } finally {
      loading.value = false;
    }
  };

  // 차트 새로고침
  const refreshExpenseChart = async () => {
    try {
      if (expenseChart.value && expenseChart.value.refreshVisitStats) {
        console.log('지출 차트 새로고침');
        await expenseChart.value.refreshVisitStats();
      }
    } catch (error) {
      console.error('지출 차트 새로고침 실패:', error);
    }
  };

  // 지출 데이터 새로고침 (개인 + 그룹)
  const refreshExpenseData = async (userId, groupId) => {
    try {
      console.log('지출 데이터 새로고침 시작');
      await loadMonthlyExpenseData(userId);
      if (groupId) {
        await loadGroupMonthlyExpenseData(groupId);
      }
      await refreshExpenseChart();
      console.log('지출 데이터 새로고침 완료');
    } catch (error) {
      console.error('지출 데이터 새로고침 실패:', error);
    }
  };

  return {
    // 상태
    loading,
    monthlyExpenseData,
    statsData,
    expenseChart,
    
    // 메서드
    loadMonthlyExpenseData,
    loadGroupMonthlyExpenseData,
    loadStatsData,
    refreshExpenseChart,
    refreshExpenseData,
    convertToQuarterlyData
  };
};
