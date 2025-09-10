<template>
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
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'DashboardStats',
  props: {
    monthlyVisits: {
      type: Number,
      default: 0
    },
    totalVisits: {
      type: Number,
      default: 0
    },
    totalTicketPoints: {
      type: Number,
      default: 0
    },
    totalCash: {
      type: Number,
      default: 0
    },
    currentMonthTicketPoints: {
      type: Number,
      default: 0
    },
    currentMonthCash: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
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

    return {
      getCurrentMonth,
      formatCurrency,
      getMonthlyChange
    };
  }
};
</script>

<style scoped>
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
}
</style>
