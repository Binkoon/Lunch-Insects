import { ref, onUnmounted } from 'vue';
import { Chart, registerables } from 'chart.js';

// Chart.js 등록
Chart.register(...registerables);

export const useChart = () => {
  const chartInstance = ref(null);

  const createChart = (canvas, config) => {
    if (!canvas) return null;
    
    // 기존 차트 인스턴스가 있으면 제거
    if (chartInstance.value) {
      chartInstance.value.destroy();
      chartInstance.value = null;
    }
    
    const ctx = canvas.getContext('2d');
    chartInstance.value = new Chart(ctx, config);
    return chartInstance.value;
  };

  const updateChart = (newData, newOptions = null) => {
    if (!chartInstance.value) return;
    
    // 데이터 업데이트
    if (newData) {
      chartInstance.value.data = newData;
    }
    
    // 옵션 업데이트
    if (newOptions) {
      Object.assign(chartInstance.value.options, newOptions);
    }
    
    // 차트 업데이트 (애니메이션 없이)
    chartInstance.value.update('none');
  };

  const destroyChart = () => {
    if (chartInstance.value) {
      chartInstance.value.destroy();
      chartInstance.value = null;
    }
  };

  const getChartInstance = () => {
    return chartInstance.value;
  };

  // 컴포넌트 언마운트 시 자동 정리
  onUnmounted(() => {
    destroyChart();
  });

  return {
    createChart,
    updateChart,
    destroyChart,
    getChartInstance
  };
};
