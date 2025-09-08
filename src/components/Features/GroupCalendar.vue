<template>
  <div class="modern-calendar" ref="calendarRef">
    <!-- 캘린더 헤더 -->
    <div class="calendar-header">
      <div class="header-top">
        <div class="month-navigation">
          <button @click="prevMonth" class="nav-btn prev">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
          <h2 class="month-title">{{ currentMonthText }}</h2>
          <button @click="nextMonth" class="nav-btn next">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>
        
        <div class="view-options">
          <button class="view-btn active">월</button>
          <button class="view-btn">주</button>
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

    <!-- 캘린더 그리드 -->
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
            'has-events': day.events.length > 0,
            'selected': selectedDay?.date === day.date,
            'weekend': day.isWeekend,
            'holiday': day.isHoliday,
            'disabled': day.isWeekendOrHoliday
          }"
          @click="handleDayClick(day)"
        >
          <div class="day-header">
            <span class="day-number">{{ day.dayNumber }}</span>
            <div v-if="day.isToday" class="today-indicator"></div>
            <!-- 제안 알림 뱃지 -->
            <div v-if="getProposalsForDay(day.date).length > 0" class="proposal-badge">
              {{ getProposalsForDay(day.date).length }}
            </div>
          </div>
          
          <!-- 평일인 경우에만 제안/확정 메뉴 표시 -->
          <div v-if="!day.isWeekendOrHoliday" class="day-content">
            <!-- 확정된 메뉴 표시 -->
            <div v-if="getConfirmedMealForDay(day.date)" class="confirmed-meal">
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
            
            <!-- 기존 제안 리스트 (숨김 처리) -->
            <div v-if="false" class="proposals">
              <div 
                v-for="proposal in getProposalsForDay(day.date)" 
                :key="proposal.id"
                class="proposal-item"
                :class="[getProposalStatus(proposal), { 'dragging': draggingProposal?.id === proposal.id }]"
                :draggable="true"
                @click="openProposalModal(proposal)"
                @dragstart="startDrag($event, proposal)"
                @dragend="endDrag"
                @dragenter.prevent
                @dragover.prevent
                @drop="dropProposal($event, day.date)"
              >
                <div class="proposal-info">
                  <span class="proposer-name">{{ proposal.proposer.name }}</span>
                  <span class="restaurant-name">{{ proposal.restaurant.name }}</span>
                  <span class="proposal-status">{{ 
                    getProposalStatus(proposal) === 'pending' ? '제안 중' : 
                    getProposalStatus(proposal) === 'confirmed' ? '🎉 확정' : 
                    '❌ 거부' 
                  }}</span>
                </div>
                <div class="drag-handle">⋮⋮</div>
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
          <div v-if="day.events.length > 0" class="events-preview">
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
                  </div>
                </div>
                <button 
                  @click="editMemberStatus(member.id, selectedDay.date)"
                  class="edit-status-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
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

    
    <!-- 제안 상세 모달 -->
    <div v-if="showProposalModal" class="modal-overlay" @click="closeProposalModal">
      <div class="modal-content proposal-modal" @click.stop>
        <div class="modal-header">
          <h3>점심 제안</h3>
          <button class="close-btn" @click="closeProposalModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedProposal" class="proposal-detail">
            <!-- 제안 정보 -->
            <div class="proposal-info-section">
              <div class="restaurant-card">
                <h4>{{ selectedProposal.restaurant.name }}</h4>
                <p class="restaurant-details">
                  {{ selectedProposal.restaurant.category }} • 
                  ⭐ {{ selectedProposal.restaurant.rating }} • 
                  🚶‍♂️ {{ selectedProposal.restaurant.distance }}분
                </p>
                <p class="price-range">{{ selectedProposal.restaurant.priceRange }}</p>
              </div>
              <div class="proposer-info">
                <span class="proposer-label">제안자:</span>
                <span class="proposer-name">{{ selectedProposal.proposer.name }}</span>
              </div>
            </div>
            
            <!-- 투표 현황 -->
            <div class="voting-section">
              <h4>투표 현황</h4>
              <div class="vote-status">
                <div class="vote-item accepted">
                  <span class="vote-label">수락</span>
                  <span class="vote-count">{{ selectedProposal.votes.accepted.length }}명</span>
                  <div class="vote-members">
                    <span 
                      v-for="userId in selectedProposal.votes.accepted" 
                      :key="userId"
                      class="member-badge"
                    >
                      {{ actualMembers.find(m => m.id === userId)?.name || '알 수 없음' }}
                    </span>
                  </div>
                </div>
                <div class="vote-item rejected">
                  <span class="vote-label">거부</span>
                  <span class="vote-count">{{ selectedProposal.votes.rejected.length }}명</span>
                  <div class="vote-members">
                    <span 
                      v-for="userId in selectedProposal.votes.rejected" 
                      :key="userId"
                      class="member-badge"
                    >
                      {{ actualMembers.find(m => m.id === userId)?.name || '알 수 없음' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 투표 결과 또는 투표 버튼 -->
            <div v-if="getProposalStatus(selectedProposal) === 'confirmed'" class="confirmation-banner">
              <div class="confirmation-icon">🎉</div>
              <div class="confirmation-text">
                <h4>확정되었습니다!</h4>
                <p>{{ selectedProposal.restaurant.name }}에서 점심을 먹어요.</p>
              </div>
            </div>
            
            <div v-else-if="getProposalStatus(selectedProposal) === 'rejected'" class="rejection-banner">
              <div class="rejection-icon">❌</div>
              <div class="rejection-text">
                <h4>거부되었습니다</h4>
                <p>다른 음식점을 제안해 보세요.</p>
              </div>
            </div>
            
            <div v-else class="voting-actions">
              <button 
                class="vote-btn accept" 
                @click="voteProposal(selectedProposal.id, 'accept')"
                :disabled="selectedProposal.votes.accepted.includes(currentUser?.uid || currentUser?.id)"
              >
                👍 수락
              </button>
              <button 
                class="vote-btn reject" 
                @click="voteProposal(selectedProposal.id, 'reject')"
                :disabled="selectedProposal.votes.rejected.includes(currentUser?.uid || currentUser?.id)"
              >
                👎 거부
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { gsap } from 'gsap';
import { 
  saveMemberStatus, 
  getMemberStatus, 
  getGroupMemberStatuses, 
  deleteMemberStatus,
  getGroup,
  getUser,
  getAllRestaurants,
  addRestaurantVisit,
  getRestaurantVisitCounts
} from '@/services/firebaseDBv2.js';
import { getCurrentUser } from '@/services/firebaseAuth.js';

export default {
  components: { },
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
    
    // 현재 날짜
    const currentDate = ref(new Date());
    const selectedDay = ref(null);
    
    // 실제 멤버 정보를 저장할 ref
    const actualMembers = ref([]);
    const currentUser = ref(null);
    const memberStatuses = ref({});
    const loading = ref(false);
    const proposals = ref([]);
    const showProposalModal = ref(false);

    // 멤버 이름 로드 함수
    const loadMemberNames = async () => {
      try {
        if (!props.members || props.members.length === 0) {
          actualMembers.value = [];
          return;
        }

        const memberPromises = props.members.map(async (member) => {
          // 이미 객체 형태이고 이름이 있는 경우
          if (typeof member === 'object') {
            const memberId = member.id || member.uid || member.userId || member;
            try {
              const userData = await getUser(memberId);
              return {
                id: memberId,
                name: userData?.name || member.name || `사용자 ${String(memberId).slice(-4)}`,
                color: member.color || `#${Math.floor(Math.random()*16777215).toString(16)}`
              };
            } catch (error) {
              return {
                id: memberId,
                name: member.name || `사용자 ${String(memberId).slice(-4)}`,
                color: member.color || `#${Math.floor(Math.random()*16777215).toString(16)}`
              };
            }
          }

          // UID만 있는 경우 실제 사용자 정보 가져오기
          const memberId = typeof member === 'string' ? member : member.id;
          try {
            const userData = await getUser(memberId);
            return {
              id: memberId,
              name: userData?.name || `사용자 ${String(memberId).slice(-4)}`,
              color: member.color || `#${Math.floor(Math.random()*16777215).toString(16)}`
            };
          } catch (error) {
            console.error(`사용자 ${memberId} 정보 로드 실패:`, error);
            return {
              id: memberId,
              name: `사용자 ${String(memberId).slice(-4)}`,
              color: member.color || `#${Math.floor(Math.random()*16777215).toString(16)}`
            };
          }
        });

        actualMembers.value = await Promise.all(memberPromises);
        console.log('캘린더 멤버 이름 로드 완료:', actualMembers.value);
      } catch (error) {
        console.error('멤버 이름 로드 실패:', error);
        actualMembers.value = props.members || [];
      }
    };

    // members 또는 groupId가 바뀌면 이름 재로딩
    watch(
      () => [props.groupId, JSON.stringify(props.members)],
      () => loadMemberNames(),
      { immediate: true }
    );
    const selectedProposal = ref(null);
    
    // 드래그 앤 드롭 관련
    const draggingProposal = ref(null);
    const dragOverDay = ref(null);
    
    // 애니메이션 관련
    const calendarRef = ref(null);
    const isAnimating = ref(false);
    
    // 상태 옵션
    // 상태 옵션: 미정 / 가능 / 불가능(사유)
    const statusOptions = [
      { value: '', label: '미정', icon: '❔' },
      { value: 'available', label: '가능', icon: '✅' },
      { value: 'vacation', label: '휴가(불가능)', icon: '🏖️' },
      { value: 'other', label: '다른 약속(불가능)', icon: '📅' },
      { value: 'solo', label: '혼밥 예정(불가능)', icon: '🍱' },
      { value: 'skip', label: '밥 스킵(불가능)', icon: '⏭️' }
    ];
    
    // 식사 정보
    const mealDetails = ref({
      restaurant: '',
      menu: '',
      participants: []
    });
    
    // 휴가 정보
    const vacationDetails = ref({
      reason: ''
    });
    
    // 다른 약속 정보
    const otherDetails = ref({
      description: ''
    });
    
    // 요일 배열
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    
    // 음식점 목록 (Firebase에서 로드)
    const restaurants = ref([]);
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

    // 음식점 목록 로드
    const loadRestaurants = async () => {
      try {
        const restaurantList = await getAllRestaurants(200);
        restaurants.value = restaurantList.map(r => r.name);
        console.log('음식점 목록 로드 완료:', restaurants.value.length);
      } catch (error) {
        console.error('음식점 목록 로드 실패:', error);
        restaurants.value = [];
      }
    };
    
    // 선택된 음식점
    const selectedRestaurant = ref('');
    
    // 한국 공휴일 목록 (2025년)
    const holidays = ref([
      '2025-01-01', // 신정
      '2025-01-28', // 설날 연휴
      '2025-01-29', // 설날
      '2025-01-30', // 설날 연휴
      '2025-03-01', // 삼일절
      '2025-05-05', // 어린이날
      '2025-05-12', // 부처님오신날
      '2025-06-06', // 현충일
      '2025-08-15', // 광복절
      '2025-10-05', // 추석 연휴
      '2025-10-06', // 추석
      '2025-10-07', // 추석 연휴
      '2025-10-08', // 추석 대체휴일
      '2025-10-03', // 개천절
      '2025-10-09', // 한글날
      '2025-12-25'  // 성탄절
    ]);
    
    // 공휴일인지 확인
    const isHoliday = (dateStr) => {
      return holidays.value.includes(dateStr);
    };
    
    // 주말 또는 공휴일인지 확인
    const isWeekendOrHoliday = (dateStr, dayOfWeek) => {
      // 2025년 9월 8일은 특별히 평일로 처리
      if (dateStr === '2025-09-08') return false;
      
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 일요일=0, 토요일=6
      const isHolidayDate = isHoliday(dateStr);
      return isWeekend || isHolidayDate;
    };
    
    // 가능한 멤버들 가져오기
    const getAvailableMembers = (date) => {
      // Firebase에서 로드한 멤버 상태 기반으로 가능 멤버 추출
      const statuses = memberStatuses.value[date] || {};
      return Object.entries(statuses)
        .filter(([, s]) => s.status === 'available')
        .map(([memberId]) => memberId);
    };
    
    // 현재 월 텍스트
    const currentMonthText = computed(() => {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth() + 1;
      return `${year}년 ${month}월`;
    });
    
    // 캘린더 날짜 배열 (주말 비활성화)
    const calendarDays = computed(() => {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();
      const today = new Date();
      
      // 이번 달 첫째 날
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // 이번 달 첫째 날의 요일 (0=일요일)
      const firstDayWeekday = firstDay.getDay();
      
      // 이전 달 마지막 날들
      const prevMonth = new Date(year, month, 0);
      const prevMonthDays = [];
      for (let i = firstDayWeekday - 1; i >= 0; i--) {
        const dayDate = new Date(year, month, -i);
        const dayOfWeek = dayDate.getDay();
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
        const isWeekendOrHolidayDate = isWeekendOrHoliday(dateStr, dayOfWeek);
        
        prevMonthDays.push({
          dayNumber: dayDate.getDate(),
          date: dateStr,
          isCurrentMonth: false,
          isToday: false,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
          isHoliday: isHoliday(dateStr),
          isWeekendOrHoliday: isWeekendOrHolidayDate,
          events: [],
          memo: '',
          availableMembers: isWeekendOrHolidayDate ? [] : getAvailableMembers(dateStr)
        });
      }
      
      // 이번 달 날짜들
      const currentMonthDays = [];
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayDate = new Date(year, month, day);
        const dayOfWeek = dayDate.getDay();
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isWeekendOrHolidayDate = isWeekendOrHoliday(dateStr, dayOfWeek);
        const isToday = year === today.getFullYear() && 
                      month === today.getMonth() && 
                      day === today.getDate();
        
        currentMonthDays.push({
          dayNumber: day,
          date: dateStr,
          isCurrentMonth: true,
          isToday,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
          isHoliday: isHoliday(dateStr),
          isWeekendOrHoliday: isWeekendOrHolidayDate,
          events: getDayEvents(dateStr),
          memo: getDayMemo(dateStr),
          availableMembers: isWeekendOrHolidayDate ? [] : getAvailableMembers(dateStr)
        });
      }
      
      // 다음 달 첫째 날들 (캘린더 완성용)
      const nextMonthDays = [];
      const remainingCells = 42 - (prevMonthDays.length + currentMonthDays.length);
      for (let day = 1; day <= remainingCells; day++) {
        const dayDate = new Date(year, month + 1, day);
        const dayOfWeek = dayDate.getDay();
        const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isWeekendOrHolidayDate = isWeekendOrHoliday(dateStr, dayOfWeek);
        
        nextMonthDays.push({
          dayNumber: day,
          date: dateStr,
          isCurrentMonth: false,
          isToday: false,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
          isHoliday: isHoliday(dateStr),
          isWeekendOrHoliday: isWeekendOrHolidayDate,
          events: [],
          memo: '',
          availableMembers: isWeekendOrHolidayDate ? [] : getAvailableMembers(dateStr)
        });
      }
      
      return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
    });
    
    // 멤버 상태 클래스 가져오기
    const getMemberStatusClass = (day, memberId) => {
      const memberStatus = getMemberStatusFromData(day, memberId);
      return {
        'status-available': memberStatus === 'available',
        'status-meal': memberStatus === 'meal',
        'status-vacation': memberStatus === 'vacation',
        'status-other': memberStatus === 'other'
      };
    };
    
    // 멤버 상태 텍스트 가져오기
    const getMemberStatusText = (day, memberId) => {
      const memberStatus = getMemberStatusFromData(day, memberId);
      const statusTexts = {
        'available': '가능',
        'meal': '식사',
        'vacation': '휴가',
        'other': '다른 약속'
      };
      return statusTexts[memberStatus] || '미정';
    };
    
    // 멤버 상태 가져오기 (Firebase에서 실제 데이터)
    const getMemberStatusFromData = (day, memberId) => {
      return memberStatuses.value[day.date]?.[memberId]?.status || 'available';
    };
    
    // 날짜별 이벤트 가져오기
    const getDayEvents = (date) => {
      // TODO: Firebase 이벤트 연동 시 교체. 현재는 비어 있음
      return [];
    };
    
    // 날짜별 메모 가져오기
    const getDayMemo = (date) => {
      // TODO: Firebase 메모 연동 시 교체. 현재는 비어 있음
      return '';
    };
    
    // 이벤트 아이콘 가져오기
    const getEventIcon = (type) => {
      const icons = {
        'meal': '🍽️',
        'vacation': '🏖️',
        'other': '📅'
      };
      return icons[type] || '📝';
    };
    
    // 이전 달
    const prevMonth = async () => {
      await animateCalendarTransition('prev');
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
    };
    
    // 다음 달
    const nextMonth = async () => {
      await animateCalendarTransition('next');
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
    };
    
    // 날짜 클릭 핸들러
    const handleDayClick = (day) => {
      if (!day.isWeekendOrHoliday) {
        selectDay(day);
      }
    };

    // 날짜 선택
    const selectDay = async (day) => {
      selectedDay.value = day;
      
      // 현재 사용자 정보 준비
      const currentMember = actualMembers.value.find(m => m.id === (currentUser.value?.uid || currentUser.value?.id))
        || { id: currentUser.value?.uid || currentUser.value?.id, name: currentUser.value?.name || '나' };
      
      // 모달 데이터 준비
      const modalData = {
        member: currentMember,
        date: day.date,
        currentStatus: memberStatuses.value[day.date]?.[currentMember.id]?.status || '',
        allMembers: actualMembers.value,
        memberStatuses: memberStatuses.value,
        restaurants: restaurants.value,
        groupId: props.groupId
      };
      
      // 부모 컴포넌트에 모달 오픈 이벤트 전달
      emit('open-status-modal', modalData);
      
      // 부모 컴포넌트에 날짜 선택 이벤트 전달
      emit('date-selected', day.date);
    };
    
    // 상세 정보 닫기
    const closeDetails = () => {
      selectedDay.value = null;
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
      
      showStatusModal.value = true;
    };
    
    // 상태 모달 닫기
    const closeStatusModal = () => {
      showStatusModal.value = false;
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
          details = {
            restaurant: mealDetails.value.restaurant,
            menu: mealDetails.value.menu,
            participants: mealDetails.value.participants
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
          // 로컬 상태 새로고침
          await loadMemberStatuses();
          closeStatusModal();
        } else {
          console.error('❌ 상태 저장 실패');
          alert('상태 저장에 실패했습니다.');
        }
      } catch (error) {
        console.error('상태 저장 실패:', error);
        alert('상태 저장 중 오류가 발생했습니다.');
      }
    };
    
    // 메모 저장
    const saveMemo = () => {
      // 실제로는 API에 저장해야 함
      console.log('메모 저장:', selectedDay.value.date, selectedDay.value.memo);
    };
    
    // 선택된 날짜 포맷팅
    const formatSelectedDate = (dateStr) => {
      const date = new Date(dateStr);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}월 ${day}일`;
    };
    
    // 요일 가져오기
    const getDayOfWeek = (dateStr) => {
      const date = new Date(dateStr);
      const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      return days[date.getDay()];
    };
    
    // 음식점 선택
    const selectRestaurant = (restaurant, date) => {
      selectedRestaurant.value = restaurant;
      // 실제로는 API에 저장해야 함
      console.log('음식점 선택:', restaurant, '날짜:', date);
    };

    // 월 변경 감지하여 멤버 상태 다시 로드
    watch(currentDate, () => {
      loadMemberStatuses();
    });

    // 제안 관련 함수들
    const getProposalsForDay = (date) => {
      return proposals.value.filter(proposal => proposal.date === date);
    };
    
    const getProposalStatus = (proposal) => {
      const totalMembers = actualMembers.value.length;
      const acceptedCount = proposal.votes.accepted.length;
      const rejectedCount = proposal.votes.rejected.length;
      
      if (rejectedCount > 0) {
        return 'rejected';
      } else if (acceptedCount >= Math.ceil(totalMembers / 2)) { // 과반수 이상이면 확정
        return 'confirmed';
      } else {
        return 'pending';
      }
    };
    
    // 제안 생성
    const createProposal = (date, restaurantName) => {
      const proposalId = `proposal_${date}_${Date.now()}`;
      const newProposal = {
        id: proposalId,
        date: date,
        restaurant: {
          name: restaurantName,
          category: '알 수 없음',
          rating: 0,
          distance: 0,
          priceRange: '가격 정보 없음'
        },
        proposer: {
          id: currentUser.value?.uid || currentUser.value?.id,
          name: currentUser.value?.name || '알 수 없음'
        },
        votes: {
          accepted: [currentUser.value?.uid || currentUser.value?.id], // 제안자는 자동으로 수락
          rejected: []
        },
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      proposals.value.push(newProposal);
      console.log('새 제안 생성:', newProposal);
    };

    // 확정된 메뉴 가져오기
    const getConfirmedMealForDay = (date) => {
      const confirmedProposal = proposals.value.find(p => 
        p.date === date && getProposalStatus(p) === 'confirmed'
      );
      return confirmedProposal?.restaurant.name || null;
    };

    // 제안 아이콘 가져오기
    const getProposalIcon = (proposal) => {
      const status = getProposalStatus(proposal);
      switch (status) {
        case 'confirmed': return '✅';
        case 'rejected': return '❌';
        case 'pending': 
        default: return '⏳';
      }
    };
    
    const voteProposal = async (proposalId, vote) => {
      const proposal = proposals.value.find(p => p.id === proposalId);
      if (!proposal) return;
      
      const userId = currentUser.value?.uid || currentUser.value?.id;
      
      // 기존 투표 제거
      proposal.votes.accepted = proposal.votes.accepted.filter(id => id !== userId);
      proposal.votes.rejected = proposal.votes.rejected.filter(id => id !== userId);
      
      // 새 투표 추가
      if (vote === 'accept') {
        proposal.votes.accepted.push(userId);
      } else if (vote === 'reject') {
        proposal.votes.rejected.push(userId);
      }
      
      // 상태 업데이트
      proposal.status = getProposalStatus(proposal);
      
      // 확정되었으면 알림 및 방문 기록 추가
      if (proposal.status === 'confirmed') {
        alert(`🎉 "${proposal.restaurant.name}" 확정되었습니다!`);
        
        // 방문 기록 추가
        try {
          await addRestaurantVisit(
            props.groupId,
            proposal.restaurant.name,
            proposal.date,
            proposal.votes.accepted
          );
          console.log('방문 기록 추가 완료');
        } catch (error) {
          console.error('방문 기록 추가 실패:', error);
        }
      }
      
      console.log('투표 완료:', proposal);
    };
    
    const openProposalModal = (proposal) => {
      selectedProposal.value = proposal;
      showProposalModal.value = true;
    };
    
    const closeProposalModal = () => {
      showProposalModal.value = false;
      selectedProposal.value = null;
    };
    
    // 드래그 앤 드롭 함수들
    const startDrag = (event, proposal) => {
      draggingProposal.value = proposal;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', proposal.id);
      
      // 드래그 중인 요소에 스타일 적용
      event.target.style.opacity = '0.5';
    };
    
    const endDrag = (event) => {
      draggingProposal.value = null;
      dragOverDay.value = null;
      event.target.style.opacity = '1';
    };
    
    const dropProposal = async (event, targetDate) => {
      event.preventDefault();
      
      if (!draggingProposal.value) return;
      
      // 주말이나 공휴일에는 드롭 불가
      const targetDay = calendarDays.value.find(day => day.date === targetDate);
      if (targetDay?.isWeekendOrHoliday) {
        alert('주말이나 공휴일에는 제안을 이동할 수 없습니다.');
        return;
      }
      
      // 드롭 애니메이션
      const proposalElement = event.target.closest('.proposal-item');
      const targetElement = document.querySelector(`[data-date="${targetDate}"]`);
      
      if (proposalElement && targetElement) {
        await animateProposalMove(proposalElement, targetElement);
      }
      
      // 제안 날짜 업데이트
      const proposalIndex = proposals.value.findIndex(p => p.id === draggingProposal.value.id);
      if (proposalIndex !== -1) {
        proposals.value[proposalIndex].date = targetDate;
        console.log(`제안이 ${targetDate}로 이동되었습니다.`);
      }
      
      draggingProposal.value = null;
      dragOverDay.value = null;
    };
    
    // 애니메이션 함수들
    const animateCalendarTransition = async (direction = 'next') => {
      if (isAnimating.value) return;
      isAnimating.value = true;
      
      const daysContainer = document.querySelector('.days-container');
      if (!daysContainer) return;
      
      const tl = gsap.timeline();
      
      // 현재 캘린더를 슬라이드 아웃
      tl.to(daysContainer, {
        x: direction === 'next' ? '-100%' : '100%',
        opacity: 0.3,
        duration: 0.3,
        ease: 'power2.inOut'
      });
      
      // 새 캘린더를 슬라이드 인
      tl.fromTo(daysContainer, {
        x: direction === 'next' ? '100%' : '-100%',
        opacity: 0.3
      }, {
        x: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.inOut'
      });
      
      await tl.play();
      isAnimating.value = false;
    };
    
    const animateDaySelection = (dayElement) => {
      if (!dayElement) return;
      
      gsap.fromTo(dayElement, {
        scale: 1,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }, {
        scale: 1.05,
        boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
        duration: 0.2,
        ease: 'back.out(1.7)',
        yoyo: true,
        repeat: 1
      });
    };
    
    const animateProposalMove = (proposalElement, targetElement) => {
      if (!proposalElement || !targetElement) return;
      
      const tl = gsap.timeline();
      
      // 제안 아이템을 타겟 위치로 이동
      tl.to(proposalElement, {
        x: targetElement.offsetLeft - proposalElement.offsetLeft,
        y: targetElement.offsetTop - proposalElement.offsetTop,
        duration: 0.5,
        ease: 'power2.inOut'
      });
      
      // 페이드 아웃 후 원래 위치로 복귀
      tl.to(proposalElement, {
        opacity: 0,
        scale: 0.8,
        duration: 0.2,
        ease: 'power2.inOut'
      });
      
      tl.set(proposalElement, {
        x: 0,
        y: 0,
        opacity: 1,
        scale: 1
      });
    };
    
    const animateStatusChange = (statusElement) => {
      if (!statusElement) return;
      
      gsap.fromTo(statusElement, {
        scale: 0.8,
        opacity: 0.5
      }, {
        scale: 1.2,
        opacity: 1,
        duration: 0.3,
        ease: 'back.out(1.7)',
        yoyo: true,
        repeat: 1
      });
    };
    
    const animatePanelSlide = (panelElement, direction = 'in') => {
      if (!panelElement) return;
      
      if (direction === 'in') {
        gsap.fromTo(panelElement, {
          x: '100%',
          opacity: 0
        }, {
          x: 0,
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out'
        });
      } else {
        gsap.to(panelElement, {
          x: '100%',
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in'
        });
      }
    };
    
    // Firebase에서 그룹 데이터 로드
    const loadGroupData = async () => {
      try {
        console.log('그룹 데이터 로드 시작...', props.groupId);
        const group = await getGroup(props.groupId);
        console.log('그룹 데이터 로드 완료:', group);
        
        // 그룹 멤버 정보를 props.members에 반영
        if (group && group.members) {
          // 부모 컴포넌트에서 멤버 데이터를 업데이트하도록 이벤트 발생
          emit('group-loaded', group);
        }
      } catch (error) {
        console.error('그룹 데이터 로드 실패:', error);
        // 오류 시 빈 그룹 데이터 설정
        const defaultGroup = {
          id: props.groupId || 'unknown',
          name: '그룹을 불러올 수 없습니다',
          members: []
        };
        emit('group-loaded', defaultGroup);
      }
    };

    // 컴포넌트 마운트 시 초기화
    onMounted(async () => {
      await loadCurrentUser();
      await loadGroupData();
      await loadMemberStatuses();
      await loadMemberNames();
      await loadRestaurants();
      
      // 제안 데이터는 Firebase에서 가져오도록 수정 (현재는 빈 배열로 초기화)
      proposals.value = [];
      console.log('캘린더 초기화 완료');
    });
    
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

    // 멤버 상태들 로드
    const loadMemberStatuses = async () => {
      if (!props.groupId) {
        console.warn('groupId가 없어서 멤버 상태 로드 불가');
        return;
      }
      
      loading.value = true;
      try {
        const year = currentDate.value.getFullYear();
        const month = currentDate.value.getMonth();
        
        // 이번 달의 시작일과 끝일 계산
        const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;
        
        console.log('멤버 상태 로드 중:', { groupId: props.groupId, startDate, endDate });
        
        const result = await getGroupMemberStatuses(props.groupId, startDate, endDate);
        console.log('멤버 상태 로드 결과:', result);
        
        if (result.success) {
          memberStatuses.value = result.data;
          console.log('✅ 멤버 상태 로드 성공:', Object.keys(result.data).length + '개 날짜');
        } else {
          console.error('❌ 멤버 상태 로드 실패:', result.error);
        }
      } catch (error) {
        console.error('멤버 상태 로드 실패:', error);
      } finally {
        loading.value = false;
      }
    };

    // 멤버 상태 저장
    const saveMemberStatusToFirebase = async (userId, date, status, details = {}) => {
      try {
        const result = await saveMemberStatus(props.groupId, userId, date, status, details);
        if (result.success) {
          // 로컬 상태 업데이트
          if (!memberStatuses.value[date]) {
            memberStatuses.value[date] = {};
          }
          memberStatuses.value[date][userId] = { status, details };
          return true;
        }
        return false;
      } catch (error) {
        console.error('멤버 상태 저장 실패:', error);
        return false;
      }
    };

    // 멤버 상태 삭제
    const deleteMemberStatusFromFirebase = async (userId, date) => {
      try {
        const result = await deleteMemberStatus(props.groupId, userId, date);
        if (result.success) {
          // 로컬 상태에서 제거
          if (memberStatuses.value[date] && memberStatuses.value[date][userId]) {
            delete memberStatuses.value[date][userId];
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error('멤버 상태 삭제 실패:', error);
        return false;
      }
    };
    
    return {
      currentDate,
      selectedDay,
      weekdays,
      restaurants,
      selectedRestaurant,
      holidays,
      isHoliday,
      isWeekendOrHoliday,
      currentUser,
      memberStatuses,
      loading,
      proposals,
      actualMembers,
      showProposalModal,
      selectedProposal,
      currentMonthText,
      calendarDays,
      getMemberStatusClass,
      getMemberStatusText,
      getEventIcon,
      formatSelectedDate,
      getDayOfWeek,
      selectRestaurant,
      getAvailableMembersForDay,
      openRestaurantModal,
      getProposalsForDay,
      getProposalStatus,
      voteProposal,
      openProposalModal,
      closeProposalModal,
      loadCurrentUser,
      loadMemberStatuses,
      saveMemberStatusToFirebase,
      deleteMemberStatusFromFirebase,
      prevMonth,
      nextMonth,
      handleDayClick,
      selectDay,
      closeDetails,
      saveMemo,
      // 드래그 앤 드롭
      draggingProposal,
      dragOverDay,
      startDrag,
      endDrag,
      dropProposal,
      // 애니메이션
      calendarRef,
      isAnimating,
      animateCalendarTransition,
      animateDaySelection,
      animateProposalMove,
      animateStatusChange,
      animatePanelSlide,
      // 제안 관리
      createProposal,
      getConfirmedMealForDay,
      getProposalIcon
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

.calendar-header {
  padding: 2rem 2rem 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border-radius: 1.5rem 1.5rem 0 0;
}

/* 헤더 스타일 */
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-btn {
  background: #ffffff;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.month-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.view-options {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.view-btn:hover:not(.active) {
  background: #e2e8f0;
}

.member-legend {
  background: #f8fafc;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
}

.legend-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.75rem;
}

.legend-items {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.member-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.member-name {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

/* 캘린더 컨테이너 */
.calendar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
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
}

.edit-status-btn:hover {
  background: #2563eb;
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
