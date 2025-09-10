<template>
  <div v-if="show" class="modal-overlay" @click="close">
    <div class="modal-content restaurant-detail-modal" @click.stop>
      <div class="modal-header">
        <h3>🍽️ {{ restaurant?.name }}</h3>
        <button @click="close" class="close-btn">×</button>
      </div>
      
      <div class="modal-body">
        <div class="restaurant-detail-info">
          <div class="detail-section">
            <h4>📅 {{ formatSelectedDate(date) }} 선택 현황</h4>
            <div class="selected-members">
              <div 
                v-for="member in restaurantMembers" 
                :key="member.id"
                class="member-card"
              >
                <div class="member-avatar" :style="{ backgroundColor: member.color }">
                  {{ member.name.charAt(0) }}
                </div>
                <div class="member-info">
                  <span class="member-name">{{ member.name }}</span>
                  <span class="selection-time">{{ member.selectionTime }}</span>
                  
                  <!-- 함께 밥을 먹은 동료들 -->
                  <div v-if="member.participants && member.participants.length > 0" class="participants-info">
                    <span class="participants-label">👥 함께:</span>
                    <span class="participants-list">{{ member.participants.join(', ') }}</span>
                    <span v-if="member.externalMembers > 0" class="external-members-info">
                      + 외부 {{ member.externalMembers }}명
                    </span>
                  </div>
                  
                  <!-- 지출액 정보 -->
                  <div v-if="member.totalAmount > 0" class="expense-info">
                    <span class="expense-label">💰 지출:</span>
                    <span class="expense-amount">{{ member.totalAmount.toLocaleString() }}원</span>
                    <div class="expense-breakdown">
                      <span v-if="member.mealCard" class="meal-card">식권 {{ member.mealCard.toLocaleString() }}원</span>
                      <span v-if="member.cash" class="cash">현금 {{ member.cash.toLocaleString() }}원</span>
                    </div>
                  </div>
                </div>
                <div class="member-actions">
                  <button 
                    v-if="canEditMember(member.id)"
                    @click="editMember(member.id)"
                    class="edit-btn"
                    title="수정"
                  >
                    ✏️
                  </button>
                  <button 
                    v-if="canEditMember(member.id)"
                    @click="cancelMember(member.id)"
                    class="cancel-btn"
                    title="취소"
                  >
                    ❌
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>📊 통계 정보</h4>
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">이번달 선택</span>
                <span class="stat-value">{{ stats.monthlyCount }}회</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">총 방문</span>
                <span class="stat-value">{{ stats.totalCount }}회</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="close" class="btn-secondary">닫기</button>
        <button 
          v-if="!currentUserSelected"
          @click="selectRestaurant"
          class="btn-primary"
        >
          나도 선택하기
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'RestaurantDetailModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    restaurant: {
      type: Object,
      default: null
    },
    date: {
      type: String,
      default: ''
    },
    restaurantMembers: {
      type: Array,
      default: () => []
    },
    stats: {
      type: Object,
      default: () => ({
        monthlyCount: 0,
        totalCount: 0
      })
    },
    currentUser: {
      type: Object,
      default: null
    }
  },
  emits: [
    'close',
    'edit-member',
    'cancel-member',
    'select-restaurant'
  ],
  setup(props, { emit }) {
    // 현재 사용자가 이 음식점을 선택했는지 확인
    const currentUserSelected = computed(() => {
      if (!props.currentUser || !props.restaurant) return false;
      return props.restaurantMembers.some(member => 
        member.id === props.currentUser.uid || member.id === props.currentUser.id
      );
    });

    // 날짜 포맷팅
    const formatSelectedDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    };

    // 멤버 수정 가능 여부 확인
    const canEditMember = (memberId) => {
      if (!props.currentUser) return false;
      return memberId === props.currentUser.uid || memberId === props.currentUser.id;
    };

    // 이벤트 핸들러
    const close = () => {
      emit('close');
    };

    const editMember = (memberId) => {
      emit('edit-member', memberId);
    };

    const cancelMember = (memberId) => {
      emit('cancel-member', memberId);
    };

    const selectRestaurant = () => {
      emit('select-restaurant');
    };

    return {
      currentUserSelected,
      formatSelectedDate,
      canEditMember,
      close,
      editMember,
      cancelMember,
      selectRestaurant
    };
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.restaurant-detail-modal {
  width: 600px;
  max-width: 90vw;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--text-xl);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.modal-body {
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
}

.restaurant-detail-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.detail-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
}

.detail-section h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-primary);
  font-size: var(--text-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.selected-members {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.member-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.member-card:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.member-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: var(--text-sm);
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.member-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.selection-time {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.participants-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: 2px;
}

.participants-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.participants-list {
  font-size: var(--text-xs);
  color: var(--text-primary);
  background: var(--info-light);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.external-members-info {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  background: #fef3c7;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  margin-left: 4px;
}

.expense-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
}

.expense-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.expense-amount {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--success-primary);
}

.expense-breakdown {
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--text-xs);
}

.meal-card {
  color: var(--info-primary);
  background: var(--info-light);
  padding: 2px 4px;
  border-radius: var(--radius-sm);
}

.cash {
  color: var(--warning-primary);
  background: var(--warning-light);
  padding: 2px 4px;
  border-radius: var(--radius-sm);
}

.member-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.edit-btn,
.cancel-btn {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  cursor: pointer;
  font-size: var(--text-xs);
  transition: all 0.2s ease;
}

.edit-btn {
  color: var(--info-primary);
  border-color: var(--info-primary);
}

.edit-btn:hover {
  background: var(--info-primary);
  color: white;
}

.cancel-btn {
  color: var(--error-primary);
  border-color: var(--error-primary);
}

.cancel-btn:hover {
  background: var(--error-primary);
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-sm);
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--accent-primary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.btn-secondary,
.btn-primary {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--bg-hover);
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}
</style>
