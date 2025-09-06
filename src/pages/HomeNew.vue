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
          <!-- 개인 지출 정보 -->
          <div class="expense-info">
            <div class="expense-item">
              <div class="expense-icon">🎫</div>
              <div class="expense-details">
                <span class="expense-label">식권포인트</span>
                <span class="expense-amount">{{ userExpenses.ticketPoints.toLocaleString() }}P</span>
              </div>
            </div>
            <div class="expense-item">
              <div class="expense-icon">💵</div>
              <div class="expense-details">
                <span class="expense-label">현금</span>
                <span class="expense-amount">{{ userExpenses.cash.toLocaleString() }}원</span>
              </div>
            </div>
          </div>
          
          <div class="user-info">
            <img 
              :src="currentUser.avatar || '/api/placeholder/40/40'" 
              :alt="currentUser.name"
              class="user-avatar"
            />
            <span class="user-name">{{ currentUser.name }}</span>
          </div>
          
          <button class="group-btn" @click="openGroupManagement">
            <i class="icon-users">👥</i>
            그룹 관리
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
            :groupId="currentGroup?.id"
            :members="currentGroup?.members || []"
            @date-selected="handleDateSelected"
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
            
            <!-- 거리별 통계 -->
            <div class="distance-stats">
              <div class="stat-item">
                <span class="stat-icon">🚶</span>
                <span class="stat-text">도보 5분: {{ nearbyStats.walking5min }}개</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">🚶</span>
                <span class="stat-text">도보 10분: {{ nearbyStats.walking10min }}개</span>
              </div>
              <div class="stat-item">
                <span class="stat-icon">🚗</span>
                <span class="stat-text">차량 5분: {{ nearbyStats.driving5min }}개</span>
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
                <p class="restaurant-category">{{ restaurant.category }}</p>
                <div class="restaurant-details">
                  <span class="distance">🚶 {{ restaurant.distance }}분</span>
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
                  v-for="menu in selectedRestaurantDetail.menu" 
                  :key="menu.id"
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
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import GroupCalendar from '@/components/Features/GroupCalendar.vue';
import GroupManagement from '@/components/Features/GroupManagement.vue';

// Chart.js 등록
Chart.register(...registerables);

export default {
  name: 'HomeNew',
  components: {
    GroupCalendar,
    GroupManagement
  },
  setup() {
    // 상태 관리
    const loading = ref(false);
    const currentUser = ref({
      id: 'user1',
      name: '홍길동',
      email: 'hong@example.com',
      avatar: null
    });
    
    const currentGroup = ref({
      id: 'group1',
      name: '개발팀',
      members: [
        { id: 'user1', name: '김철수', color: '#ff6b6b' },
        { id: 'user2', name: '이영희', color: '#4ecdc4' },
        { id: 'user3', name: '박민수', color: '#45b7d1' },
        { id: 'user4', name: '정수진', color: '#96ceb4' }
      ]
    });
    
    // 개인 지출 데이터
    const userExpenses = ref({
      ticketPoints: 15000,
      cash: 25000
    });
    
    // 현재 위치 정보
    const currentLocation = ref({
      name: '한진빌딩',
      address: '서울특별시 중구 남대문로 63',
      lat: 37.5665,
      lng: 126.9780
    });
    
    // 거리별 통계 (실제 음식점 데이터 기반)
    const nearbyStats = computed(() => {
      const walking5min = restaurants.value.filter(r => r.distance <= 5).length;
      const walking10min = restaurants.value.filter(r => r.distance <= 10).length;
      const driving5min = restaurants.value.filter(r => r.distance <= 5).length; // 차량 5분은 도보 5분과 동일
      
      return {
        walking5min,
        walking10min,
        driving5min
      };
    });
    
    // 음식점 관련
    const restaurants = ref([
      {
        id: 1,
        name: '금성관',
        category: '한식',
        distance: 3,
        rating: 4.2,
        priceRange: '8,000원',
        image: '/api/placeholder/80/80',
        menu: [
          { id: 1, name: '김치찌개', description: '얼큰한 김치찌개', price: 8000 },
          { id: 2, name: '된장찌개', description: '구수한 된장찌개', price: 7000 },
          { id: 3, name: '제육볶음', description: '달콤짭짤한 제육볶음', price: 12000 },
          { id: 4, name: '불고기', description: '양념 불고기', price: 15000 }
        ]
      },
      {
        id: 2,
        name: '리원',
        category: '중식',
        distance: 5,
        rating: 4.1,
        priceRange: '7,000원',
        image: '/api/placeholder/80/80',
        menu: [
          { id: 1, name: '짜장면', description: '진한 춘장 소스', price: 7000 },
          { id: 2, name: '짬뽕', description: '해물이 가득한 짬뽕', price: 8000 },
          { id: 3, name: '탕수육', description: '바삭한 탕수육', price: 15000 },
          { id: 4, name: '볶음밥', description: '새콤달콤한 볶음밥', price: 6000 }
        ]
      },
      {
        id: 28,
        name: '일품향',
        category: '중식',
        distance: 6,
        rating: 4.0,
        priceRange: '8,500원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 3,
        name: '신의주부대찌개',
        category: '한식',
        distance: 4,
        rating: 4.3,
        priceRange: '9,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 4,
        name: '바스버거',
        category: '패스트푸드',
        distance: 2,
        rating: 4.0,
        priceRange: '6,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 5,
        name: '맘스터치',
        category: '패스트푸드',
        distance: 3,
        rating: 3.9,
        priceRange: '5,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 6,
        name: '롯데리아',
        category: '패스트푸드',
        distance: 4,
        rating: 3.8,
        priceRange: '5,500원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 7,
        name: '태진옥',
        category: '한식',
        distance: 6,
        rating: 4.4,
        priceRange: '8,500원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 8,
        name: '돈우가',
        category: '일식',
        distance: 7,
        rating: 4.2,
        priceRange: '12,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 9,
        name: '이가네양꼬치',
        category: '중식',
        distance: 8,
        rating: 4.1,
        priceRange: '15,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 10,
        name: '분지로',
        category: '일식',
        distance: 5,
        rating: 4.3,
        priceRange: '11,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 11,
        name: '밀피유',
        category: '양식',
        distance: 9,
        rating: 4.5,
        priceRange: '18,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 12,
        name: '은앤정닭갈비',
        category: '한식',
        distance: 6,
        rating: 4.2,
        priceRange: '13,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 13,
        name: '보노보스햄버거',
        category: '패스트푸드',
        distance: 4,
        rating: 4.0,
        priceRange: '7,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 14,
        name: '미쓰족발',
        category: '한식',
        distance: 8,
        rating: 4.3,
        priceRange: '25,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 15,
        name: '대한곱창',
        category: '한식',
        distance: 7,
        rating: 4.1,
        priceRange: '20,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 16,
        name: '월가갈비',
        category: '한식',
        distance: 10,
        rating: 4.4,
        priceRange: '30,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 17,
        name: '창고43',
        category: '양식',
        distance: 12,
        rating: 4.2,
        priceRange: '22,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 18,
        name: 'KFC',
        category: '패스트푸드',
        distance: 3,
        rating: 3.9,
        priceRange: '6,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 19,
        name: '26층 구내식당',
        category: '한식',
        distance: 1,
        rating: 3.8,
        priceRange: '4,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 20,
        name: '정신라멘',
        category: '일식',
        distance: 6,
        rating: 4.3,
        priceRange: '9,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 21,
        name: '멘무샤',
        category: '일식',
        distance: 8,
        rating: 4.1,
        priceRange: '10,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 22,
        name: '콜리그',
        category: '양식',
        distance: 7,
        rating: 4.0,
        priceRange: '16,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 23,
        name: '행복한소바',
        category: '일식',
        distance: 5,
        rating: 4.2,
        priceRange: '8,500원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 24,
        name: '청진동해장국',
        category: '한식',
        distance: 9,
        rating: 4.3,
        priceRange: '7,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 25,
        name: '박씨화로구이',
        category: '한식',
        distance: 11,
        rating: 4.4,
        priceRange: '28,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 26,
        name: '우대포블랙',
        category: '양식',
        distance: 13,
        rating: 4.5,
        priceRange: '35,000원',
        image: '/api/placeholder/80/80'
      },
      {
        id: 27,
        name: '풍닭',
        category: '한식',
        distance: 6,
        rating: 4.1,
        priceRange: '12,000원',
        image: '/api/placeholder/80/80'
      }
    ]);
    
    const selectedRestaurant = ref(null);
    const searchQuery = ref('');
    const selectedCategory = ref('all');
    
    // 그래프 관련
    const selectedChartType = ref('personal');
    const expenseChart = ref(null);
    
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
        const categoryMap = {
          'korean': '한식',
          'japanese': '일식',
          'western': '양식',
          'chinese': '중식',
          'fastfood': '패스트푸드'
        };
        const categoryName = categoryMap[selectedCategory.value];
        if (categoryName) {
          filtered = filtered.filter(restaurant => restaurant.category === categoryName);
        }
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
    };
    
    const refreshRecommendations = () => {
      console.log('음식점 새로고침');
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
    
    const viewDetails = (restaurant) => {
      selectedRestaurantDetail.value = restaurant;
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
        // 개인 소비 - 꺾은선 그래프
        window.chartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
            datasets: [
              {
                label: '식권포인트',
                data: [12000, 15000, 18000, 14000, 16000, 20000],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
              },
              {
                label: '현금',
                data: [8000, 12000, 10000, 15000, 13000, 18000],
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
        // 그룹 소비 - 막대 그래프
        const memberData = [
          { name: '김철수', color: '#3b82f6' },
          { name: '이영희', color: '#10b981' },
          { name: '박민수', color: '#f59e0b' },
          { name: '정수진', color: '#ef4444' },
          { name: '최동현', color: '#8b5cf6' }
        ];
        
        const datasets = [];
        memberData.forEach(member => {
          const ticketPoints = [12000, 15000, 18000, 14000, 16000, 20000].map(v => v + Math.random() * 5000);
          const cash = [8000, 12000, 10000, 15000, 13000, 18000].map(v => v + Math.random() * 3000);
          
          datasets.push({
            label: `${member.name} (식권포인트)`,
            data: ticketPoints,
            backgroundColor: member.color + '80',
            borderColor: member.color,
            borderWidth: 1,
            borderRadius: 4
          });
          
          datasets.push({
            label: `${member.name} (현금)`,
            data: cash,
            backgroundColor: member.color + '40',
            borderColor: member.color,
            borderWidth: 1,
            borderRadius: 4
          });
        });
        
        window.chartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['1월', '2월', '3월', '4월', '5월', '6월'],
            datasets: datasets
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
              }
            }
          }
        });
      }
    };
    
    // 컴포넌트 마운트 시 그래프 초기화
    onMounted(() => {
      setTimeout(() => {
        drawChart();
      }, 100);
    });
    
    return {
      loading,
      currentUser,
      currentGroup,
      userExpenses,
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
      drawChart
    };
  }
};
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Noto Sans KR', sans-serif;
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

/* 메인 컨텐츠 */
.main-content {
  padding: 2rem;
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