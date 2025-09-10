<template>
  <div class="calendar-header">
    <div class="header-top">
      <div class="month-navigation">
        <button @click="$emit('prev-month')" class="nav-btn prev">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>
        <h2 class="month-title">{{ currentMonthText }}</h2>
        <button @click="$emit('next-month')" class="nav-btn next">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 멤버 상태 범례 -->
    <div class="member-legend">
      <div class="legend-title">팀원 상태</div>
      <div class="legend-items">
        <div class="legend-item" v-for="member in actualMembers" :key="member.id">
          <div 
            class="member-dot" 
            :style="{ backgroundColor: member.color }"
          ></div>
          <span class="member-name">{{ member.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CalendarHeader',
  props: {
    currentMonthText: {
      type: String,
      required: true
    },
    actualMembers: {
      type: Array,
      required: true
    }
  },
  emits: ['prev-month', 'next-month']
}
</script>

<style scoped>
.calendar-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-top {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.month-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  text-align: center;
  min-width: 200px;
}

.member-legend {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  backdrop-filter: blur(10px);
}

.legend-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  opacity: 0.9;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.member-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.member-name {
  font-size: 0.85rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .calendar-header {
    padding: 1rem;
  }
  
  .month-title {
    font-size: 1.25rem;
    min-width: 150px;
  }
  
  .legend-items {
    gap: 0.75rem;
  }
  
  .member-name {
    font-size: 0.8rem;
  }
}
</style>
