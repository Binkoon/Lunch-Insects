<template>
  <div class="modern-calendar">
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
          <div class="legend-item" v-for="member in members" :key="member.id">
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
          @click="!day.isWeekendOrHoliday && selectDay(day)"
        >
          <div class="day-header">
            <span class="day-number">{{ day.dayNumber }}</span>
            <div v-if="day.isToday" class="today-indicator"></div>
          </div>
          
          <!-- 평일인 경우에만 멤버 표시 -->
          <div v-if="!day.isWeekendOrHoliday" class="day-content">
            <!-- 멤버 상태들 -->
            <div class="member-statuses">
              <div 
                v-for="member in members" 
                :key="member.id"
                class="member-status"
                :class="getMemberStatusClass(day, member.id)"
                :title="`${member.name}: ${getMemberStatusText(day, member.id)}`"
              >
                <div 
                  class="status-indicator" 
                  :style="{ backgroundColor: member.color }"
                ></div>
              </div>
            </div>
            
            <!-- 제안들 -->
            <div v-if="getProposalsForDay(day.date).length > 0" class="proposals">
              <div 
                v-for="proposal in getProposalsForDay(day.date)" 
                :key="proposal.id"
                class="proposal-item"
                :class="getProposalStatus(proposal)"
                @click="openProposalModal(proposal)"
              >
                <div class="proposal-info">
                  <span class="proposer-name">{{ proposal.proposer.name }}</span>
                  <span class="restaurant-name">{{ proposal.restaurant.name }}</span>
                  <span class="proposal-status">{{ getProposalStatus(proposal) === 'pending' ? '제안 중' : getProposalStatus(proposal) === 'accepted' ? '확정' : '거부' }}</span>
                </div>
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

    <!-- 선택된 날짜 상세 정보 -->
    <div v-if="selectedDay" class="day-details-panel">
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
                v-for="member in members" 
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

    <!-- 멤버 상태 편집 모달 -->
    <div v-if="showStatusModal" class="modal-overlay" @click="closeStatusModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingMember.name }} - {{ editingDate }} 상태 편집</h3>
          <button @click="closeStatusModal" class="close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <div class="status-options">
            <label 
              v-for="status in statusOptions" 
              :key="status.value"
              class="status-option"
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
          
          <!-- 식사 정보 (식사 선택 시) -->
          <div v-if="editingStatus === 'meal'" class="meal-details">
            <div class="form-group">
              <label>음식점 이름</label>
              <input 
                v-model="mealDetails.restaurant"
                placeholder="음식점 이름을 입력하세요"
              />
            </div>
            <div class="form-group">
              <label>메뉴</label>
              <input 
                v-model="mealDetails.menu"
                placeholder="먹은 메뉴를 입력하세요"
              />
            </div>
            <div class="form-group">
              <label>참여 멤버</label>
              <div class="participants">
                <label 
                  v-for="member in members" 
                  :key="member.id"
                  class="participant-checkbox"
                >
                  <input 
                    type="checkbox" 
                    :value="member.id" 
                    v-model="mealDetails.participants"
                  />
                  {{ member.name }}
                </label>
              </div>
            </div>
          </div>
          
          <!-- 휴가 정보 (휴가 선택 시) -->
          <div v-if="editingStatus === 'vacation'" class="vacation-details">
            <div class="form-group">
              <label>휴가 사유</label>
              <input 
                v-model="vacationDetails.reason"
                placeholder="휴가 사유를 입력하세요"
              />
            </div>
          </div>
          
          <!-- 다른 약속 정보 (다른 약속 선택 시) -->
          <div v-if="editingStatus === 'other'" class="other-details">
            <div class="form-group">
              <label>약속 내용</label>
              <input 
                v-model="otherDetails.description"
                placeholder="약속 내용을 입력하세요"
              />
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeStatusModal" class="btn-secondary">취소</button>
          <button @click="saveStatus" class="btn-primary">저장</button>
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
                      {{ members.find(m => m.id === userId)?.name || '알 수 없음' }}
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
                      {{ members.find(m => m.id === userId)?.name || '알 수 없음' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 투표 버튼 -->
            <div class="voting-actions">
              <button 
                class="vote-btn accept" 
                @click="voteProposal(selectedProposal.id, 'accept')"
                :disabled="selectedProposal.votes.accepted.includes(currentUser?.id)"
              >
                👍 수락
              </button>
              <button 
                class="vote-btn reject" 
                @click="voteProposal(selectedProposal.id, 'reject')"
                :disabled="selectedProposal.votes.rejected.includes(currentUser?.id)"
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
import { ref, computed, onMounted, watch } from 'vue';
import { 
  saveMemberStatus, 
  getMemberStatus, 
  getGroupMemberStatuses, 
  deleteMemberStatus 
} from '@/services/firebaseDBv2.js';
import { getCurrentUser } from '@/services/firebaseAuth.js';

export default {
  name: 'GroupCalendar',
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
  emits: ['date-selected'],
  setup(props, { emit }) {
    // 현재 날짜 (2025년 9월로 설정)
    const currentDate = ref(new Date(2025, 8, 1)); // 2025년 9월
    const selectedDay = ref(null);
    const showStatusModal = ref(false);
    const editingMember = ref(null);
    const editingDate = ref('');
    const editingStatus = ref('');
    const currentUser = ref(null);
    const memberStatuses = ref({});
    const loading = ref(false);
    const proposals = ref([]);
    const showProposalModal = ref(false);
    const selectedProposal = ref(null);
    
    // 상태 옵션
    const statusOptions = [
      { value: 'available', label: '가능', icon: '✅' },
      { value: 'meal', label: '식사', icon: '🍽️' },
      { value: 'vacation', label: '휴가', icon: '🏖️' },
      { value: 'other', label: '다른 약속', icon: '📅' }
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
    
    // 음식점 목록
    const restaurants = ref([
      '금성관', '리원', '신의주부대찌개', '바스버거', '맘스터치', '롯데리아', '태진옥', '돈우가',
      '이가네양꼬치', '분지로', '밀피유', '은앤정닭갈비', '보노보스햄버거', '미쓰족발', '대한곱창',
      '월가갈비', '창고43', 'KFC', '26층 구내식당', '정신라멘', '멘무샤', '콜리그', '행복한소바',
      '청진동해장국', '박씨화로구이', '우대포블랙', '풍닭'
    ]);
    
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
      // 임시 데이터 - 실제로는 API에서 가져와야 함
      const mockData = {
        '2024-01-15': ['member1', 'member2', 'member3'],
        '2024-01-16': ['member1', 'member2'],
        '2024-01-17': ['member2', 'member3', 'member4']
      };
      
      return mockData[date] || [];
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
      // 임시 데이터 - 실제로는 API에서 가져와야 함
      const mockEvents = {
        '2024-01-15': [
          { id: 1, type: 'meal', title: '점심: 금성관', participants: ['member1', 'member2'], restaurant: '금성관' },
          { id: 2, type: 'vacation', title: '휴가', participants: ['member3'] }
        ],
        '2024-01-16': [
          { id: 3, type: 'meal', title: '점심: 바스버거', participants: ['member2', 'member3'], restaurant: '바스버거' }
        ]
      };
      
      return mockEvents[date] || [];
    };
    
    // 날짜별 메모 가져오기
    const getDayMemo = (date) => {
      // 임시 데이터 - 실제로는 API에서 가져와야 함
      const mockMemos = {
        '2024-01-15': '오늘은 김치찌개를 먹었습니다. 맛있었어요!',
        '2024-01-16': '치킨이 정말 맛있었습니다.'
      };
      
      return mockMemos[date] || '';
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
    const prevMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
    };
    
    // 다음 달
    const nextMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
    };
    
    // 날짜 선택
    const selectDay = (day) => {
      selectedDay.value = day;
      
      // 부모 컴포넌트에 날짜 선택 이벤트 전달
      emit('date-selected', day.date);
    };
    
    // 상세 정보 닫기
    const closeDetails = () => {
      selectedDay.value = null;
    };
    
    // 멤버 상태 편집
    const editMemberStatus = (memberId, date) => {
      editingMember.value = props.members.find(m => m.id === memberId);
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
        if (editingStatus.value === 'meal') {
          details = {
            restaurant: mealDetails.value.restaurant,
            menu: mealDetails.value.menu,
            participants: mealDetails.value.participants
          };
        } else if (editingStatus.value === 'vacation') {
          details = {
            reason: vacationDetails.value.reason
          };
        } else if (editingStatus.value === 'other') {
          details = {
            description: otherDetails.value.description
          };
        }
        
        const success = await saveMemberStatusToFirebase(
          editingMember.value.id,
          editingDate.value,
          editingStatus.value,
          details
        );
        
        if (success) {
          console.log('상태 저장 성공');
          closeStatusModal();
        } else {
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
      const totalMembers = props.members.length;
      const acceptedCount = proposal.votes.accepted.length;
      const rejectedCount = proposal.votes.rejected.length;
      
      if (rejectedCount > 0) {
        return 'rejected';
      } else if (acceptedCount === totalMembers) {
        return 'accepted';
      } else {
        return 'pending';
      }
    };
    
    const voteProposal = (proposalId, vote) => {
      const proposal = proposals.value.find(p => p.id === proposalId);
      if (!proposal) return;
      
      const userId = currentUser.value.id;
      
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
    
    // 컴포넌트 마운트 시 초기화
    onMounted(async () => {
      await loadCurrentUser();
      await loadMemberStatuses();
      
      // 목업 제안 데이터 (2025년 9월 8일과 9일)
      proposals.value = [
        {
          id: 'proposal_1',
          restaurant: {
            id: 8,
            name: '돈우가',
            category: '일식',
            distance: 7,
            rating: 4.2,
            priceRange: '12,000원'
          },
          proposer: { id: 'user1', name: '김철수' },
          date: '2025-09-08', // 2025년 9월 8일 (특별히 평일로 처리)
          status: 'pending',
          votes: {
            accepted: ['user1'],
            rejected: []
          },
          createdAt: new Date()
        },
        {
          id: 'proposal_2',
          restaurant: {
            id: 1,
            name: '금성관',
            category: '한식',
            distance: 3,
            rating: 4.2,
            priceRange: '8,000원'
          },
          proposer: { id: 'user2', name: '이영희' },
          date: '2025-09-09', // 2025년 9월 9일 월요일
          status: 'accepted',
          votes: {
            accepted: ['user1', 'user2', 'user3', 'user4'],
            rejected: []
          },
          createdAt: new Date()
        }
      ];
    });
    
    // 가능한 멤버들만 필터링
    const getAvailableMembersForDay = (day) => {
      return props.members.filter(member => 
        day.availableMembers.includes(member.id)
      );
    };
    
    // 음식점 선택 모달 열기
    const openRestaurantModal = (day) => {
      selectedDay.value = day;
      selectedRestaurant.value = '';
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
      if (!props.groupId) return;
      
      loading.value = true;
      try {
        const year = currentDate.value.getFullYear();
        const month = currentDate.value.getMonth();
        
        // 이번 달의 시작일과 끝일 계산
        const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;
        
        const result = await getGroupMemberStatuses(props.groupId, startDate, endDate);
        if (result.success) {
          memberStatuses.value = result.data;
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
      showStatusModal,
      editingMember,
      editingDate,
      editingStatus,
      statusOptions,
      mealDetails,
      vacationDetails,
      otherDetails,
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
      selectDay,
      closeDetails,
      editMemberStatus,
      closeStatusModal,
      saveStatus,
      saveMemo
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

.member-statuses {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.member-status {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.status-indicator {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.member-status.status-available .status-indicator {
  background-color: #10b981 !important;
}

.member-status.status-meal .status-indicator {
  background-color: #f59e0b !important;
}

.member-status.status-vacation .status-indicator {
  background-color: #3b82f6 !important;
}

.member-status.status-other .status-indicator {
  background-color: #8b5cf6 !important;
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

.proposal-item.accepted {
  border-left: 3px solid #10b981;
}

.proposal-item.rejected {
  border-left: 3px solid #ef4444;
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

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
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
  padding: 1.5rem;
}

.status-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-option:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.status-option input[type="radio"] {
  margin: 0;
}

.status-icon {
  font-size: 1.5rem;
}

.status-label {
  font-weight: 500;
  color: #1e293b;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-secondary {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.btn-primary:hover {
  background: #2563eb;
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
</style>
