<template>
  <div class="home-container">
    <!-- 헤더 -->
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="app-title">식충이 캘린더 v2.0</h1>
          <p class="app-subtitle">스마트한 점심 관리 플랫폼</p>
        </div>
        
        <div class="header-right">
          <!-- 이번달 누적 지출 정보 -->
          <div class="expense-info">
            <div class="expense-item">
              <div class="expense-icon">🎫</div>
              <div class="expense-details">
                <span class="expense-label">이번달 식권포인트</span>
                <span class="expense-amount">{{ userExpenses.ticketPoints.toLocaleString() }}P</span>
              </div>
            </div>
            <div class="expense-item">
              <div class="expense-icon">💵</div>
              <div class="expense-details">
                <span class="expense-label">이번달 현금</span>
                <span class="expense-amount">{{ userExpenses.cash.toLocaleString() }}원</span>
              </div>
            </div>
          </div>
          
          <div class="user-info">
            <img 
              v-if="currentUser.avatar" 
              :src="currentUser.avatar" 
              :alt="currentUser.name"
              class="user-avatar"
            />
            <div v-else class="user-avatar default-avatar">
              👤
            </div>
            <span class="user-name">{{ currentUser.name }}</span>
          </div>
          
          <button 
            v-if="isGroupAdmin" 
            class="group-btn" 
            @click="openGroupManagement"
          >
            <i class="icon-users">👥</i>
            그룹 관리
          </button>
          
          <button class="logout-btn" @click="handleLogout">
            <i class="icon-logout">🚪</i>
            로그아웃
          </button>
        </div>
      </div>
    </header>

    <!-- 메인 컨텐츠 -->
    <main class="main-content">
      <div class="content-grid">
        <!-- 왼쪽: 캘린더 (60%) -->
        <section class="calendar-section">
          <div class="section-header">
            <h2>📅 월별 캘린더</h2>
            <button class="add-event-btn" @click="openAddEventModal">
              <i class="icon-plus">+</i>
                일정 추가
              </button>
          </div>
          
          <GroupCalendar 
            v-if="currentGroup && currentGroup.id"
            :groupId="currentGroup.id"
            :members="membersForCalendar"
            @date-selected="handleDateSelected"
            @open-status-modal="openStatusModal"
            @status-updated="handleStatusUpdated"
          />
        </section>

        <!-- 오른쪽: 주변 맛집 (40%) -->
        <section class="restaurant-section">
          <div class="section-header">
            <h2>주변 맛집</h2>
            <button class="refresh-btn" @click="refreshRecommendations">
              <i class="icon-refresh">↻</i>
                새로고침
              </button>
          </div>
          
          <!-- 현재 위치 정보 -->
          <div class="location-card">
            <div class="location-header">
              <div class="location-icon">📍</div>
              <div class="location-details">
                <h3>{{ currentLocation.name }}</h3>
                <p>{{ currentLocation.address }}</p>
              </div>
              <button class="location-btn" @click="updateLocation">
                <i class="icon-refresh">↻</i>
                위치 업데이트
              </button>
            </div>
            
            <!-- 플랫폼 통계 -->
            <div class="distance-stats">
              <div class="stat-item">
                <span class="stat-icon">👥</span>
                <span class="stat-text">등록 사용자: {{ nearbyStats.activeUsers }}명</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">🍽️</span>
                <span class="stat-text">등록된 음식점: {{ nearbyStats.restaurants }}개</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">🏢</span>
                <span class="stat-text">활성 그룹: {{ nearbyStats.groups }}개</span>
              </div>
            </div>
          </div>
          
          <!-- 음식점 필터 -->
          <div class="filter-section">
            <div class="search-bar">
              <input 
                v-model="searchQuery"
                type="text" 
                placeholder="음식점 이름이나 메뉴를 검색하세요"
                class="search-input"
              />
              <button class="search-btn" @click="searchRestaurants">
                <i class="icon-search">🔍</i>
              </button>
          </div>
          
            <div class="filter-tabs">
            <button 
                v-for="category in foodCategories" 
                :key="category.id"
                :class="['filter-tab', { active: selectedCategory === category.id }]"
                @click="selectCategory(category.id)"
              >
                {{ category.icon }} {{ category.name }}
            </button>
            </div>
          </div>
          
          <!-- 음식점 목록 -->
          <div class="restaurants-list">
            <div 
              v-for="restaurant in filteredRestaurants" 
              :key="restaurant.id"
              :class="['restaurant-item', { selected: selectedRestaurant?.id === restaurant.id }]"
              @click="selectRestaurant(restaurant)"
            >
              <div class="restaurant-image">
                <img :src="restaurant.image || '/api/placeholder/80/80'" :alt="restaurant.name" />
              </div>
              <div class="restaurant-info">
                <h4 class="restaurant-name">{{ restaurant.name }}</h4>
                <p class="restaurant-category">{{ getCategoryName(restaurant.category) }}</p>
                <div class="restaurant-details">
                  <span class="distance">🚶 {{ restaurant.walkingTime }}분</span>
                  <span class="rating">⭐ {{ restaurant.rating }}</span>
                  <span class="price">{{ restaurant.priceRange }}</span>
                </div>
              </div>
              <div class="restaurant-actions">
                <button class="action-btn" @click.stop="viewDetails(restaurant)">
                  상세보기
                </button>
                <button class="action-btn primary" @click.stop="selectForLunch(restaurant)">
                  선택
            </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- 소비금액 그래프 섹션 -->
      <section class="expense-chart-section">
        <div class="section-header">
          <h2>📊 월별 소비금액 분석</h2>
          <div class="chart-controls">
            <button class="chart-btn" @click="refreshChart">
              <i class="icon-refresh">↻</i>
              새로고침
            </button>
            </div>
          </div>
          
        <div class="chart-container">
          <div class="chart-tabs">
            <button 
              :class="['chart-tab', { active: selectedChartType === 'personal' }]"
              @click="selectChartType('personal')"
            >
              개인 소비
            </button>
            <button 
              :class="['chart-tab', { active: selectedChartType === 'group' }]"
              @click="selectChartType('group')"
            >
              그룹 소비
            </button>
          </div>
          
          <div class="chart-content">
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color ticket"></div>
                <span>식권포인트</span>
              </div>
              <div class="legend-item">
                <div class="legend-color cash"></div>
                <span>현금</span>
            </div>
          </div>
          
            <div class="chart-area">
              <canvas ref="expenseChart" width="800" height="400"></canvas>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 모달들 -->
    <div v-if="showAddEventModal" class="modal-overlay" @click="closeAddEventModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>일정 추가</h3>
          <button class="close-btn" @click="closeAddEventModal">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addEvent">
            <div class="form-group">
              <label>제목</label>
              <input v-model="newEvent.title" type="text" placeholder="일정 제목을 입력하세요" required />
            </div>
            <div class="form-group">
              <label>날짜</label>
              <input v-model="newEvent.date" type="date" required />
            </div>
            <div class="form-group">
              <label>시간</label>
              <input v-model="newEvent.time" type="time" required />
            </div>
            <div class="form-group">
              <label>설명</label>
              <textarea v-model="newEvent.description" placeholder="일정에 대한 설명을 입력하세요" rows="3"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeAddEventModal">취소</button>
          <button class="btn-primary" @click="addEvent">추가</button>
        </div>
      </div>
    </div>

    <!-- 그룹 관리 모달 -->
    <div v-if="showGroupModal" class="modal-overlay" @click="closeGroupModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>그룹 관리</h3>
          <button class="close-btn" @click="closeGroupModal">×</button>
        </div>
        <div class="modal-body">
          <GroupManagement 
            :groupId="currentGroup?.id"
            :currentUser="currentUser"
            @group-updated="handleGroupUpdated"
          />
        </div>
      </div>
    </div>

    <!-- 음식점 상세보기 모달 -->
    <div v-if="showRestaurantModal" class="modal-overlay" @click="closeRestaurantModal">
      <div class="modal-content restaurant-detail" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedRestaurantDetail?.name }}</h3>
          <button class="close-btn" @click="closeRestaurantModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedRestaurantDetail" class="restaurant-detail-content">
            <!-- 음식점 기본 정보 -->
            <div class="restaurant-info-section">
              <div class="restaurant-image-large">
                <img :src="selectedRestaurantDetail.image || '/api/placeholder/200/150'" :alt="selectedRestaurantDetail.name" />
              </div>
              <div class="restaurant-basic-info">
                <div class="restaurant-category">{{ selectedRestaurantDetail.category }}</div>
                <div class="restaurant-rating">⭐ {{ selectedRestaurantDetail.rating }}</div>
                <div class="restaurant-distance">🚶 {{ selectedRestaurantDetail.distance }}분</div>
              </div>
            </div>
            
            <!-- 메뉴판 -->
            <div class="menu-section">
              <h4>메뉴판</h4>
              <div class="menu-list">
                <div 
                  v-for="menu in (selectedRestaurantDetail.menus || selectedRestaurantDetail.menu || [])" 
                  :key="menu.id || menu.name"
                  class="menu-item"
                >
                  <div class="menu-info">
                    <span class="menu-name">{{ menu.name }}</span>
                    <span class="menu-description">{{ menu.description }}</span>
                  </div>
                  <span class="menu-price">{{ menu.price.toLocaleString() }}원</span>
                </div>
              </div>
            </div>
            
            <!-- 선택 버튼 -->
            <div class="restaurant-actions">
              <button class="btn-secondary" @click="closeRestaurantModal">닫기</button>
              <button class="btn-primary" @click="selectRestaurantForLunch(selectedRestaurantDetail)">
                이 음식점 선택하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 멤버 상태 편집 모달 (전체 화면 오버레이) -->
    <Teleport to="body">
      <div v-if="showStatusModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div class="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 class="text-xl font-bold text-gray-900">
              {{ modalData.member?.name }} - {{ modalData.date }} 상태 편집
            </h3>
            <button @click="closeStatusModal" class="text-gray-400 hover:text-gray-600 text-2xl">×</button>
          </div>
          
          <div class="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
            <!-- 다른 멤버들의 상태 표시 -->
            <div class="mb-8">
              <h4 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                👥 팀원들 상태
              </h4>
              <div class="space-y-3 max-h-60 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div 
                  v-for="member in modalData.allMembers" 
                  :key="member.id"
                  class="flex items-center gap-4 p-4 bg-white rounded-lg border-2 transition-all hover:shadow-md"
                  :class="getMemberStatusClass(modalData.date, member.id)"
                >
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white"
                       :style="{ backgroundColor: member.color }">
                    {{ member.name.charAt(0) }}
                  </div>
                  <div class="flex-1">
                    <div class="font-semibold text-gray-900">{{ member.name }}</div>
                    <div class="text-sm font-medium text-gray-600">{{ getMemberStatusText(modalData.date, member.id) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-8"></div>
            
            <div class="mb-6">
              <h4 class="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                ⚙️ 내 상태 설정
              </h4>
              <div class="grid grid-cols-2 gap-4">
                <label 
                  v-for="status in statusOptions" 
                  :key="status.value"
                  class="flex items-center gap-4 p-5 border-2 border-gray-200 rounded-xl cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-lg"
                  :class="{ 'border-blue-500 bg-blue-50 shadow-lg': editingStatus === status.value }"
                >
                  <input 
                    type="radio" 
                    :value="status.value" 
                    v-model="editingStatus"
                    class="w-5 h-5 accent-blue-500"
                  />
                  <span class="text-2xl drop-shadow">{{ status.icon }}</span>
                  <span class="font-semibold text-gray-900">{{ status.label }}</span>
                </label>
              </div>
            </div>
            
            <!-- 가능 선택 시 제안 입력 -->
            <div v-if="editingStatus === 'available'" class="space-y-6">
              <div>
                <label class="block text-base font-semibold text-gray-900 mb-3">음식점 제안</label>
                <div class="relative">
                  <input 
                    class="w-full p-4 border-2 border-gray-200 rounded-xl text-base transition-all focus:border-blue-500 focus:shadow-lg bg-gradient-to-br from-white to-gray-50"
                    v-model="mealDetails.restaurant"
                    placeholder="음식점 검색"
                    @focus="dropdownOpen = true"
                    @input="dropdownOpen = true"
                    @blur="setTimeout(() => dropdownOpen = false, 150)"
                  />
                  <div v-if="dropdownOpen && modalData.restaurants?.length" 
                       class="absolute left-0 right-0 z-30 bg-white border-2 border-gray-200 rounded-xl mt-2 max-h-60 overflow-auto shadow-2xl">
                    <div
                      v-for="r in modalData.restaurants.filter(rest => rest.toLowerCase().includes((mealDetails.restaurant || '').toLowerCase()))"
                      :key="r"
                      class="p-4 cursor-pointer transition-all hover:bg-blue-50 border-b border-gray-100 last:border-b-0 font-medium"
                      @mousedown.prevent="mealDetails.restaurant = r; dropdownOpen = false"
                    >
                      {{ r }}
                    </div>
                  </div>
                </div>
                <div class="text-sm text-gray-600 mt-2">목록에 없으면 그대로 입력하세요.</div>
              </div>
              
              <div>
                <label class="block text-base font-semibold text-gray-900 mb-3">메뉴</label>
                <input 
                  v-model="mealDetails.menu"
                  placeholder="먹은 메뉴를 입력하세요"
                  class="w-full p-4 border-2 border-gray-200 rounded-xl text-base transition-all focus:border-blue-500 focus:shadow-lg bg-gradient-to-br from-white to-gray-50"
                />
              </div>
              
              <div>
                <label class="block text-base font-semibold text-gray-900 mb-3">참여 멤버</label>
                <div class="grid grid-cols-2 gap-3">
                  <label 
                    v-for="member in modalData.allMembers" 
                    :key="member.id"
                    class="flex items-center gap-3 text-base cursor-pointer"
                  >
                    <input 
                      type="checkbox" 
                      :value="member.id" 
                      v-model="mealDetails.participants"
                      class="w-4 h-4 accent-blue-500"
                    />
                    {{ member.name }}
                  </label>
                </div>
              </div>
            </div>
            
            <!-- 휴가 정보 -->
            <div v-if="editingStatus === 'vacation'" class="space-y-6">
              <div>
                <label class="block text-base font-semibold text-gray-900 mb-3">휴가 사유</label>
                <input 
                  v-model="vacationDetails.reason"
                  placeholder="휴가 사유를 입력하세요"
                  class="w-full p-4 border-2 border-gray-200 rounded-xl text-base transition-all focus:border-blue-500 focus:shadow-lg bg-gradient-to-br from-white to-gray-50"
                />
              </div>
            </div>
            
            <!-- 다른 약속 정보 -->
            <div v-if="editingStatus === 'other'" class="space-y-6">
              <div>
                <label class="block text-base font-semibold text-gray-900 mb-3">약속 내용</label>
                <input 
                  v-model="otherDetails.description"
                  placeholder="약속 내용을 입력하세요"
                  class="w-full p-4 border-2 border-gray-200 rounded-xl text-base transition-all focus:border-blue-500 focus:shadow-lg bg-gradient-to-br from-white to-gray-50"
                />
              </div>
            </div>
          </div>
          
          <div class="flex justify-end gap-4 p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <button @click="closeStatusModal" class="px-6 py-3 bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-semibold rounded-xl hover:from-gray-200 hover:to-gray-300 hover:-translate-y-0.5 transition-all shadow-lg">
              취소
            </button>
            <button @click="saveStatus" class="px-6 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 transition-all shadow-lg">
              저장
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue';
import { Chart, registerables } from 'chart.js';
// 코드 스플리팅을 위한 비동기 컴포넌트 등록
const GroupCalendar = defineAsyncComponent(() => import('@/components/Features/GroupCalendar.vue'));
const GroupManagement = defineAsyncComponent(() => import('@/components/Features/GroupManagement.vue'));
import { getNearbyRestaurants, getRestaurantsByCategory, getAllRestaurants, getGroup, getUserMonthlyExpenses, getAllUsers, getAllRestaurants as getRestaurantsCount, getUser, getUserGroups, getRestaurantByName } from '@/services/firebaseDBv2.js';
import { getCurrentUser, logout, onAuthStateChange } from '@/services/firebaseAuth.js';
import { DEFAULT_LOCATION, DEFAULT_USER, DEFAULT_GROUP } from '@/config/constants.js';

// Chart.js 등록
Chart.register(...registerables);

export default {
  components: {
    GroupCalendar,
    GroupManagement
  },
  setup() {
    // 상태 관리
    const loading = ref(false);
    const currentUser = ref({
      id: '',
      name: '',
      email: '',
      avatar: null,
      expenses: {
        ticketPoints: 0,
        cash: 0
      },
      location: {
        name: '',
        address: '',
        lat: null,
        lng: null
      }
    });

    // 모달 상태
    const showStatusModal = ref(false);
    const modalData = ref({});
    const editingStatus = ref('');
    const mealDetails = ref({
      restaurant: '',
      menu: '',
      participants: []
    });
    const vacationDetails = ref({
      reason: ''
    });
    const otherDetails = ref({
      description: ''
    });
    const dropdownOpen = ref(false);
    
    const currentGroup = ref(null);
    
    // 개인 지출 데이터 (사용자 데이터에서 가져옴)
    const userExpenses = computed(() => currentUser.value.expenses || {
      ticketPoints: 0,
      cash: 0
    });
    
    // 캘린더용 멤버 데이터 정규화
    const membersForCalendar = computed(() => {
      if (!currentGroup.value?.members) return [];
      
      return currentGroup.value.members.map(member => {
        // 이미 객체 형태인 경우 그대로 반환
        if (typeof member === 'object' && member.id && member.name) {
          return member;
        }
        
        // UID만 있는 경우 기본 객체로 변환
        if (typeof member === 'string') {
          return {
            id: member,
            name: `사용자 ${member.slice(-4)}`, // 임시 이름
            color: `#${Math.floor(Math.random()*16777215).toString(16)}` // 랜덤 색상
          };
        }
        
        // 기타 경우 기본값 반환
        return {
          id: member?.id || 'unknown',
          name: member?.name || '알 수 없음',
          color: member?.color || '#6b7280'
        };
      });
    });

    // 그룹장 여부 확인
    const isGroupAdmin = computed(() => {
      if (!currentUser.value?.id || !currentGroup.value?.admins) return false;
      return currentGroup.value.admins.includes(currentUser.value.id);
    });
    
    // 현재 위치 정보 (사용자 데이터에서 가져옴)
    const currentLocation = computed(() => currentUser.value.location || {
      name: '한진빌딩',
      address: '서울특별시 중구 남대문로 63',
      lat: 37.5665,
      lng: 126.9780
    });
    
    // 플랫폼 통계 (Firebase 데이터 기반)
    const nearbyStats = ref({
      activeUsers: 0,
      totalUsers: 0,
      restaurants: 0,
      groups: 0
    });
    
    // 음식점 관련 - Firebase에서 가져오기
    const restaurants = ref([]);
    
    // 음식점 데이터 로드
    const loadRestaurants = async () => {
      try {
        loading.value = true;
        console.log('음식점 데이터 로드 시작...');
        
        // 간단한 방법으로 모든 음식점 가져오기
        const restaurantData = await getAllRestaurants(50);
        restaurants.value = restaurantData;
        console.log('음식점 데이터 로드 완료:', restaurantData.length, '개');
        
        // 데이터 확인을 위한 로그
        if (restaurantData.length > 0) {
          console.log('첫 번째 음식점:', restaurantData[0]);
        }
      } catch (error) {
        console.error('음식점 데이터 로드 실패:', error);
        restaurants.value = [];
      } finally {
        loading.value = false;
      }
    };

    // 인증된 사용자 데이터 로드 (onAuthStateChange에서 호출)
    const loadUserDataFromAuth = async (authUser) => {
      try {
        console.log('인증된 사용자 데이터 로드 시작:', authUser.email);
        console.log('사용자 UID:', authUser.uid);
        
        // Firestore에서 사용자 정보 가져오기 (UID로 직접 검색)
        const userData = await getUser(authUser.uid);
        console.log('Firestore 사용자 데이터:', userData);
        
        if (userData) {
          currentUser.value = {
            id: userData.id,
            name: userData.name || '사용자',
            email: userData.email,
            avatar: userData.avatar,
            expenses: userData.expenses || {
              ticketPoints: 0,
              cash: 0
            },
            location: userData.location || {
              name: '한진빌딩',
              address: '서울특별시 중구 남대문로 63',
              lat: 37.5665,
              lng: 126.9780
            }
          };
          console.log('Firestore 데이터로 사용자 설정 완료:', currentUser.value);
        } else {
          // Firestore에 사용자 데이터가 없는 경우 기본값 사용
          currentUser.value = {
            ...DEFAULT_USER,
            id: authUser.uid,
            name: authUser.displayName || DEFAULT_USER.name,
            email: authUser.email,
            avatar: authUser.photoURL
          };
          console.log('기본값으로 사용자 설정 완료:', currentUser.value);
        }
        console.log('사용자 데이터 로드 완료:', currentUser.value.name);
        
        // 이번달 지출액 로드
        await loadMonthlyExpenses();
      } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
        console.error('오류 상세:', error.message);
        currentUser.value = null;
      }
    };

    // 사용자 데이터 로드 (기존 함수, 초기 로드용)
    const loadUserData = async () => {
      try {
        const authUser = getCurrentUser();
        console.log('현재 사용자:', authUser);
        
        if (authUser) {
          console.log('Firebase 인증 사용자:', authUser.email);
          await loadUserDataFromAuth(authUser);
        } else {
          console.log('로그인되지 않은 상태입니다.');
          // 로그인하지 않은 경우 Auth 페이지로 리다이렉트
          window.location.href = '/auth';
          return;
        }
      } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
      }
    };

    // 이번달 지출액 로드 (실제 Firebase 데이터 사용)
    const loadMonthlyExpenses = async () => {
      try {
        if (currentUser.value.id && currentUser.value.id !== 'guest') {
          console.log('이번달 지출액 로드 시작...');
          
          // Firebase에서 실제 월별 지출 데이터 가져오기
          const expenses = await getUserMonthlyExpenses(currentUser.value.id);
          
          if (expenses) {
            currentUser.value.expenses = {
              ticketPoints: expenses.ticketPoints || 0,
              cash: expenses.cash || 0,
              total: (expenses.ticketPoints || 0) + (expenses.cash || 0)
            };
          } else {
            // 데이터가 없는 경우 기본값 설정
            currentUser.value.expenses = {
              ticketPoints: 0,
              cash: 0,
              total: 0
            };
          }
          
          console.log('이번달 지출액 로드 완료:', currentUser.value.expenses);
        }
      } catch (error) {
        console.error('이번달 지출액 로드 실패:', error);
        // 오류 시 기본값 설정
        currentUser.value.expenses = {
          ticketPoints: 0,
          cash: 0,
          total: 0
        };
      }
    };

    // 월별 지출 데이터 로드 (그래프용)
    const loadMonthlyExpenseData = async () => {
      try {
        if (currentUser.value.id && currentUser.value.id !== 'guest') {
          console.log('월별 지출 데이터 로드 시작...');
          
          // 최근 6개월 데이터 가져오기
          const currentDate = new Date();
          const months = [];
          
          for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            months.push(date);
          }
          
          // 각 월별 데이터 수집
          const monthlyData = await Promise.all(
            months.map(async (month) => {
              try {
                const expenses = await getUserMonthlyExpenses(
                  currentUser.value.id, 
                  month.getFullYear(), 
                  month.getMonth() + 1
                );
                return {
                  month: month.getMonth(),
                  ticketPoints: expenses?.ticketPoints || 0,
                  cash: expenses?.cash || 0
                };
              } catch (error) {
                console.error(`월별 데이터 로드 실패 (${month.getFullYear()}-${month.getMonth() + 1}):`, error);
                return {
                  month: month.getMonth(),
                  ticketPoints: 0,
                  cash: 0
                };
              }
            })
          );
          
          // 데이터 정리
          monthlyExpenseData.value.personal = {
            ticketPoints: monthlyData.map(d => d.ticketPoints),
            cash: monthlyData.map(d => d.cash)
          };
          
          // 그룹 멤버들의 월별 지출 데이터도 로드
          if (currentGroup.value?.members && currentGroup.value.members.length > 0) {
            await loadGroupMonthlyExpenseData();
          }
          
          console.log('월별 지출 데이터 로드 완료:', monthlyExpenseData.value.personal);
        }
      } catch (error) {
        console.error('월별 지출 데이터 로드 실패:', error);
      }
    };

    // 그룹 멤버들의 월별 지출 데이터 로드
    const loadGroupMonthlyExpenseData = async () => {
      try {
        if (!currentGroup.value?.members || currentGroup.value.members.length === 0) {
          monthlyExpenseData.value.group = {};
          return;
        }

        console.log('그룹 월별 지출 데이터 로드 시작...');
        
        // 최근 6개월 데이터 가져오기
        const currentDate = new Date();
        const months = [];
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          months.push(date);
        }

        // 각 멤버별로 월별 데이터 수집
        const groupData = {};
        
        for (const memberId of currentGroup.value.members) {
          try {
            // 멤버 정보 가져오기
            const memberData = await getUser(memberId);
            const memberName = memberData?.name || `사용자 ${memberId.slice(-4)}`;
            
            // 각 월별 데이터 수집
            const monthlyData = await Promise.all(
              months.map(async (month) => {
                try {
                  const expenses = await getUserMonthlyExpenses(
                    memberId, 
                    month.getFullYear(), 
                    month.getMonth() + 1
                  );
                  return {
                    month: month.getMonth(),
                    ticketPoints: expenses?.ticketPoints || 0,
                    cash: expenses?.cash || 0
                  };
                } catch (error) {
                  console.error(`멤버 ${memberName} 월별 데이터 로드 실패 (${month.getFullYear()}-${month.getMonth() + 1}):`, error);
                  return {
                    month: month.getMonth(),
                    ticketPoints: 0,
                    cash: 0
                  };
                }
              })
            );
            
            groupData[memberName] = {
              ticketPoints: monthlyData.map(d => d.ticketPoints),
              cash: monthlyData.map(d => d.cash)
            };
          } catch (error) {
            console.error(`멤버 ${memberId} 정보 로드 실패:`, error);
            const memberName = `사용자 ${memberId.slice(-4)}`;
            groupData[memberName] = {
              ticketPoints: [0, 0, 0, 0, 0, 0],
              cash: [0, 0, 0, 0, 0, 0]
            };
          }
        }
        
        monthlyExpenseData.value.group = groupData;
        console.log('그룹 월별 지출 데이터 로드 완료:', groupData);
      } catch (error) {
        console.error('그룹 월별 지출 데이터 로드 실패:', error);
        monthlyExpenseData.value.group = {};
      }
    };

    // 통계 데이터 로드
    const loadStatsData = async () => {
      try {
        console.log('통계 데이터 로드 시작...');
        
        // 전체 사용자 수 로드
        const users = await getAllUsers();
        
        // 음식점 수 로드
        const restaurants = await getRestaurantsCount(1000); // 충분히 큰 수로 제한
        
        // 통계 데이터 업데이트
        nearbyStats.value.activeUsers = users.length; // 전체 등록자 수
        nearbyStats.value.totalUsers = users.length;
        nearbyStats.value.restaurants = restaurants.length;
        nearbyStats.value.groups = 1; // 현재 DT 4인방 그룹만 있음
        
        console.log('통계 데이터 로드 완료:', nearbyStats.value);
      } catch (error) {
        console.error('통계 데이터 로드 실패:', error);
        // 오류 시 기본값 설정
        nearbyStats.value.activeUsers = 0;
        nearbyStats.value.totalUsers = 0;
        nearbyStats.value.restaurants = 0;
        nearbyStats.value.groups = 0;
      }
    };

    // 그룹 데이터 로드
    const loadGroupData = async () => {
      try {
        console.log('그룹 데이터 로드 시작...');
        console.log('현재 사용자 ID:', currentUser.value?.id);
        
        if (!currentUser.value?.id) {
          console.log('사용자 ID가 없어서 그룹 데이터를 로드할 수 없습니다.');
          currentGroup.value = null;
          return;
        }
        
        // 사용자의 그룹 목록에서 첫 번째 그룹 가져오기
        const userGroups = await getUserGroups(currentUser.value.id);
        console.log('사용자 그룹 목록:', userGroups);
        
        if (userGroups && userGroups.length > 0) {
          const group = userGroups[0]; // 첫 번째 그룹 사용
          currentGroup.value = group;
          console.log('그룹 데이터 로드 완료:', group.name, '멤버 수:', group.members?.length || 0);
        } else {
          console.log('사용자가 속한 그룹이 없습니다.');
          currentGroup.value = null;
        }
      } catch (error) {
        console.error('그룹 데이터 로드 실패:', error);
        console.error('오류 상세:', error.message);
        currentGroup.value = null;
      }
    };

    // 로그아웃 핸들러
    const handleLogout = async () => {
      try {
        await logout();
        console.log('로그아웃 완료');
        // /auth 페이지로 리다이렉트
        window.location.href = '/auth';
      } catch (error) {
        console.error('로그아웃 실패:', error);
      }
    };
    
    const selectedRestaurant = ref(null);
    const searchQuery = ref('');
    const selectedCategory = ref('all');
    
    // 그래프 관련
    const selectedChartType = ref('personal');
    const expenseChart = ref(null);
    const monthlyExpenseData = ref({
      personal: {
        ticketPoints: [0, 0, 0, 0, 0, 0],
        cash: [0, 0, 0, 0, 0, 0]
      },
      group: {}
    });
    
    // 제안 관련
    const selectedDateForProposal = ref(null);
    
    // 음식 카테고리 (실제 음식점 데이터 기반)
    const foodCategories = ref([
      { id: 'all', name: '전체', icon: '🍽' },
      { id: 'korean', name: '한식', icon: '🍚' },
      { id: 'japanese', name: '일식', icon: '🍣' },
      { id: 'western', name: '양식', icon: '🍝' },
      { id: 'chinese', name: '중식', icon: '🥢' },
      { id: 'fastfood', name: '패스트푸드', icon: '🍔' }
    ]);

    // 카테고리 한글 변환 함수
    const getCategoryName = (category) => {
      const categoryMap = {
        'korean': '한식',
        'japanese': '일식',
        'western': '양식',
        'chinese': '중식',
        'fastfood': '패스트푸드'
      };
      return categoryMap[category] || category;
    };
    
    // 모달 상태
    const showAddEventModal = ref(false);
    const showGroupModal = ref(false);
    const showRestaurantModal = ref(false);
    const selectedRestaurantDetail = ref(null);
    const newEvent = ref({
      title: '',
      date: '',
      time: '12:00',
      description: ''
    });
    
    // 계산된 속성
    const filteredRestaurants = computed(() => {
      let filtered = restaurants.value;
      
      // 검색어 필터
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(restaurant => 
          restaurant.name.toLowerCase().includes(query) ||
          restaurant.category.toLowerCase().includes(query)
        );
      }
      
      // 카테고리 필터
      if (selectedCategory.value !== 'all') {
        filtered = filtered.filter(restaurant => restaurant.category === selectedCategory.value);
      }
      
      return filtered;
    });
    
    // 메서드들
    const openAddEventModal = () => {
      showAddEventModal.value = true;
    };
    
    const closeAddEventModal = () => {
      showAddEventModal.value = false;
      newEvent.value = {
        title: '',
        date: '',
        time: '12:00',
        description: ''
      };
    };
    
    const addEvent = () => {
      console.log('일정 추가:', newEvent.value);
      closeAddEventModal();
    };
    
    const openGroupManagement = () => {
      showGroupModal.value = true;
    };
    
    const closeGroupModal = () => {
      showGroupModal.value = false;
    };
    
    const handleGroupUpdated = (group) => {
      currentGroup.value = group;
      console.log('그룹 업데이트됨:', group);
    };
    
    const refreshRecommendations = async () => {
      console.log('음식점 새로고침');
      await loadRestaurants();
    };
    
    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            currentLocation.value = {
              name: '현재 위치',
              address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
              lat,
              lng
            };
          },
          (error) => {
            console.error('위치 정보를 가져올 수 없습니다:', error);
            alert('위치 정보에 접근할 수 없습니다.');
          }
        );
      } else {
        alert('이 브라우저는 위치 정보를 지원하지 않습니다.');
      }
    };
    
    const searchRestaurants = () => {
      console.log('음식점 검색:', searchQuery.value);
    };
    
    const selectCategory = (categoryId) => {
      selectedCategory.value = categoryId;
    };
    
    const selectRestaurant = (restaurant) => {
      selectedRestaurant.value = restaurant;
    };
    
    const viewDetails = async (restaurant) => {
      try {
        // 레스토랑 이름으로 상세(특히 menus, id)를 우선 보강
        const dbRestaurant = await getRestaurantByName(restaurant.name);
        if (dbRestaurant) {
          selectedRestaurantDetail.value = {
            ...restaurant,
            id: dbRestaurant.id,
            menus: dbRestaurant.menus || dbRestaurant.menu || []
          };
        } else {
          selectedRestaurantDetail.value = restaurant;
        }
      } catch (e) {
        console.warn('레스토랑 상세 조회 실패, 전달값으로 표시:', e);
        selectedRestaurantDetail.value = restaurant;
      }
      showRestaurantModal.value = true;
    };
    
    const closeRestaurantModal = () => {
      showRestaurantModal.value = false;
      selectedRestaurantDetail.value = null;
    };
    
    const selectRestaurantForLunch = (restaurant) => {
      console.log('음식점 선택:', restaurant);
      
      // 선택된 날짜가 있으면 그 날짜로, 없으면 오늘 날짜로 제안 생성
      const selectedDate = selectedDateForProposal.value || new Date();
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      const proposal = {
        id: `proposal_${Date.now()}`,
        restaurant: restaurant,
        proposer: currentUser.value,
        date: dateStr,
        status: 'pending', // pending, accepted, rejected
        votes: {
          accepted: [currentUser.value.id], // 제안자는 자동으로 수락
          rejected: []
        },
        createdAt: new Date()
      };
      
      // 제안을 그룹에 추가 (실제로는 Firebase에 저장)
      if (!currentGroup.value.proposals) {
        currentGroup.value.proposals = [];
      }
      currentGroup.value.proposals.push(proposal);
      
      console.log('제안 생성됨:', proposal);
      closeRestaurantModal();
    };
    
    const selectForLunch = (restaurant) => {
      console.log('점심 선택:', restaurant);
    };
    
    const handleDateSelected = (date) => {
      selectedDateForProposal.value = new Date(date);
      console.log('선택된 날짜:', date);
    };
    
    // 그래프 관련 메서드들
    const selectChartType = (type) => {
      selectedChartType.value = type;
      drawChart();
    };
    
    const refreshChart = () => {
      console.log('그래프 새로고침');
      drawChart();
    };
    
    const drawChart = () => {
      if (!expenseChart.value) return;
      
      // 기존 차트 인스턴스 제거
      if (window.chartInstance) {
        window.chartInstance.destroy();
      }
      
      const ctx = expenseChart.value.getContext('2d');
      
      if (selectedChartType.value === 'personal') {
        // 개인 소비 - 꺾은선 그래프 (실제 데이터 사용)
        const data = monthlyExpenseData.value.personal;
        window.chartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
            datasets: [
              {
                label: '식권포인트',
                data: data.ticketPoints,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
              },
              {
                label: '현금',
                data: data.cash,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: '개인 소비 분석',
                font: { size: 16, weight: 'bold' }
              },
              legend: {
                position: 'top',
                labels: { usePointStyle: true, padding: 20 }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return value.toLocaleString() + '원';
                  }
                }
              }
            }
          }
        });
      } else {
        // 그룹 소비 - 막대 그래프 (멤버 이름을 x축, 각 멤버별 합계 금액)
        const groupData = monthlyExpenseData.value.group;
        
        if (groupData && Object.keys(groupData).length > 0) {
          const memberNames = Object.keys(groupData);
          
          // 각 멤버별 6개월 합계 계산
          const sumArray = (arr) => (arr || []).reduce((acc, v) => acc + (Number(v) || 0), 0);
          const ticketTotals = memberNames.map(name => sumArray(groupData[name]?.ticketPoints));
          const cashTotals = memberNames.map(name => sumArray(groupData[name]?.cash));
          
          window.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: memberNames,
              datasets: [
                {
                  label: '식권포인트',
                  data: ticketTotals,
                  backgroundColor: 'rgba(59, 130, 246, 0.6)',
                  borderColor: '#3b82f6',
                  borderWidth: 1,
                  borderRadius: 4
                },
                {
                  label: '현금',
                  data: cashTotals,
                  backgroundColor: 'rgba(16, 185, 129, 0.6)',
                  borderColor: '#10b981',
                  borderWidth: 1,
                  borderRadius: 4
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: '그룹 소비 분석',
                  font: { size: 16, weight: 'bold' }
                },
                legend: {
                  position: 'top',
                  labels: { usePointStyle: true, padding: 15 }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return value.toLocaleString() + '원';
                    }
                  }
                },
                x: {
                  ticks: { maxRotation: 45, minRotation: 0 }
                }
              }
            }
          });
        }
      }
    };
    
    // 인증 상태 감지
    const setupAuthListener = () => {
      const unsubscribe = onAuthStateChange(async (user) => {
        console.log('인증 상태 변경 감지:', user ? user.email : '로그아웃');
        if (user) {
          console.log('사용자 로그인 상태 감지:', user.email);
          // 사용자 데이터 로드
          await loadUserDataFromAuth(user);
          await loadGroupData();
          await loadRestaurants();
          await loadStatsData();
          await loadMonthlyExpenseData();
          setTimeout(() => {
            drawChart();
          }, 100);
        } else {
          console.log('사용자 로그아웃 상태 감지');
          // 로그아웃 상태로 설정
          currentUser.value = null;
          currentGroup.value = null;
          window.location.href = '/auth';
        }
      });
      
      // 컴포넌트 언마운트 시 리스너 정리
      return unsubscribe;
    };

    // 인증 상태 리스너 정리를 위한 변수
    let authUnsubscribe = null;

    // 컴포넌트 마운트 시 데이터 로드 및 그래프 초기화
    onMounted(async () => {
      // 인증 상태 감지 설정
      authUnsubscribe = setupAuthListener();
      
      // 초기 로드 (인증 상태 감지가 처리함)
      const authUser = getCurrentUser();
      if (authUser) {
        console.log('초기 로드 - 인증된 사용자:', authUser.email);
        await loadUserDataFromAuth(authUser);
        await loadGroupData();
        await loadRestaurants();
        await loadStatsData();
        await loadMonthlyExpenseData();
        setTimeout(() => {
          drawChart();
        }, 100);
      } else {
        console.log('초기 로드 - 인증되지 않은 사용자');
      }
    });

    // 컴포넌트 언마운트 시 리스너 정리
    // 모달 관련 함수들
    const statusOptions = [
      { value: '', label: '미정', icon: '❔' },
      { value: 'available', label: '가능', icon: '✅' },
      { value: 'vacation', label: '휴가(불가능)', icon: '🏖️' },
      { value: 'other', label: '다른 약속(불가능)', icon: '📅' },
      { value: 'solo', label: '혼밥 예정(불가능)', icon: '🍱' },
      { value: 'skip', label: '밥 스킵(불가능)', icon: '⏭️' }
    ];

    const openStatusModal = (data) => {
      modalData.value = data;
      editingStatus.value = data.currentStatus;
      showStatusModal.value = true;
      
      // 상태별 기존 데이터 로드
      const existingStatus = data.memberStatuses[data.date]?.[data.member.id];
      if (existingStatus) {
        if (existingStatus.status === 'available') {
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

    const closeStatusModal = () => {
      showStatusModal.value = false;
      modalData.value = {};
      editingStatus.value = '';
    };

    const saveStatus = async () => {
      // 여기서 실제 저장 로직 구현
      console.log('상태 저장:', {
        member: modalData.value.member,
        date: modalData.value.date,
        status: editingStatus.value,
        details: getStatusDetails()
      });
      
      closeStatusModal();
    };

    const getStatusDetails = () => {
      if (editingStatus.value === 'available') {
        return {
          restaurant: mealDetails.value.restaurant,
          menu: mealDetails.value.menu,
          participants: mealDetails.value.participants
        };
      } else if (editingStatus.value === 'vacation') {
        return {
          reason: vacationDetails.value.reason
        };
      } else if (editingStatus.value === 'other') {
        return {
          description: otherDetails.value.description
        };
      }
      return {};
    };

    const getMemberStatusClass = (date, memberId) => {
      const memberStatus = modalData.value.memberStatuses?.[date]?.[memberId]?.status;
      return {
        'status-available': memberStatus === 'available',
        'status-vacation': memberStatus === 'vacation',
        'status-other': memberStatus === 'other',
        'status-solo': memberStatus === 'solo',
        'status-skip': memberStatus === 'skip'
      };
    };

    const getMemberStatusText = (date, memberId) => {
      const memberStatus = modalData.value.memberStatuses?.[date]?.[memberId]?.status;
      const statusTexts = {
        'available': '가능',
        'vacation': '휴가',
        'other': '다른 약속',
        'solo': '혼밥 예정',
        'skip': '밥 스킵'
      };
      return statusTexts[memberStatus] || '미정';
    };

    const handleStatusUpdated = () => {
      console.log('상태 업데이트됨');
    };

    onUnmounted(() => {
      if (authUnsubscribe) {
        authUnsubscribe();
      }
    });
    
    return {
      loading,
      currentUser,
      currentGroup,
      userExpenses,
      membersForCalendar,
      isGroupAdmin,
      currentLocation,
      nearbyStats,
      restaurants,
      selectedRestaurant,
      searchQuery,
      selectedCategory,
      foodCategories,
      showAddEventModal,
      showGroupModal,
      showRestaurantModal,
      selectedRestaurantDetail,
      newEvent,
      filteredRestaurants,
      selectedChartType,
      expenseChart,
      monthlyExpenseData,
      selectedDateForProposal,
      openAddEventModal,
      closeAddEventModal,
      addEvent,
      openGroupManagement,
      closeGroupModal,
      handleGroupUpdated,
      refreshRecommendations,
      updateLocation,
      searchRestaurants,
      selectCategory,
      selectRestaurant,
      viewDetails,
      closeRestaurantModal,
      selectRestaurantForLunch,
      selectForLunch,
      handleDateSelected,
      selectChartType,
      refreshChart,
      drawChart,
      loadRestaurants,
      loadUserData,
      loadUserDataFromAuth,
      loadGroupData,
      loadMonthlyExpenses,
      loadMonthlyExpenseData,
      loadGroupMonthlyExpenseData,
      loadStatsData,
      handleLogout,
      getCategoryName,
      // 모달 관련
      showStatusModal,
      modalData,
      editingStatus,
      mealDetails,
      vacationDetails,
      otherDetails,
      dropdownOpen,
      statusOptions,
      openStatusModal,
      closeStatusModal,
      saveStatus,
      getMemberStatusClass,
      getMemberStatusText,
      handleStatusUpdated
    };
  }
};
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Noto Sans KR', sans-serif;
  overflow-x: hidden;
}

/* 헤더 */
.app-header {
  background: linear-gradient(135deg, #ff6b6b, #ffa726);
  color: white;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(255, 107, 107, 0.3);
  border-radius: 0 0 2rem 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 0;
}

.header-left h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.header-left p {
  font-size: 1.1rem;
  opacity: 0.95;
  margin: 0;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.expense-info {
  display: flex;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.expense-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.expense-icon {
  font-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
}

.expense-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.expense-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.expense-amount {
  font-size: 1.1rem;
  color: white;
  font-weight: 700;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.default-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-name {
  font-weight: 600;
  font-size: 1.1rem;
}

.group-btn {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 1.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
}

.group-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.logout-btn {
  background: rgba(239, 68, 68, 0.8);
  color: white;
  border: 2px solid rgba(239, 68, 68, 0.9);
  border-radius: 1.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
}

/* 메인 컨텐츠 */
.main-content {
  padding: 2rem;
  box-sizing: border-box;
  width: 100%;
  margin: 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 60% 40%;
  gap: 2rem;
  height: calc(100vh - 12rem);
  width: 100%;
}

/* 섹션 공통 스타일 */
.calendar-section,
.restaurant-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid rgba(255, 107, 107, 0.2);
}

.section-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.add-event-btn,
.refresh-btn {
  background: linear-gradient(135deg, #ff6b6b, #ffa726);
  color: white;
  border: none;
  border-radius: 1rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.add-event-btn:hover,
.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

/* 위치 정보 카드 */
.location-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 107, 107, 0.2);
}

.location-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.location-icon {
  font-size: 1.5rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff6b6b, #ffa726);
  border-radius: 50%;
  color: white;
}

.location-details h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.25rem 0;
}

.location-details p {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0;
}

.location-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.location-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.distance-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 107, 107, 0.1);
}

.stat-icon {
  font-size: 1.2rem;
}

.stat-text {
  font-size: 0.875rem;
  color: #4a5568;
  font-weight: 500;
}

/* 필터 섹션 */
.filter-section {
  margin-bottom: 1.5rem;
}

.search-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid rgba(255, 107, 107, 0.2);
  border-radius: 0.75rem;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.search-btn {
  background: linear-gradient(135deg, #ff6b6b, #ffa726);
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-tab {
  background: rgba(255, 255, 255, 0.8);
  color: #6c757d;
  border: 2px solid rgba(255, 107, 107, 0.2);
  border-radius: 1rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-tab:hover {
  background: rgba(255, 107, 107, 0.1);
  border-color: #ff6b6b;
}

.filter-tab.active {
  background: linear-gradient(135deg, #ff6b6b, #ffa726);
  color: white;
  border-color: #ff6b6b;
}

/* 음식점 목록 */
.restaurants-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
  padding-right: 0.5rem;
}

.restaurant-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1rem;
  border: 2px solid rgba(255, 107, 107, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.restaurant-item:hover {
  background: rgba(255, 107, 107, 0.05);
  border-color: #ff6b6b;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2);
}

.restaurant-item.selected {
  background: rgba(255, 107, 107, 0.1);
  border-color: #ff6b6b;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.restaurant-image {
  width: 4rem;
  height: 4rem;
  border-radius: 0.75rem;
  overflow: hidden;
  flex-shrink: 0;
}

.restaurant-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.restaurant-info {
  flex: 1;
}

.restaurant-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.25rem 0;
}

.restaurant-category {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0 0 0.5rem 0;
}

.restaurant-details {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #4a5568;
}

.restaurant-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.action-btn.primary {
  background: linear-gradient(135deg, #ff6b6b, #ffa726);
  color: white;
  border: none;
}

.action-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
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

.modal-content.large {
  max-width: 800px;
}

.modal-content.restaurant-detail {
  max-width: 600px;
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
  color: #2d3748;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.25rem;
}

.close-btn:hover {
  color: #4a5568;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.9rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-secondary {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b6b, #ffa726);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

/* 소비금액 그래프 섹션 */
.expense-chart-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1.5rem;
  padding: 2rem;
  margin-top: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.chart-controls {
  display: flex;
  gap: 1rem;
}

.chart-btn {
  background: linear-gradient(135deg, #ff6b6b, #ffa726);
  color: white;
  border: none;
  border-radius: 1rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.chart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

.chart-container {
  margin-top: 2rem;
}

.chart-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.chart-tab {
  background: rgba(255, 255, 255, 0.8);
  color: #6c757d;
  border: 2px solid rgba(255, 107, 107, 0.2);
  border-radius: 1rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chart-tab:hover {
  background: rgba(255, 107, 107, 0.1);
  border-color: #ff6b6b;
}

.chart-tab.active {
  background: linear-gradient(135deg, #ff6b6b, #ffa726);
  color: white;
  border-color: #ff6b6b;
}

.chart-content {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(255, 107, 107, 0.1);
}

.chart-legend {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: #4a5568;
}

.legend-color {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
}

.legend-color.ticket {
  background-color: #ff6b6b;
}

.legend-color.cash {
  background-color: #4ecdc4;
}

.chart-area {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.chart-area canvas {
  max-width: 100%;
  height: auto;
}

/* 음식점 상세보기 모달 */
.restaurant-detail-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.restaurant-info-section {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.restaurant-image-large {
  width: 200px;
  height: 150px;
  border-radius: 0.75rem;
  overflow: hidden;
  flex-shrink: 0;
}

.restaurant-image-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.restaurant-basic-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.restaurant-category {
  font-size: 0.9rem;
  color: #6c757d;
  background: #f8f9fa;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  display: inline-block;
  width: fit-content;
}

.restaurant-rating {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ff6b6b;
}

.restaurant-distance {
  font-size: 1rem;
  color: #4a5568;
}

.menu-section h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: #e9ecef;
  border-color: #ff6b6b;
}

.menu-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.menu-name {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
}

.menu-description {
  font-size: 0.875rem;
  color: #6c757d;
}

.menu-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ff6b6b;
}

.restaurant-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

/* 반응형 디자인 */
@media (max-width: 48rem) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    height: auto;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
  
  .header-right {
    flex-direction: column;
    gap: 1rem;
  }
  
  .expense-info {
    flex-direction: column;
    gap: 1rem;
  }
  
  .distance-stats {
    grid-template-columns: 1fr;
  }
  
  .location-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .location-btn {
    margin-left: 0;
  }
  
  .filter-tabs {
    justify-content: center;
  }
  
  .restaurant-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .restaurant-actions {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 37.5rem) {
  .main-content {
    padding: 0.5rem;
  }
  
  .calendar-section,
  .restaurant-section {
    padding: 1rem;
  }
}
</style>
