<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ modalData.member?.name }} - {{ modalData.date }} 상태 편집</h3>
          <button @click="$emit('close')" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <!-- 다른 멤버들의 상태 표시 -->
          <div class="members-status-section">
            <h4 class="section-title">
              👥 팀원들 상태
            </h4>
            <div class="members-list">
              <div 
                v-for="member in modalData.allMembers" 
                :key="member.id"
                class="member-item"
                :class="getMemberStatusClass(modalData.date, member.id)"
              >
                <div class="member-avatar"
                     :style="{ backgroundColor: member.color }">
                  {{ member.name.charAt(0) }}
                </div>
                <div class="member-info">
                  <div class="member-name">{{ member.name }}</div>
                  <div class="member-status">{{ getMemberStatusText(modalData.date, member.id) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="section-divider"></div>
          
          <div class="status-setting-section">
            <h4 class="section-title">
              ⚙️ 내 상태 설정
            </h4>
            <div class="status-options">
              <label 
                v-for="status in statusOptions" 
                :key="status.value"
                class="status-option"
                :class="{ 'selected': editingStatus === status.value }"
              >
                <input 
                  type="radio" 
                  :value="status.value" 
                  v-model="editingStatus"
                />
                <span class="status-icon">{{ status.icon }}</span>
                <span class="status-label">{{ status.label }}</span>
              </label>
            </div>
          </div>
          
          <!-- 가능 선택 시 방문 음식점 입력 -->
          <div v-if="editingStatus === 'available'" class="restaurant-visit-section">
            <div class="restaurant-input-wrapper">
              <label class="input-label">방문한 음식점</label>
              <div class="restaurant-dropdown">
                <input 
                  class="restaurant-input"
                  v-model="mealDetails.restaurant"
                  placeholder="음식점 검색"
                  @focus="handleInputFocus"
                  @input="handleInputChange"
                  @blur="handleInputBlur"
                />
                <div v-if="dropdownOpen && modalData.restaurants?.length" 
                     class="dropdown-list"
                     @mousedown.prevent>
                  <div class="dropdown-header">
                    <span class="dropdown-title">🔍 음식점 검색 결과</span>
                    <button @click="closeDropdown" class="dropdown-close">×</button>
                  </div>
                  <div class="dropdown-items">
                    <div
                      v-for="r in filteredRestaurants"
                      :key="r"
                      class="dropdown-item"
                      @click="selectRestaurant(r)"
                    >
                      <span class="restaurant-icon">🍽️</span>
                      <span class="restaurant-name">{{ r }}</span>
                    </div>
                    <div v-if="filteredRestaurants.length === 0 && mealDetails.restaurant" class="dropdown-empty">
                      <span class="empty-icon">🔍</span>
                      <span class="empty-text">검색 결과가 없습니다</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="input-hint">목록에 없으면 그대로 입력하세요.</div>
            </div>
          </div>
          
          <!-- 휴가 정보 -->
          <div v-if="editingStatus === 'vacation'" class="detail-input-section">
            <div class="detail-input-wrapper">
              <label class="input-label">휴가 사유</label>
              <input 
                v-model="vacationDetails.reason"
                placeholder="휴가 사유를 입력하세요"
                class="detail-input"
              />
            </div>
          </div>
          
          <!-- 다른 약속 정보 -->
          <div v-if="editingStatus === 'other'" class="detail-input-section">
            <div class="detail-input-wrapper">
              <label class="input-label">약속 내용</label>
              <input 
                v-model="otherDetails.description"
                placeholder="약속 내용을 입력하세요"
                class="detail-input"
              />
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="$emit('close')" class="btn-cancel">
            취소
          </button>
          <button @click="handleSave" class="btn-save">
            저장
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'StatusModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    modalData: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    // 상태 관리
    const editingStatus = ref('');
    const mealDetails = ref({ restaurant: '' });
    const vacationDetails = ref({ reason: '' });
    const otherDetails = ref({ description: '' });
    const dropdownOpen = ref(false);

    // 상태 옵션
    const statusOptions = [
      { value: 'available', label: '가능', icon: '✅' },
      { value: 'vacation', label: '휴가(불가능)', icon: '🌴' },
      { value: 'other', label: '다른 약속(불가능)', icon: '📅' },
      { value: 'solo', label: '혼밥 예정(불가능)', icon: '🍱' },
      { value: 'skip', label: '밥 스킵(불가능)', icon: '⏭️' }
    ];

    // 필터링된 음식점 목록
    const filteredRestaurants = computed(() => {
      if (!props.modalData.restaurants || !mealDetails.value.restaurant) {
        return props.modalData.restaurants || [];
      }
      return props.modalData.restaurants.filter(restaurant => 
        restaurant.toLowerCase().includes(mealDetails.value.restaurant.toLowerCase())
      );
    });

    // 드롭다운 핸들러
    const handleInputFocus = () => {
      dropdownOpen.value = true;
    };

    const handleInputChange = () => {
      dropdownOpen.value = true;
    };

    const handleInputBlur = () => {
      setTimeout(() => {
        dropdownOpen.value = false;
      }, 200);
    };

    const closeDropdown = () => {
      dropdownOpen.value = false;
    };

    const selectRestaurant = (restaurant) => {
      mealDetails.value.restaurant = restaurant;
      dropdownOpen.value = false;
    };

    // 상태 클래스 및 텍스트
    const getMemberStatusClass = (date, memberId) => {
      const memberStatus = props.modalData.memberStatuses?.[date]?.[memberId]?.status;
      return {
        'status-available': memberStatus === 'available',
        'status-vacation': memberStatus === 'vacation',
        'status-other': memberStatus === 'other',
        'status-solo': memberStatus === 'solo',
        'status-skip': memberStatus === 'skip'
      };
    };

    const getMemberStatusText = (date, memberId) => {
      const memberStatus = props.modalData.memberStatuses?.[date]?.[memberId]?.status;
      const statusTexts = {
        'available': '가능',
        'vacation': '휴가',
        'other': '다른 약속',
        'solo': '혼밥 예정',
        'skip': '밥 스킵'
      };
      return statusTexts[memberStatus] || '미정';
    };

    // 저장 핸들러
    const handleSave = () => {
      const statusData = {
        status: editingStatus.value,
        details: getStatusDetails()
      };
      emit('save', statusData);
    };

    const getStatusDetails = () => {
      if (editingStatus.value === 'available') {
        return { restaurant: mealDetails.value.restaurant };
      } else if (editingStatus.value === 'vacation') {
        return { reason: vacationDetails.value.reason };
      } else if (editingStatus.value === 'other') {
        return { description: otherDetails.value.description };
      }
      return {};
    };

    // 모달 데이터 변경 시 상태 초기화
    watch(() => props.modalData, (newData) => {
      if (newData && newData.currentStatus) {
        editingStatus.value = newData.currentStatus;
        
        // 기존 데이터 로드
        const existingStatus = newData.memberStatuses?.[newData.date]?.[newData.member?.id];
        if (existingStatus) {
          if (existingStatus.status === 'available') {
            mealDetails.value = { restaurant: existingStatus.details?.restaurant || '' };
          } else if (existingStatus.status === 'vacation') {
            vacationDetails.value = { reason: existingStatus.details?.reason || '' };
          } else if (existingStatus.status === 'other') {
            otherDetails.value = { description: existingStatus.details?.description || '' };
          }
        }
      }
    }, { immediate: true });

    // body 스크롤 관리
    watch(() => props.show, (show) => {
      if (show) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
        // 상태 초기화
        editingStatus.value = '';
        mealDetails.value = { restaurant: '' };
        vacationDetails.value = { reason: '' };
        otherDetails.value = { description: '' };
        dropdownOpen.value = false;
      }
    });

    return {
      editingStatus,
      mealDetails,
      vacationDetails,
      otherDetails,
      dropdownOpen,
      statusOptions,
      filteredRestaurants,
      handleInputFocus,
      handleInputChange,
      handleInputBlur,
      closeDropdown,
      selectRestaurant,
      getMemberStatusClass,
      getMemberStatusText,
      handleSave
    };
  }
};
</script>

<style scoped>
/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 48rem;
  width: 100%;
  max-height: 85vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.close-btn:hover {
  color: #374151;
  background: #f3f4f6;
}

.modal-body {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

/* 스크롤바 스타일 */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 모달 내부 컨텐츠 스타일 */
.members-status-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.members-list {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  padding: 1rem;
  max-height: 15rem;
  overflow-y: auto;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #e9ecef;
  transition: all 0.2s;
}

.member-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.member-item:last-child {
  margin-bottom: 0;
}

.member-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 600;
  color: #1f2937;
}

.member-status {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #d1d5db, transparent);
  margin: 2rem 0;
}

.status-setting-section {
  margin-bottom: 1.5rem;
}

.status-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.status-option:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.status-option.selected {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.status-option input[type="radio"] {
  width: 1.25rem;
  height: 1.25rem;
}

.status-icon {
  font-size: 1.5rem;
}

.status-label {
  font-weight: 600;
  color: #1f2937;
}

/* 음식점 방문 및 상세 입력 스타일 */
.restaurant-visit-section,
.detail-input-section {
  margin-top: 1.5rem;
}

.restaurant-input-wrapper,
.detail-input-wrapper {
  margin-bottom: 1.5rem;
}

.input-label {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.restaurant-dropdown {
  position: relative;
}

.restaurant-input,
.detail-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 1rem;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  transition: all 0.2s;
}

.restaurant-input:focus,
.detail-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dropdown-list {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  z-index: 50;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  margin-top: 0.5rem;
  max-height: 20rem;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(16px);
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
}

.dropdown-title {
  font-size: 0.9rem;
  color: #6b7280;
}

.dropdown-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
  line-height: 1;
}

.dropdown-close:hover {
  color: #374151;
  background: #f3f4f6;
}

.dropdown-items {
  max-height: 16rem;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #f3f4f6;
}

.dropdown-item:hover {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  transform: translateX(0.25rem);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.restaurant-icon {
  font-size: 1.25rem;
  opacity: 0.7;
}

.restaurant-name {
  font-weight: 500;
  color: #374151;
}

.dropdown-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem 1.25rem;
  color: #9ca3af;
  text-align: center;
}

.empty-icon {
  font-size: 2rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 0.9rem;
  font-weight: 500;
}

.input-hint {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

/* 모달 푸터 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  flex-shrink: 0;
}

.btn-cancel,
.btn-save {
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 0.75rem;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-cancel {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  color: #374151;
}

.btn-cancel:hover {
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-save {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.btn-save:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}
</style>
