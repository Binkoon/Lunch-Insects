<template>
  <div class="modern-calendar" ref="calendarRef">
    <!-- 캘린더 헤더 -->
    <CalendarHeader
      :current-month-text="currentMonthText"
      :actual-members="actualMembers"
      @prev-month="prevMonth"
      @next-month="nextMonth"
    />

    <!-- 캘린더 그리드 -->
    <CalendarGrid
      :calendar-days="calendarDays"
      :selected-day="selectedDay"
      :weekdays="weekdays"
      :member-statuses="memberStatuses"
      :proposals="proposals"
      :actual-members="actualMembers"
      @day-click="handleDayClick"
      @restaurant-click="openRestaurantDetailModal"
    />

    <!-- 선택된 날짜 상세 정보 (패널 비활성화, 모달로 대체) -->
    <div v-if="false && selectedDay" class="day-details-panel">
      <div class="panel-header">
        <div class="selected-date">
          <h3>{{ formatSelectedDate(selectedDay.date) }}</h3>
          <p>{{ getDayOfWeek(selectedDay.date) }}</p>
        </div>
        <button @click="closeDetails" class="close-panel">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="panel-content">
        <!-- 주말인 경우 -->
        <div v-if="selectedDay.isWeekend && !selectedDay.isHoliday" class="weekend-message">
          <div class="weekend-icon">🏖️</div>
          <h4>주말입니다</h4>
          <p>주말에는 점심 약속을 잡을 수 없습니다.</p>
        </div>
        
        <!-- 공휴일인 경우 -->
        <div v-else-if="selectedDay.isHoliday" class="holiday-message">
          <div class="holiday-icon">🎉</div>
          <h4>공휴일입니다</h4>
          <p>공휴일에는 점심 약속을 잡을 수 없습니다.</p>
        </div>
        
        <!-- 평일인 경우 -->
        <div v-else>
          <!-- 팀원 상태 -->
          <div class="members-status-section">
            <h4>팀원 상태</h4>
            <div class="members-list">
              <div 
                v-for="member in actualMembers" 
                :key="member.id"
                class="member-item"
                :class="getMemberStatusClass(selectedDay, member.id)"
              >
                <div class="member-info">
                  <div 
                    class="member-avatar" 
                    :style="{ backgroundColor: member.color }"
                  >
                    {{ member.name.charAt(0) }}
                  </div>
                  <div class="member-details">
                    <span class="member-name">{{ member.name }}</span>
                    <span class="member-status">{{ getMemberStatusText(selectedDay, member.id) }}</span>
                    <!-- 선택된 음식점 표시 -->
                    <span v-if="getMemberRestaurant(selectedDay, member.id)" class="member-restaurant">
                      🍽️ {{ getMemberRestaurant(selectedDay, member.id) }}
                    </span>
                  </div>
                </div>
                <div class="member-actions">
                  <button 
                    @click="editMemberStatus(member.id, selectedDay.date)"
                    class="edit-status-btn"
                    title="상태 수정"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button 
                    v-if="getMemberStatus(selectedDay, member.id) !== ''"
                    @click="cancelMemberStatus(member.id, selectedDay.date)"
                    class="cancel-status-btn"
                    title="상태 취소"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 가능한 멤버들만 음식점 선택 -->
          <div v-if="getAvailableMembersForDay(selectedDay).length > 0" class="restaurant-selection">
            <h4>음식점 선택</h4>
            <div class="restaurant-grid">
              <button 
                v-for="restaurant in restaurants" 
                :key="restaurant"
                @click="selectRestaurant(restaurant, selectedDay.date)"
                class="restaurant-btn"
                :class="{ selected: selectedRestaurant === restaurant }"
              >
                {{ restaurant }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- 메모 섹션 -->
        <div class="memo-section">
          <h4>메모</h4>
          <textarea 
            v-model="selectedDay.memo"
            placeholder="이 날에 대한 메모를 작성하세요..."
            @blur="saveMemo"
            class="memo-textarea"
          ></textarea>
        </div>
      </div>
    </div>

    
    <!-- 제안 시스템 모달 -->
    <ProposalSystem
      :show="showProposalModal"
      :selected-proposal="selectedProposal"
      :proposals="proposals"
      :actual-members="actualMembers"
      :current-user="currentUser"
      @close="closeProposalModal"
      @vote="handleProposalVote"
      @proposal-confirmed="handleProposalConfirmed"
    />
    
    <!-- 드래그앤드롭 핸들러 -->
    <DragDropHandler
      :proposals="proposals"
      :actual-members="actualMembers"
      :current-user="currentUser"
      @proposal-moved="handleProposalMoved"
      @drag-start="handleDragStart"
      @drag-end="handleDragEnd"
    />

    <!-- 음식점 상세 모달 -->
    <RestaurantDetailModal
      :show="showRestaurantDetailModal"
      :restaurant="selectedRestaurantDetail"
      :date="selectedRestaurantDate"
      :restaurant-members="getRestaurantMembers(selectedRestaurantDetail?.name, selectedRestaurantDate)"
      :stats="restaurantStats"
      :current-user="currentUser"
      @close="closeRestaurantDetailModal"
      @edit-member="editMemberFromModal"
      @cancel-member="cancelMemberFromModal"
      @select-restaurant="selectThisRestaurant"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { gsap } from 'gsap';
import CalendarHeader from './CalendarHeader.vue';
import CalendarGrid from './CalendarGrid.vue';
import RestaurantDetailModal from './RestaurantDetailModal.vue';
import ProposalSystem from './ProposalSystem.vue';
import DragDropHandler from './DragDropHandler.vue';
import { useCalendar } from '@/composables/useCalendar.js';

export default {
  components: { 
    CalendarHeader,
    CalendarGrid,
    RestaurantDetailModal,
    ProposalSystem,
    DragDropHandler
  },
  props: {
    groupId: {
      type: String,
      required: true
    },
    members: {
      type: Array,
      default: () => []
    }
  },
  emits: ['date-selected', 'group-loaded', 'open-status-modal', 'status-updated'],
  setup(props, { emit }) {
    // useCalendar composable 사용
    const {
      // 상태
      currentDate,
      selectedDay,
      memberStatuses,
      actualMembers,
      restaurants,
      proposals,
      loading,
      currentUser,
      showProposalModal,
      
      // 계산된 속성
      currentMonthText,
      weekdays,
      calendarDays,
      
      // 함수들
      isHoliday,
      isWeekendOrHoliday,
      formatSelectedDate,
      getDayOfWeek,
      prevMonth,
      nextMonth,
      selectDay,
      closeDetails,
      getMemberStatusClass,
      getMemberStatusText,
      getMemberRestaurant,
      getMemberStatus,
      getProposalsForDay,
      getProposalStatus,
      getSelectedRestaurantsForDay,
      getConfirmedMealForDay,
      getProposalIcon,
      getEventIcon,
      getDayEvents,
      getDayMemo,
      createDayObject,
      isTodayDate,
      loadGroupData,
      loadMemberStatuses,
      loadRestaurants,
      loadProposals,
      saveMemberStatusToFirebase,
      deleteMemberStatusFromFirebase,
      openRestaurantDetailModal,
      closeRestaurantDetailModal,
      handleDayClick,
      handleRestaurantClick,
      handleProposalClick,
      handleProposalAccept,
      handleProposalReject,
      handleProposalCreate,
      handleProposalDelete,
      handleDragStart,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleDragEnd
    } = useCalendar(props, emit);
    
    
    // 편집 관련 ref (모달은 부모에서 처리)
    const editingMember = ref(null);
    const editingDate = ref('');
    const editingStatus = ref('');


    
    // 휴가 정보
    const vacationDetails = ref({
      reason: ''
    });
    
    // 다른 약속 정보
    const otherDetails = ref({
      description: ''
    });
    
    // 음식점 관련 로컬 상태
    const dropdownOpen = ref(false);
    const filteredRestaurants = computed(() => {
      const q = (mealDetails.value.restaurant || '').toLowerCase();
      if (!q) return restaurants.value;
      return restaurants.value.filter(r => String(r).toLowerCase().includes(q));
    });
    const selectRestaurantOption = (r) => {
      mealDetails.value.restaurant = r;
      dropdownOpen.value = false;
    };

    const handleDropdownBlur = () => {
      // 드롭다운 옵션 클릭 시간을 위한 지연
      setTimeout(() => {
        dropdownOpen.value = false;
      }, 150);
    };
    
    // 선택된 음식점
    const selectedRestaurant = ref('');
    
    // 공휴일 및 주말 확인은 useCalendar에서 처리
    
    // 가능한 멤버들 가져오기
    const getAvailableMembers = (date) => {
      // Firebase에서 로드한 멤버 상태 기반으로 가능 멤버 추출
      const statuses = memberStatuses.value[date] || {};
      return Object.entries(statuses)
        .filter(([, s]) => s.status === 'available')
        .map(([memberId]) => memberId);
    };
    
    // 중복된 calendarDays 함수 제거됨
    
    
    // 이벤트 관련 함수들은 useCalendar에서 처리
    
    

    

    // 날짜 선택은 useCalendar에서 처리하되, 모달 로직은 여기서 처리
    const handleSelectDay = async (day) => {
        selectDay(day);
      
      // 현재 사용자 정보 준비
      const currentMember = actualMembers.value.find(m => m.id === (currentUser.value?.uid || currentUser.value?.id))
        || { id: currentUser.value?.uid || currentUser.value?.id, name: currentUser.value?.name || '나' };
      
      // 현재 상태 확인
      const currentStatus = memberStatuses.value[day.date]?.[currentMember.id]?.status || 'available';
      const currentDetails = memberStatuses.value[day.date]?.[currentMember.id]?.details || {};
      
      console.log('🔍 날짜 선택:', {
        date: day.date,
        currentMember,
        currentStatus,
        currentDetails,
        memberStatuses: memberStatuses.value[day.date]
      });
      
      // 모달 데이터 준비
      const modalData = {
        member: currentMember,
        date: day.date,
        currentStatus,
        details: currentDetails,
        allMembers: actualMembers.value,
        memberStatuses: memberStatuses.value,
        restaurants: restaurants.value,
        groupId: props.groupId
      };
      
      // 부모 컴포넌트에 모달 오픈 이벤트 전달
      emit('open-status-modal', modalData);
    };
    
    // 멤버 상태 편집
    const editMemberStatus = (memberId, date) => {
      // actualMembers에서 안전하게 이름 매핑
      editingMember.value = actualMembers.value.find(m => m.id === memberId) || { id: memberId, name: `사용자 ${String(memberId).slice(-4)}` };
      editingDate.value = date;
      editingStatus.value = getMemberStatusFromData({ date }, memberId);
      
      // 기존 상태의 상세 정보 로드
      const existingStatus = memberStatuses.value[date]?.[memberId];
      if (existingStatus) {
        if (existingStatus.status === 'meal') {
          mealDetails.value = {
            restaurant: existingStatus.details.restaurant || '',
            menu: existingStatus.details.menu || '',
            participants: existingStatus.details.participants || []
          };
        } else if (existingStatus.status === 'vacation') {
          vacationDetails.value = {
            reason: existingStatus.details.reason || ''
          };
        } else if (existingStatus.status === 'other') {
          otherDetails.value = {
            description: existingStatus.details.description || ''
          };
        }
      } else {
        // 기본값으로 초기화
        mealDetails.value = { restaurant: '', menu: '', participants: [] };
        vacationDetails.value = { reason: '' };
        otherDetails.value = { description: '' };
      }
      
      // 모달 데이터 준비
      const modalData = {
        member: editingMember.value,
        date: date,
        currentStatus: editingStatus.value,
        allMembers: actualMembers.value,
        memberStatuses: memberStatuses.value,
        restaurants: restaurants.value,
        groupId: props.groupId
      };
      
      // 모달은 부모 컴포넌트에서 처리하므로 이벤트만 emit
      emit('open-status-modal', modalData);
    };
    
    // 편집 상태 초기화
    const resetEditingState = () => {
      editingMember.value = null;
      editingDate.value = '';
      editingStatus.value = '';
    };
    
    // 상태 저장
    const saveStatus = async () => {
      if (!editingMember.value || !editingDate.value) return;
      
      try {
        let details = {};
        
        // 상태별 상세 정보 수집
        if (editingStatus.value === 'available') {
            // 다중 기록을 위한 고유 ID 생성 (날짜 + 멤버ID + 타임스탬프)
            const groupId = `${editingDate.value}_${editingMember.value.id}_${Date.now()}`;
            
          details = {
            restaurant: mealDetails.value.restaurant,
            menu: mealDetails.value.menu,
              participants: mealDetails.value.participants,
              mealCard: mealDetails.value.mealCard,
              cash: mealDetails.value.cash,
              mealType: mealDetails.value.mealType || 'lunch',
              groupId: groupId,
              externalMembers: mealDetails.value.externalMembers || 0
          };
          
          // 음식점 제안이 있으면 제안 생성
          if (mealDetails.value.restaurant) {
            createProposal(editingDate.value, mealDetails.value.restaurant);
          }
        } else if (editingStatus.value === 'vacation') {
          details = {
            reason: vacationDetails.value.reason
          };
        } else if (editingStatus.value === 'other') {
          details = {
            description: otherDetails.value.description
          };
        }
        
        console.log('상태 저장 시도:', {
          groupId: props.groupId,
          userId: editingMember.value.id,
          date: editingDate.value,
          status: editingStatus.value,
          details
        });

        const success = await saveMemberStatusToFirebase(
          editingMember.value.id,
          editingDate.value,
          editingStatus.value,
          details
        );
        
        if (success) {
          console.log('✅ 상태 저장 성공');
          
          // available 상태이고 음식점이 선택된 경우 방문 기록 저장
          if (editingStatus.value === 'available' && mealDetails.value.restaurant) {
            try {
              const visitResult = await saveVisitRecord(
                editingMember.value.id,
                props.groupId,
                mealDetails.value.restaurant,
                editingDate.value,
                mealDetails.value.participants || []
              );
              
              if (visitResult.success) {
                console.log('✅ 방문 기록 저장 성공:', mealDetails.value.restaurant);
              } else {
                console.warn('⚠️ 방문 기록 저장 실패:', visitResult.error);
              }
            } catch (visitError) {
              console.error('방문 기록 저장 중 오류:', visitError);
              // 방문 기록 저장 실패는 상태 저장을 취소하지 않음 (선택사항)
            }
          }
          
          // 로컬 상태 새로고침
          await loadMemberStatuses();
          
          // 부모 컴포넌트에 업데이트 알림 (ExpenseChart 갱신용)
          emit('status-updated', {
            type: 'restaurant-selected',
            restaurant: mealDetails.value.restaurant,
            date: editingDate.value,
            userId: editingMember.value.id
          });
          
          closeStatusModal();
        } else {
          console.error('❌ 상태 저장 실패');
          // alert 대신 콘솔 로그만 출력
          console.warn('상태 저장에 실패했습니다.');
        }
      } catch (error) {
        console.error('상태 저장 실패:', error);
        // alert 대신 콘솔 로그만 출력
        console.warn('상태 저장 중 오류가 발생했습니다.');
      }
    };
    
    // 멤버 상태 취소 (하이브리드 시스템)
    const cancelMemberStatus = async (memberId, date) => {
      try {
        console.log('상태 취소 시도:', { memberId, date });
        
        // 1. 멤버 상태에서 음식점 정보 가져오기
        const memberStatus = memberStatuses.value[date]?.[memberId];
        const restaurantName = memberStatus?.details?.restaurant;
        
        // 2. 방문 기록 취소 (pending 상태인 경우만)
        if (restaurantName) {
          const visitCancelResult = await cancelVisitRecord(
            memberId,
            props.groupId,
            restaurantName,
            date
          );
          
          if (visitCancelResult.success) {
            console.log('🟡 방문 기록 취소 성공 (pending → cancelled)');
          } else {
            console.warn('⚠️ 방문 기록 취소 실패 또는 이미 확정됨:', visitCancelResult.error);
          }
        }
        
        // 3. 멤버 상태 삭제
        const success = await deleteMemberStatus(memberId, date);
        
        if (success) {
          console.log('✅ 상태 취소 성공');
          // 로컬 상태 새로고침
          await loadMemberStatuses();
          
          // 부모 컴포넌트에 취소 알림 (ExpenseChart 갱신용)
          emit('status-updated', {
            type: 'restaurant-cancelled',
            restaurant: restaurantName,
            date: date,
            userId: memberId
          });
          
          // 선택된 음식점 초기화
          selectedRestaurant.value = null;
        } else {
          console.error('❌ 상태 취소 실패');
          // alert 대신 콘솔 로그만 출력
          console.warn('상태 취소에 실패했습니다.');
        }
      } catch (error) {
        console.error('상태 취소 실패:', error);
        // alert 대신 콘솔 로그만 출력
        console.warn('상태 취소 중 오류가 발생했습니다.');
      }
    };


    // 모든 음식점 모달 열기 (3개 이상일 때)
    const openAllRestaurantsModal = (date) => {
      // CalendarGrid에서 전달받은 이벤트로 처리
      // 실제 구현은 CalendarGrid에서 처리됨
      console.log('모든 음식점 모달 열기:', date);
    };



    // 이 함수는 RestaurantDetailModal 컴포넌트로 이동됨




    
    // 포맷팅 함수들은 useCalendar에서 처리
    


    // 제안 관련 함수들은 useCalendar에서 처리
    

    // 확정된 메뉴 및 제안 아이콘은 useCalendar에서 처리
    
    
    
    

    // 컴포넌트 마운트 시 초기화
    // groupId 변경 감지
    // 생명주기 훅은 useCalendar에서 처리됨
    
    // 가능한 멤버들만 필터링
    const getAvailableMembersForDay = (day) => {
      return actualMembers.value.filter(member => 
        day.availableMembers.includes(member.id)
      );
    };
    
    // 음식점 선택 모달 열기
    const openRestaurantModal = async (day) => {
      selectedDay.value = day;
      selectedRestaurant.value = '';
      try {
        // Firebase에서 음식점 최신 목록 로드 (최대 200개)
        restaurants.value = (await getAllRestaurants(200)).map(r => r.name);
      } catch (e) {
        console.error('음식점 목록 로드 실패:', e);
      }
    };

    // 현재 사용자 정보 가져오기
    const loadCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        currentUser.value = user;
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
      }
    };

    // 중복된 loadMemberStatuses 함수 제거됨

    return {
      // useCalendar에서 가져온 것들
      currentDate,
      selectedDay,
      memberStatuses,
      actualMembers,
      restaurants,
      proposals,
      loading,
      currentUser,
      showProposalModal,
      currentMonthText,
      weekdays,
      calendarDays,
      isHoliday,
      isWeekendOrHoliday,
      formatSelectedDate,
      getDayOfWeek,
      prevMonth,
      nextMonth,
      selectDay,
      closeDetails,
      getMemberStatusClass,
      getMemberStatusText,
      getMemberRestaurant,
      getMemberStatus,
      getProposalsForDay,
      getProposalStatus,
      getSelectedRestaurantsForDay,
      getConfirmedMealForDay,
      getProposalIcon,
      getEventIcon,
      getDayEvents,
      getDayMemo,
      createDayObject,
      isTodayDate,
      loadGroupData,
      loadMemberStatuses,
      loadRestaurants,
      loadProposals,
      saveMemberStatusToFirebase,
      deleteMemberStatusFromFirebase,
      openRestaurantDetailModal,
      closeRestaurantDetailModal,
      handleDayClick,
      handleRestaurantClick,
      handleProposalClick,
      handleProposalAccept,
      handleProposalReject,
      handleProposalCreate,
      handleProposalDelete,
      handleDragStart,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleDragEnd
    };
  }
};
</script>

<style scoped>
.modern-calendar {
  background: #ffffff;
  border-radius: 1.5rem;
  padding: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}


/* 캘린더 컨테이너 */
.calendar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.weekdays-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.weekday {
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  color: #475569;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.days-container {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  flex: 1;
  overflow-y: auto;
}

.day-card {
  min-height: 7rem;
  padding: 0.75rem;
  border-right: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.day-card:hover {
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.day-card.other-month {
  background: #f8fafc;
  color: #94a3b8;
}

.day-card.today {
  background: #eff6ff;
  border: 2px solid #3b82f6;
}

.day-card.today .day-number {
  color: #3b82f6;
  font-weight: 700;
}

.day-card.has-events {
  background: #fef3c7;
}

.day-card.selected {
  background: #dbeafe;
  border-color: #3b82f6;
}

.day-card.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.day-card.disabled:hover {
  transform: none;
  box-shadow: none;
}

.day-card.weekend {
  background: #fef2f2;
  color: #dc2626;
}

.day-card.weekend .day-number {
  color: #dc2626;
  font-weight: 500;
}

.day-card.holiday {
  background: #fef3c7;
  color: #d97706;
}

.day-card.holiday .day-number {
  color: #d97706;
  font-weight: 600;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.day-number {
  font-weight: 600;
  color: #1e293b;
  font-size: 1rem;
}

.today-indicator {
  width: 0.5rem;
  height: 0.5rem;
  background: #3b82f6;
  border-radius: 50%;
}

.proposal-badge {
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.4rem;
  border-radius: 0.8rem;
  min-width: 1.2rem;
  height: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
  animation: pulse-badge 2s infinite;
}

@keyframes pulse-badge {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 확정된 메뉴 스타일 */
.confirmed-meal {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #10b981;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
}

.confirmed-meal .meal-icon {
  font-size: 1rem;
}

.confirmed-meal .meal-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #059669;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

/* 제안 중인 메뉴들 스타일 */
.proposal-meals {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.proposal-meal {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  font-size: 0.7rem;
}

.proposal-meal.pending {
  border-left: 3px solid #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.proposal-meal.confirmed {
  border-left: 3px solid #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.proposal-meal.rejected {
  border-left: 3px solid #ef4444;
  background: rgba(239, 68, 68, 0.1);
  opacity: 0.7;
}

.proposal-meal .meal-icon {
  font-size: 0.8rem;
  flex-shrink: 0;
}

.proposal-meal .meal-name {
  font-weight: 500;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.more-proposals {
  font-size: 0.65rem;
  color: #9ca3af;
  text-align: center;
  padding: 0.25rem;
  background: #f3f4f6;
  border-radius: 0.25rem;
  font-style: italic;
}

/* 제안 관련 스타일 */
.day-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
}

.proposals {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.proposal-item {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e2e8f0;
  font-size: 0.75rem;
}

.proposal-item:hover {
  background: rgba(255, 107, 107, 0.1);
  border-color: #ff6b6b;
  transform: translateY(-1px);
}

.proposal-item.pending {
  border-left: 3px solid #f59e0b;
}

.proposal-item.confirmed {
  border-left: 3px solid #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.proposal-item.rejected {
  border-left: 3px solid #ef4444;
  background: rgba(239, 68, 68, 0.1);
  opacity: 0.7;
}

.proposal-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.proposer-name {
  font-weight: 600;
  color: #2d3748;
}

.restaurant-name {
  color: #4a5568;
  font-size: 0.7rem;
}

.proposal-status {
  color: #6c757d;
  font-size: 0.65rem;
  font-style: italic;
}

/* 제안 모달 스타일 */
.proposal-modal {
  max-width: 500px;
}

.proposal-detail {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.proposal-info-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.restaurant-card {
  background: #f8f9fa;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
}

.restaurant-card h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.restaurant-details {
  color: #6c757d;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.price-range {
  font-size: 1rem;
  font-weight: 600;
  color: #ff6b6b;
  margin: 0;
}

.proposer-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.proposer-label {
  color: #6c757d;
  font-size: 0.9rem;
}

.proposer-name {
  font-weight: 600;
  color: #2d3748;
}

.voting-section h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 1rem 0;
}

.vote-status {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vote-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.vote-item.accepted {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.vote-item.rejected {
  background: #fef2f2;
  border-color: #fecaca;
}

.vote-label {
  font-weight: 600;
  font-size: 0.9rem;
}

.vote-item.accepted .vote-label {
  color: #059669;
}

.vote-item.rejected .vote-label {
  color: #dc2626;
}

.vote-count {
  font-size: 0.8rem;
  color: #6c757d;
}

.vote-members {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.member-badge {
  background: rgba(255, 255, 255, 0.8);
  color: #4a5568;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  border: 1px solid #e2e8f0;
}

.voting-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.vote-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 1rem;
}

.vote-btn.accept {
  background: #10b981;
  color: white;
}

.vote-btn.accept:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.vote-btn.reject {
  background: #ef4444;
  color: white;
}

.vote-btn.reject:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
}

.vote-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.confirmation-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 2px solid #10b981;
  border-radius: 1rem;
  text-align: left;
}

.confirmation-icon {
  font-size: 2rem;
}

.confirmation-text h4 {
  color: #059669;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.confirmation-text p {
  color: #065f46;
  margin: 0;
  font-size: 0.9rem;
}

.rejection-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 2px solid #ef4444;
  border-radius: 1rem;
  text-align: left;
}

.rejection-icon {
  font-size: 2rem;
}

.rejection-text h4 {
  color: #dc2626;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.rejection-text p {
  color: #991b1b;
  margin: 0;
  font-size: 0.9rem;
}

.weekend-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  margin-top: auto;
}

.weekend-text {
  font-size: 0.7rem;
  color: #dc2626;
  font-weight: 600;
  background: rgba(220, 38, 38, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid rgba(220, 38, 38, 0.2);
}

.holiday-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  margin-top: auto;
}

.holiday-text {
  font-size: 0.7rem;
  color: #d97706;
  font-weight: 600;
  background: rgba(217, 119, 6, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid rgba(217, 119, 6, 0.2);
}

.events-preview {
  font-size: 0.75rem;
  margin-top: auto;
}

.event-preview {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  background: #ffffff;
  margin-bottom: 0.25rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.event-preview.meal {
  background: #fef3c7;
  color: #92400e;
}

.event-preview.vacation {
  background: #dbeafe;
  color: #1e40af;
}

.event-preview.other {
  background: #f3e8ff;
  color: #6b21a8;
}

.event-icon {
  font-size: 0.75rem;
}

.event-title {
  font-size: 0.7rem;
  color: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.more-events {
  font-size: 0.7rem;
  color: #94a3b8;
  text-align: center;
  padding: 0.25rem;
  background: #f1f5f9;
  border-radius: 0.375rem;
}

/* 상세 패널 */
.day-details-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 20rem;
  height: 100%;
  background: #ffffff;
  border-left: 1px solid #e2e8f0;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-date h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.selected-date p {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.close-panel {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.close-panel:hover {
  background: #e2e8f0;
  color: #64748b;
}

.panel-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.members-status-section {
  margin-bottom: 2rem;
}

.members-status-section h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

.no-available-members {
  text-align: center;
  color: #94a3b8;
  font-style: italic;
  padding: 2rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.weekend-message {
  text-align: center;
  padding: 3rem 2rem;
  background: #fef2f2;
  border-radius: 0.75rem;
  border: 1px solid #fecaca;
  margin-bottom: 2rem;
}

.weekend-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.weekend-message h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #dc2626;
  margin: 0 0 0.5rem 0;
}

.weekend-message p {
  font-size: 0.875rem;
  color: #991b1b;
  margin: 0;
}

.holiday-message {
  text-align: center;
  padding: 3rem 2rem;
  background: #fef3c7;
  border-radius: 0.75rem;
  border: 1px solid #fde68a;
  margin-bottom: 2rem;
}

.holiday-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.holiday-message h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #d97706;
  margin: 0 0 0.5rem 0;
}

.holiday-message p {
  font-size: 0.875rem;
  color: #92400e;
  margin: 0;
}

.restaurant-selection {
  margin-bottom: 2rem;
}

.restaurant-selection h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

.restaurant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.restaurant-btn {
  background: #ffffff;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.restaurant-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.restaurant-btn.selected {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.member-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.member-item.status-available {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.member-item.status-meal {
  background: #fef3c7;
  border-color: #fde68a;
}

.member-item.status-vacation {
  background: #dbeafe;
  border-color: #93c5fd;
}

.member-item.status-other {
  background: #f3e8ff;
  border-color: #c4b5fd;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.member-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.member-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.member-details .member-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}

.member-details .member-status {
  font-size: 0.75rem;
  color: #64748b;
}

.member-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.edit-status-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
}

.edit-status-btn:hover {
  background: #2563eb;
  transform: scale(1.1);
}

.cancel-status-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
}

.cancel-status-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

/* 선택된 음식점 표시 스타일 */
.selected-restaurants {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.selected-restaurant {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.7rem;
  font-weight: 500;
  background: rgba(34, 197, 94, 0.1);
  color: #059669;
  border: 1px solid rgba(34, 197, 94, 0.2);
  position: relative;
}

.selected-restaurant.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.selected-restaurant.clickable:hover {
  background: rgba(34, 197, 94, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
}

.restaurant-actions-hint {
  opacity: 0;
  font-size: 0.6rem;
  transition: opacity 0.2s ease;
  margin-left: auto;
}

.selected-restaurant.clickable:hover .restaurant-actions-hint {
  opacity: 1;
}

.more-restaurants.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.more-restaurants.clickable:hover {
  color: #374151;
  transform: scale(1.1);
}

.restaurant-icon {
  font-size: 0.6rem;
}

.restaurant-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.restaurant-count {
  font-size: 0.6rem;
  background: rgba(34, 197, 94, 0.2);
  color: #065f46;
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
  font-weight: 600;
}

.more-restaurants {
  font-size: 0.6rem;
  color: #6b7280;
  text-align: center;
  padding: 0.1rem;
}

.member-restaurant {
  font-size: 0.7rem;
  color: #059669;
  background: rgba(34, 197, 94, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 0.3rem;
  margin-top: 0.2rem;
  display: inline-block;
}

/* 음식점 상세 모달 스타일 */
.restaurant-detail-modal {
  max-width: 600px;
  width: 100%;
}

.restaurant-detail-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section {
  background: #f8f9fa;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
}

.detail-section h4 {
  margin: 0 0 1rem 0;
  color: #2d3748;
  font-size: 1.1rem;
  font-weight: 600;
}

.selected-members {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.member-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.member-card .member-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1rem;
}

.member-card .member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.member-card .member-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 1rem;
}

.selection-time {
  font-size: 0.875rem;
  color: #6b7280;
}

/* 함께 밥을 먹은 동료들 정보 */
.participants-info {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border-left: 3px solid #3b82f6;
}

.participants-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin-right: 0.5rem;
}

.participants-list {
  font-size: 0.8rem;
  color: #6b7280;
}

/* 지출액 정보 */
.expense-info {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f0fdf4;
  border-radius: 0.5rem;
  border-left: 3px solid #10b981;
}

.expense-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin-right: 0.5rem;
}

.expense-amount {
  font-size: 0.9rem;
  font-weight: 700;
  color: #059669;
}

.expense-breakdown {
  margin-top: 0.25rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meal-card, .cash {
  font-size: 0.75rem;
  color: #6b7280;
  background: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;
}

.member-card .member-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn, .cancel-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
}

.edit-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  transform: scale(1.1);
}

.cancel-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  transform: scale(1.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #059669;
}

.memo-section h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

.memo-textarea {
  width: 100%;
  min-height: 6rem;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  resize: vertical;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.memo-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}


/* 검색형 드롭다운 */
.dropdown { 
  position: relative; 
}

.dropdown-input { 
  width: 100%; 
  padding: 0.875rem 1rem; 
  border: 2px solid #e2e8f0; 
  border-radius: 0.75rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dropdown-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.dropdown-list { 
  position: absolute; 
  left: 0; 
  right: 0; 
  z-index: 30; 
  background: white; 
  border: 2px solid #e2e8f0; 
  border-radius: 0.75rem; 
  margin-top: 0.5rem; 
  max-height: 240px; 
  overflow: auto; 
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(8px);
}

.dropdown-item { 
  padding: 0.875rem 1rem; 
  cursor: pointer; 
  transition: all 0.2s ease;
  font-weight: 500;
  border-bottom: 1px solid #f1f5f9;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover { 
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #1e40af;
}

.dropdown-empty { 
  padding: 0.875rem 1rem; 
  color: #9ca3af; 
  font-style: italic;
  text-align: center;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
  border-radius: 1.25rem 1.25rem 0 0;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #64748b;
}

.modal-body {
  padding: 0 2rem 2rem 2rem;
  max-height: calc(90vh - 140px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 멤버 상태 개요 */
.member-status-overview {
  margin-bottom: 2rem;
}

.member-status-overview h4 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.member-status-overview h4:before {
  content: "👥";
  font-size: 1.25rem;
}

.status-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 240px;
  overflow-y: auto;
  padding: 1.25rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.member-status-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.75rem;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.member-status-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.member-status-item.status-available {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.member-status-item.status-vacation,
.member-status-item.status-other,
.member-status-item.status-solo,
.member-status-item.status-skip {
  border-color: #ef4444;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.member-avatar-small {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border: 3px solid white;
}

.member-status-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.member-status-info .member-name {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

.member-status-info .status-text {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.divider {
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
  margin: 2rem 0;
  border-radius: 1px;
}

.status-options h4 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-options h4:before {
  content: "⚙️";
  font-size: 1.25rem;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.status-option:hover {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.status-option:has(input:checked) {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.status-option input[type="radio"] {
  margin: 0;
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #3b82f6;
}

.status-icon {
  font-size: 1.75rem;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.status-label {
  font-weight: 600;
  color: #0f172a;
  font-size: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.75rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.form-group small {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.5rem;
  display: block;
}

.participants {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.participant-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.participant-checkbox input[type="checkbox"] {
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem 2rem 2rem;
  border-top: 1px solid #f1f5f9;
  background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
  border-radius: 0 0 1.25rem 1.25rem;
}

.btn-secondary {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  color: #475569;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.875rem 1.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: 2px solid transparent;
  border-radius: 0.75rem;
  padding: 0.875rem 1.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.35);
}

/* 반응형 */
@media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .legend-items {
    justify-content: center;
  }
  
  .day-card {
    min-height: 5rem;
    padding: 0.5rem;
  }
  
  .available-members {
    flex-wrap: wrap;
  }
  
  .restaurant-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.25rem;
  }
  
  .restaurant-btn {
    font-size: 0.75rem;
    padding: 0.375rem 0.5rem;
  }
  
  .status-options {
    grid-template-columns: 1fr;
  }
  
  .participants {
    grid-template-columns: 1fr;
  }
  
  .day-details-panel {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    border-left: none;
  }
}

/* 드래그 앤 드롭 스타일 */
.proposal-item {
  position: relative;
  cursor: grab;
  transition: all 0.2s ease;
}

.proposal-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.proposal-item.dragging {
  opacity: 0.5;
  transform: rotate(5deg);
  cursor: grabbing;
}

.drag-handle {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  color: #94a3b8;
  font-size: 0.75rem;
  cursor: grab;
  user-select: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.proposal-item:hover .drag-handle {
  opacity: 1;
}

.drag-handle:active {
  cursor: grabbing;
}

/* 드롭 영역 하이라이트 */
.day-card.drag-over {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 2px dashed #3b82f6;
  transform: scale(1.02);
}

.day-card.drag-over .day-number {
  color: #3b82f6;
  font-weight: 600;
}

/* 드래그 중일 때 다른 요소들 비활성화 */
.modern-calendar.dragging .day-card:not(.drag-over) {
  opacity: 0.6;
  pointer-events: none;
}

/* 드래그 중인 제안 아이템 스타일 */
.proposal-item.dragging {
  z-index: 1000;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border: 2px solid #3b82f6;
}

/* 애니메이션 관련 스타일 */
.days-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.day-card {
  transition: all 0.2s ease;
}

.day-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.day-card.selected {
  transform: scale(1.02);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.proposal-item {
  transition: all 0.2s ease;
}

.member-status {
  transition: all 0.2s ease;
}

.member-status:hover {
  transform: scale(1.1);
}

/* 페이드 인 애니메이션 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* 슬라이드 애니메이션 */
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}

/* 스케일 애니메이션 */
.scale-enter-active, .scale-leave-active {
  transition: transform 0.2s ease;
}

.scale-enter-from, .scale-leave-to {
  transform: scale(0.8);
}

/* 로딩 애니메이션 */
.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 펄스 애니메이션 */
.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
