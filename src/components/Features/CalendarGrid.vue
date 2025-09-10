<template>
  <div class="calendar-container">
    <!-- 요일 헤더 -->
    <div class="weekdays-header">
      <div class="weekday" v-for="day in weekdays" :key="day">
        {{ day }}
      </div>
    </div>
    
    <!-- 날짜 그리드 -->
    <div class="days-container">
      <div 
        v-for="day in calendarDays" 
        :key="day.date"
        :data-date="day.date"
        class="day-card"
        :class="{ 
          'other-month': !day.isCurrentMonth,
          'today': day.isToday,
          'has-events': day.events && day.events.length > 0,
          'selected': selectedDay?.date === day.date,
          'weekend': day.isWeekend,
          'holiday': day.isHoliday,
          'disabled': day.isWeekendOrHoliday
        }"
        @click="handleDayClick(day)"
      >
        <div class="day-header">
          <span class="day-number">{{ day.day }}</span>
          <div v-if="day.isToday" class="today-indicator"></div>
          <!-- 제안 알림 뱃지 -->
          <div v-if="getProposalsForDay(day.date).length > 0" class="proposal-badge">
            {{ getProposalsForDay(day.date).length }}
          </div>
        </div>
        
        <!-- 평일인 경우에만 제안/확정 메뉴 표시 -->
        <div v-if="!day.isWeekendOrHoliday" class="day-content">
          <!-- 선택된 음식점들 표시 -->
          <div v-if="getSelectedRestaurantsForDay(day.date).length > 0" class="selected-restaurants">
            <div 
              v-for="restaurant in getSelectedRestaurantsForDay(day.date).slice(0, 2)" 
              :key="`${restaurant.name}_${restaurant.mealType}`"
              class="selected-restaurant clickable"
              :class="`meal-type-${restaurant.mealType}`"
              @click.stop="handleRestaurantClick(restaurant, day.date)"
              :title="`${restaurant.name} (${restaurant.count}명) - ${restaurant.mealType === 'lunch' ? '점심' : '저녁'} - 클릭하여 상세보기`"
            >
              <span class="restaurant-icon">{{ restaurant.mealType === 'lunch' ? '🌞' : '🌙' }}</span>
              <span class="restaurant-name">{{ restaurant.name }}</span>
              <span class="restaurant-count" v-if="restaurant.count > 1 || restaurant.externalMembers > 0">
                {{ restaurant.count + restaurant.externalMembers }}명
                <span v-if="restaurant.externalMembers > 0" class="external-count">(외부 {{ restaurant.externalMembers }}명)</span>
              </span>
              <span class="restaurant-actions-hint">✏️</span>
            </div>
            <div v-if="getSelectedRestaurantsForDay(day.date).length > 2" class="more-restaurants clickable"
                 @click.stop="handleAllRestaurantsClick(day.date)"
                 title="모든 선택된 음식점 보기">
              +{{ getSelectedRestaurantsForDay(day.date).length - 2 }}
            </div>
          </div>
          
          <!-- 확정된 메뉴 표시 (기존 제안 시스템) -->
          <div v-else-if="getConfirmedMealForDay(day.date)" class="confirmed-meal">
            <div class="meal-icon">🍽️</div>
            <div class="meal-name">{{ getConfirmedMealForDay(day.date) }}</div>
          </div>
          
          <!-- 제안 중인 메뉴들 (확정되지 않은 경우만) -->
          <div v-else-if="getProposalsForDay(day.date).length > 0" class="proposal-meals">
            <div 
              v-for="proposal in getProposalsForDay(day.date).slice(0, 2)" 
              :key="proposal.id"
              class="proposal-meal"
              :class="getProposalStatus(proposal)"
            >
              <span class="meal-icon">{{ getProposalIcon(proposal) }}</span>
              <span class="meal-name">{{ proposal.restaurant.name }}</span>
            </div>
            <div v-if="getProposalsForDay(day.date).length > 2" class="more-proposals">
              +{{ getProposalsForDay(day.date).length - 2 }}
            </div>
          </div>
        </div>
        
        <!-- 주말 표시 -->
        <div v-else-if="day.isWeekend && !day.isHoliday" class="weekend-indicator">
          <span class="weekend-text">주말</span>
        </div>
        
        <!-- 공휴일 표시 -->
        <div v-else-if="day.isHoliday" class="holiday-indicator">
          <span class="holiday-text">공휴일</span>
        </div>
        
        <!-- 이벤트 미리보기 -->
        <div v-if="day.events && day.events.length > 0" class="events-preview">
          <div 
            v-for="event in day.events.slice(0, 1)" 
            :key="event.id"
            class="event-preview"
            :class="event.type"
          >
            <span class="event-icon">{{ getEventIcon(event.type) }}</span>
            <span class="event-title">{{ event.title }}</span>
          </div>
          <div v-if="day.events.length > 1" class="more-events">
            +{{ day.events.length - 1 }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'CalendarGrid',
  props: {
    calendarDays: {
      type: Array,
      required: true
    },
    selectedDay: {
      type: Object,
      default: null
    },
    weekdays: {
      type: Array,
      default: () => ['일', '월', '화', '수', '목', '금', '토']
    },
    // 데이터 관련 props
    memberStatuses: {
      type: Object,
      default: () => ({})
    },
    proposals: {
      type: Array,
      default: () => []
    },
    actualMembers: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'day-click',
    'restaurant-click'
  ],
  setup(props, { emit }) {
    // 이벤트 핸들러
    const handleDayClick = (day) => {
      emit('day-click', day);
    };

    const handleRestaurantClick = (restaurant, date) => {
      emit('restaurant-click', { restaurant, date });
    };

    const handleAllRestaurantsClick = (date) => {
      // 첫 번째 음식점을 클릭하는 것과 동일하게 처리
      const restaurants = getSelectedRestaurantsForDay(date);
      if (restaurants.length > 0) {
        emit('restaurant-click', { restaurant: restaurants[0], date });
      }
    };

    // memberStatuses 변경 감지 (무한 루프 방지를 위해 제거)
    // watch(() => props.memberStatuses, (newStatuses, oldStatuses) => {
    //   console.log('🔄 memberStatuses 변경 감지:', { newStatuses, oldStatuses });
    //   console.log('🔄 변경된 날짜들:', Object.keys(newStatuses || {}));
    // }, { deep: true });

    // 선택된 음식점들 가져오기 (점심/저녁 구분 포함)
    const getSelectedRestaurantsForDay = (date) => {
      const dayStatuses = props.memberStatuses[date] || {};
      console.log('🔍 getSelectedRestaurantsForDay:', { date, dayStatuses });
      const restaurantMap = new Map();
      
      Object.entries(dayStatuses).forEach(([memberId, status]) => {
        console.log('🔍 멤버 상태 확인:', { memberId, status });
        if (status.status === 'available' && status.details?.restaurant) {
          const restaurantName = status.details.restaurant;
          const mealType = status.details.mealType || 'lunch';
          const member = props.actualMembers.find(m => m.id === memberId);
          
          console.log('✅ 음식점 정보 발견:', { restaurantName, mealType, member });
          
          if (member) {
            // 점심/저녁별로 그룹화
            const key = `${restaurantName}_${mealType}`;
            
            if (restaurantMap.has(key)) {
              restaurantMap.get(key).count++;
              restaurantMap.get(key).members.push(member);
            } else {
              restaurantMap.set(key, {
                name: restaurantName,
                count: 1,
                members: [member],
                mealType: mealType,
                groupId: status.details.groupId,
                externalMembers: status.details.externalMembers || 0
              });
            }
          }
        }
      });
      
      return Array.from(restaurantMap.values());
    };

    // 확정된 메뉴 가져오기
    const getConfirmedMealForDay = (date) => {
      const dayProposals = props.proposals.filter(p => p.date === date);
      const confirmedProposal = dayProposals.find(p => p.status === 'confirmed');
      return confirmedProposal ? confirmedProposal.restaurant.name : null;
    };

    // 제안들 가져오기
    const getProposalsForDay = (date) => {
      return props.proposals.filter(p => p.date === date);
    };

    // 제안 상태 가져오기
    const getProposalStatus = (proposal) => {
      return proposal.status || 'pending';
    };

    // 제안 아이콘 가져오기
    const getProposalIcon = (proposal) => {
      const status = getProposalStatus(proposal);
      switch (status) {
        case 'confirmed': return '🎉';
        case 'rejected': return '❌';
        default: return '⏳';
      }
    };

    // 이벤트 아이콘 가져오기
    const getEventIcon = (type) => {
      const icons = {
        'meeting': '📅',
        'holiday': '🎉',
        'birthday': '🎂',
        'anniversary': '💝',
        'default': '📌'
      };
      return icons[type] || icons.default;
    };

    return {
      handleDayClick,
      handleRestaurantClick,
      handleAllRestaurantsClick,
      getSelectedRestaurantsForDay,
      getConfirmedMealForDay,
      getProposalsForDay,
      getProposalStatus,
      getProposalIcon,
      getEventIcon
    };
  }
};
</script>

<style scoped>
.calendar-container {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  flex-shrink: 0;
  padding: 8px 4px;
}

.weekday {
  padding: var(--spacing-md);
  text-align: center;
  font-weight: 700;
  color: #374151;
  font-size: var(--text-base);
}

.days-container {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  background: #f1f5f9;
  overflow-y: auto;
  max-height: 70vh;
  flex: 1;
  padding: 4px;
}

.day-card {
  background: var(--bg-primary);
  min-height: 140px;
  padding: var(--spacing-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin: 1px;
}

.day-card:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.day-card.other-month {
  background: var(--bg-muted);
  color: var(--text-muted);
}

.day-card.today {
  background: var(--accent-light);
  border: 2px solid var(--accent-primary);
}

.day-card.selected {
  background: var(--accent-primary);
  color: white;
}

.day-card.weekend {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.day-card.holiday {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.day-card.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xs);
}

.day-number {
  font-weight: 600;
  font-size: var(--text-base);
}

.today-indicator {
  width: 6px;
  height: 6px;
  background: var(--accent-primary);
  border-radius: 50%;
}

.proposal-badge {
  background: var(--accent-primary);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
}

.day-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.selected-restaurants {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.selected-restaurant {
  border-radius: var(--radius-sm);
  padding: 2px 4px;
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 2px;
  transition: all 0.2s ease;
  border: 1px solid;
}

/* 점심 스타일 (연한 초록색) */
.selected-restaurant.meal-type-lunch {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border-color: #10b981;
  color: #065f46;
}

.selected-restaurant.meal-type-lunch:hover {
  background: #10b981;
  color: white;
}

/* 저녁 스타일 (연한 붉은색) */
.selected-restaurant.meal-type-dinner {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
  border-color: #ef4444;
  color: #991b1b;
}

.selected-restaurant.meal-type-dinner:hover {
  background: #ef4444;
  color: white;
}

.restaurant-icon {
  font-size: 8px;
}

.restaurant-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.restaurant-count {
  font-size: 8px;
  opacity: 0.8;
}

.restaurant-actions-hint {
  font-size: 8px;
  opacity: 0.6;
}

.external-count {
  font-size: 7px;
  opacity: 0.8;
  color: #6b7280;
}

.more-restaurants {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 2px 4px;
  font-size: 10px;
  text-align: center;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.more-restaurants:hover {
  background: var(--bg-hover);
}

.confirmed-meal {
  background: var(--success-light);
  border: 1px solid var(--success-primary);
  border-radius: var(--radius-sm);
  padding: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
}

.meal-icon {
  font-size: 12px;
}

.meal-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.proposal-meals {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.proposal-meal {
  background: var(--warning-light);
  border: 1px solid var(--warning-primary);
  border-radius: var(--radius-sm);
  padding: 2px 4px;
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.proposal-meal.confirmed {
  background: var(--success-light);
  border-color: var(--success-primary);
}

.proposal-meal.rejected {
  background: var(--error-light);
  border-color: var(--error-primary);
}

.more-proposals {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 2px 4px;
  font-size: 10px;
  text-align: center;
  color: var(--text-secondary);
}

.weekend-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  background: #f3f4f6;
  border-radius: 6px;
  margin: 2px;
}

.holiday-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 12px;
  font-weight: 600;
  color: #dc2626;
  background: #fef2f2;
  border-radius: 6px;
  margin: 2px;
}

.events-preview {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-preview {
  background: var(--info-light);
  border: 1px solid var(--info-primary);
  border-radius: var(--radius-sm);
  padding: 2px 4px;
  font-size: 9px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.event-icon {
  font-size: 8px;
}

.event-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-events {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 1px 3px;
  font-size: 8px;
  text-align: center;
  color: var(--text-secondary);
}

.clickable {
  cursor: pointer;
}

.clickable:hover {
  transform: scale(1.02);
}
</style>
