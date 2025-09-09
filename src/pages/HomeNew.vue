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
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- 소비금액 그래프 섹션 -->
      <ExpenseChart 
        ref="expenseChart"
        :monthlyExpenseData="monthlyExpenseData"
        :groupId="currentGroup?.id || 'default-group'"
        @refresh="loadMonthlyExpenseData"
      />
    </main>

    <!-- 모달들 -->

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
      <div class="modal-content restaurant-detail-new" @click.stop>
        <div class="modal-header">
          <h3>🍽️ {{ selectedRestaurantDetail?.name }}</h3>
          <button class="close-btn" @click="closeRestaurantModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedRestaurantDetail" class="restaurant-detail-grid">
            
            <!-- 왼쪽: 기본 정보 & 메뉴 -->
            <div class="restaurant-info-panel">
              <!-- 기본 정보 -->
              <div class="info-card">
                <div class="restaurant-image-header">
                  <div class="restaurant-emoji-image">
                    {{ getRestaurantEmoji(selectedRestaurantDetail.name) }}
                  </div>
                  <div class="info-overlay">
                    <div class="category-badge">{{ getCategoryName(selectedRestaurantDetail.category) }}</div>
                    <div class="rating-info">
                      <span class="rating">⭐ {{ selectedRestaurantDetail.rating }}</span>
                      <span class="distance">🚶 {{ selectedRestaurantDetail.walkingTime }}분</span>
                    </div>
                  </div>
                </div>
                
                <div class="restaurant-meta">
                  <h4>📍 위치 정보</h4>
                  <p class="address">{{ selectedRestaurantDetail.address || '주소 정보 준비 중...' }}</p>
                  <p class="phone">📞 {{ selectedRestaurantDetail.phone || '전화번호 준비 중...' }}</p>
                  <p class="hours">🕐 {{ selectedRestaurantDetail.hours || '영업시간 정보 준비 중...' }}</p>
                </div>
              </div>
              
              <!-- 메뉴판 -->
              <div class="menu-card">
                <h4>📋 메뉴 & 가격</h4>
                <div class="menu-grid">
                  <div 
                    v-for="menu in (selectedRestaurantDetail.menus || selectedRestaurantDetail.menu || [])" 
                    :key="menu.id || menu.name"
                    class="menu-item-new"
                  >
                    <div class="menu-content">
                      <div class="menu-name">{{ menu.name }}</div>
                      <div class="menu-description" v-if="menu.description">{{ menu.description }}</div>
                    </div>
                    <div class="menu-price">{{ (menu.price || 0).toLocaleString() }}원</div>
                  </div>
                  
                  <!-- 메뉴가 없는 경우 -->
                  <div v-if="!selectedRestaurantDetail.menus?.length && !selectedRestaurantDetail.menu?.length" class="no-menu">
                    <p>🍽️ 메뉴 정보를 준비 중입니다.</p>
                    <p class="sub-text">곧 실제 메뉴와 가격을 확인하실 수 있습니다!</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 오른쪽: 지도 -->
            <div class="map-panel">
              <div class="map-card">
                <h4>🗺️ 위치</h4>
                <div class="map-container">
                  <NaverMap 
                    v-if="selectedRestaurantDetail?.location"
                    :restaurant="selectedRestaurantDetail"
                    :current-location="currentLocation"
                    @distance-calculated="onDistanceCalculated"
                  />
                  <div v-else class="map-placeholder">
                    <div class="map-icon">🗺️</div>
                    <p>위치 정보가 없습니다</p>
                    <p class="map-address">{{ selectedRestaurantDetail?.address || '주소 정보 없음' }}</p>
                  </div>
                </div>
                
                <!-- 길찾기 버튼들 -->
                <div class="direction-buttons">
                  <button class="direction-btn" @click="openNaverMap">
                    <span class="btn-icon">🧭</span>
                    네이버 지도로 보기
                  </button>
                  <button class="direction-btn" @click="openKakaoMap">
                    <span class="btn-icon">🚶</span>
                    카카오맵 길찾기
                  </button>
                </div>
              </div>
              
              <!-- 추가 정보 -->
              <div class="additional-info">
                <div class="info-item">
                  <span class="label">🕐 영업시간</span>
                  <span class="value">{{ selectedRestaurantDetail.hours || '정보 없음' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">💳 결제 방법</span>
                  <span class="value">{{ selectedRestaurantDetail.payment || '카드, 현금 가능' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">🚗 주차</span>
                  <span class="value">{{ selectedRestaurantDetail.parking || '정보 없음' }}</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeRestaurantModal">닫기</button>
        </div>
      </div>
    </div>


    <!-- 멤버 상태 편집 모달 (전체 화면 오버레이) -->
    <Teleport to="body">
      <div v-if="showStatusModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ modalData.member?.name }} - {{ modalData.date }} 상태 편집</h3>
            <button @click="closeStatusModal" class="close-btn">×</button>
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
                        v-for="r in modalFilteredRestaurants"
                        :key="r"
                        class="dropdown-item"
                        @click="selectModalRestaurant(r)"
                      >
                        <span class="restaurant-icon">🍽️</span>
                        <span class="restaurant-name">{{ r }}</span>
                      </div>
                      <div v-if="modalFilteredRestaurants.length === 0 && mealDetails.restaurant" class="dropdown-empty">
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
            <button @click="closeStatusModal" class="btn-cancel">
              취소
            </button>
            <button @click="saveStatus" class="btn-save">
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
import { gsap } from 'gsap';
import { useRestaurant } from '@/composables/useRestaurant';
import { useUser } from '@/composables/useUser';
import { useExpense } from '@/composables/useExpense';
import { useGroup } from '@/composables/useGroup';
import { useModal } from '@/composables/useModal';
import { useLocation } from '@/composables/useLocation';
import { useStatus } from '@/composables/useStatus';
import { useStats } from '@/composables/useStats';
// 코드 스플리팅을 위한 비동기 컴포넌트 등록
const GroupCalendar = defineAsyncComponent(() => import('@/components/Features/GroupCalendar.vue'));
const GroupManagement = defineAsyncComponent(() => import('@/components/Features/GroupManagement.vue'));
const ExpenseChart = defineAsyncComponent(() => import('@/components/Features/ExpenseChart.vue'));
const NaverMap = defineAsyncComponent(() => import('@/components/Features/NaverMap.vue'));
import { getNearbyRestaurants, getRestaurantsByCategory, getAllRestaurants, getGroup, getUserMonthlyExpenses, getAllUsers, getAllRestaurants as getRestaurantsCount, getUser, getUserGroups, getRestaurantByName, checkAndResetMonthlyExpenses, getGroupMembersMonthlyExpenses, updateUser } from '@/services/firebaseDBv2.js';
import { getCurrentUser, onAuthStateChange } from '@/services/firebaseAuth.js';
import { DEFAULT_LOCATION, DEFAULT_USER, DEFAULT_GROUP } from '@/config/constants.js';

export default {
  components: {
    GroupCalendar,
    GroupManagement,
    ExpenseChart,
    NaverMap
  },
  setup() {
    // 사용자 관련 로직 (Composable 사용)
    const {
      currentUser,
      loading: userLoading,
      userExpenses,
      currentLocation,
      loadUserData,
      loadUserDataFromAuth,
      loadMonthlyExpenses,
      // updateLocation은 useUser에서 관리
      updateUserInfo,
      logout,
      setupAuthListener
    } = useUser();

    // 음식점 관련 로직 (Composable 사용)
    const {
      restaurants,
      loading: restaurantLoading,
      selectedCategory,
      searchQuery,
      selectedRestaurantDetail,
      showRestaurantModal,
      foodCategories,
      filteredRestaurants,
      loadRestaurants,
      viewDetails,
      selectCategory,
      searchRestaurants,
      selectRestaurant,
      closeRestaurantModal,
      getCategoryName,
      getRestaurantEmoji
    } = useRestaurant();

    // 지출 관련 로직 (Composable 사용)
    const {
      loading: expenseLoading,
      monthlyExpenseData,
      statsData,
      expenseChart,
      loadMonthlyExpenseData,
      loadGroupMonthlyExpenseData,
      // loadStatsData는 useStats에서 관리
      refreshExpenseChart,
      refreshExpenseData
    } = useExpense();

    // 그룹 관련 로직 (Composable 사용)
    const {
      loading: groupLoading,
      currentGroup,
      showGroupModal,
      groupMembers,
      groupMembersList,
      isGroupAdmin,
      loadGroupData,
      openGroupManagement,
      closeGroupModal,
      handleGroupUpdated,
      addProposal,
      updateMemberStatus,
      getGroupStats,
      checkCurrentGroupExpenses
    } = useGroup();

    // 모달 관련 로직 (Composable 사용)
    const {
      showStatusModal,
      modalData,
      editingStatus,
      mealDetails,
      dropdownOpen,
      statusOptions,
      modalFilteredRestaurants,
      openStatusModal,
      closeStatusModal,
      selectModalRestaurant,
      toggleDropdown,
      closeDropdown,
      getMemberStatusClass,
      getMemberStatusText,
      getStatusDetails
    } = useModal();

    // 위치 관련 로직 (Composable 사용)
    const {
      currentLocation: locationInfo,
      distanceInfo,
      loading: locationLoading,
      getCurrentLocation,
      openNaverMap,
      openKakaoMap,
      onDistanceCalculated,
      // updateLocation은 useUser에서 관리
    } = useLocation();

    // 상태 관리 로직 (Composable 사용)
    const {
      loading: statusLoading,
      selectedDateForProposal,
      handleStatusUpdated,
      handleDateSelected,
      setSelectedDateForProposal,
      clearSelectedDateForProposal
    } = useStatus();

    // 통계 관련 로직 (Composable 사용)
    const {
      loading: statsLoading,
      nearbyStats,
      // loadStatsData는 useStats에서 관리
      refreshStats,
      updateStats
    } = useStats();

    // 상태 관리
    const loading = ref(false);

    // 모달 상태는 useModal에서 관리
    
    // 모달용 필터링된 음식점 목록은 useModal에서 관리
    
    // 드롭다운 핸들러 함수들
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
    
    // 모달 관련 함수들은 useModal에서 관리
    
    // currentGroup은 useGroup에서 관리
    
    // 개인 지출 데이터 (사용자 데이터에서 가져옴)
    // 사용자 지출 데이터는 useUser에서 관리
    
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

    // 그룹장 여부 확인은 useGroup에서 관리
    
    // 현재 위치 정보는 useUser에서 관리
    
    // 플랫폼 통계는 useStats에서 관리
    
    // 음식점 관련 - Firebase에서 가져오기
    // 음식점 데이터는 useRestaurant에서 관리

    // 사용자 관련 함수들은 useUser에서 관리

    // 월별 지출 데이터 로드는 useExpense에서 관리

    // 그룹 월별 지출 데이터 로드는 useExpense에서 관리

    // 통계 데이터 로드는 useExpense에서 관리

    // 그룹 멤버별 현재 지출 상태 조회는 useGroup에서 관리

    // 💰 월별 지출 초기화 체크
    const checkMonthlyExpenseReset = async (groupId) => {
      try {
        console.log('📅 월별 지출 초기화 체크 실행...');
        const resetResult = await checkAndResetMonthlyExpenses(groupId);
        
        if (resetResult.success && resetResult.reset) {
          console.log('✅ 월별 지출 초기화 완료:', resetResult.resetKey);
          console.log('💳 이전 달 지출 기록:', resetResult.previousExpenses);
          
          // 초기화 완료 알림 (선택사항)
          const currentDate = new Date();
          const monthName = currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
          console.log(`🎉 ${monthName} 새로운 달이 시작되었습니다! 모든 멤버의 지출이 초기화되었습니다.`);
        } else if (resetResult.success && !resetResult.reset) {
          console.log('📋 월별 지출 초기화:', resetResult.message);
        } else {
          console.error('❌ 월별 지출 초기화 실패:', resetResult.error);
        }
      } catch (error) {
        console.error('월별 지출 초기화 체크 중 오류:', error);
      }
    };

    // 그룹 데이터 로드
    // 그룹 데이터 로드는 useGroup에서 관리

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
    
    // selectedRestaurant, searchQuery, selectedCategory는 useRestaurant에서 관리
    
    // 그래프 관련 데이터는 useExpense에서 관리
    
    // 제안 관련
    // selectedDateForProposal은 useStatus에서 관리
    
    // 음식점 관련 로직은 useRestaurant에서 관리
    
    // 모달 상태
    // showGroupModal은 useGroup에서 관리
    // showRestaurantModal은 useRestaurant에서 관리
    
    // 계산된 속성
    // filteredRestaurants는 useRestaurant에서 관리
    
    // 메서드들
    
    // 그룹 관련 함수들은 useGroup에서 관리

    
    const refreshRecommendations = async () => {
      console.log('음식점 새로고침');
      await loadRestaurants(); // useRestaurant에서 가져온 함수
    };
    
    // updateLocation은 useUser에서 관리
    
    // 음식점 관련 메서드들은 useRestaurant에서 관리
    
    // closeRestaurantModal은 useRestaurant에서 관리

    // 지도 관련 함수들
    // openNaverMap, openKakaoMap은 useLocation에서 관리

    // 거리 계산 결과 처리
    // onDistanceCalculated는 useLocation에서 관리

    // getCurrentLocation은 useLocation에서 관리
    
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
    
    // handleDateSelected는 useStatus에서 관리
    
    
    // setupAuthListener는 useUser에서 관리

    // 인증 상태 리스너 정리를 위한 변수
    let authUnsubscribe = null;

    // 컴포넌트 마운트 시 데이터 로드 및 그래프 초기화
    onMounted(async () => {
      // 현재 위치 가져오기
      getCurrentLocation();
      
      // 인증 상태 감지 설정 (useUser에서 관리)
      authUnsubscribe = setupAuthListener(async (user) => {
        if (user) {
          console.log('인증 상태 변경 감지 - 로그인:', user.email);
          // 추가 로직 실행
          await loadGroupData(user.uid);
          await loadRestaurants();
          await loadStatsData(user.uid, currentGroup.value?.id);
          await loadMonthlyExpenseData(user.uid);
        } else {
          console.log('인증 상태 변경 감지 - 로그아웃');
          // 로그아웃 시 추가 로직
          currentGroup.value = null;
          window.location.href = '/auth';
        }
      });
      
      // 초기 로드 (setupAuthListener가 처리함)
      const authUser = getCurrentUser();
      if (authUser) {
        console.log('초기 로드 - 인증된 사용자:', authUser.email);
        // setupAuthListener가 자동으로 처리하므로 중복 호출 제거
      } else {
        console.log('초기 로드 - 인증되지 않은 사용자');
      }
    });

    // 컴포넌트 언마운트 시 리스너 정리
    // 모달 관련 함수들
    // statusOptions는 useModal에서 관리

    // 모달 관련 함수들은 useModal에서 관리

    // saveStatus는 useModal에서 관리

    // getStatusDetails는 useModal에서 관리

    // getMemberStatusClass, getMemberStatusText는 useModal에서 관리

    // 🆕 하이브리드 시스템: 상태 업데이트 핸들러  
    // expenseChart는 useExpense에서 관리
    
    // handleStatusUpdated는 useStatus에서 관리

    // GSAP 애니메이션 초기화
    onMounted(() => {
      // 헤더 애니메이션
      gsap.fromTo('.app-header', 
        { 
          y: -100, 
          opacity: 0 
        }, 
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          ease: "power2.out" 
        }
      );

      // 헤더 요소들 순차 애니메이션
      gsap.fromTo('.header-left h1', 
        { 
          x: -50, 
          opacity: 0 
        }, 
        { 
          x: 0, 
          opacity: 1, 
          duration: 0.6, 
          delay: 0.3, 
          ease: "power2.out" 
        }
      );

      gsap.fromTo('.header-left p', 
        { 
          x: -30, 
          opacity: 0 
        }, 
        { 
          x: 0, 
          opacity: 1, 
          duration: 0.5, 
          delay: 0.5, 
          ease: "power2.out" 
        }
      );

      // 오른쪽 헤더 요소들
      gsap.fromTo('.expense-info, .user-info, .group-btn, .logout-btn', 
        { 
          x: 50, 
          opacity: 0 
        }, 
        { 
          x: 0, 
          opacity: 1, 
          duration: 0.6, 
          delay: 0.7, 
          stagger: 0.1,
          ease: "power2.out" 
        }
      );

      // 메인 컨텐츠 애니메이션
      gsap.fromTo('.main-content', 
        { 
          y: 30, 
          opacity: 0 
        }, 
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          delay: 0.5, 
          ease: "power2.out" 
        }
      );

      // 부드러운 호버 애니메이션 추가
      gsap.set('.group-btn, .logout-btn', {
        transformOrigin: 'center center'
      });
    });

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
      // nearbyStats는 useStats에서 관리
      // 음식점 관련 (useRestaurant에서 가져온 것들)
      restaurants,
      filteredRestaurants,
      selectedCategory,
      searchQuery,
      selectedRestaurantDetail,
      showRestaurantModal,
      foodCategories,
      loadRestaurants,
      selectCategory,
      searchRestaurants,
      selectRestaurant,
      viewDetails,
      closeRestaurantModal,
      getCategoryName,
      getRestaurantEmoji,
      // selectedRestaurant는 useRestaurant에서 관리되지 않으므로 별도 추가
      selectedRestaurant: ref(null),
      showGroupModal,
      monthlyExpenseData,
      selectedDateForProposal,
      openGroupManagement,
      closeGroupModal,
      handleGroupUpdated,
      refreshRecommendations,
      // updateLocation은 useUser에서 관리
      searchRestaurants,
      selectCategory,
      selectRestaurant,
      viewDetails,
      closeRestaurantModal,
      openNaverMap,
      openKakaoMap,
      onDistanceCalculated,
      getCurrentLocation,
      selectRestaurantForLunch,
      selectForLunch,
      handleDateSelected,
      // 음식점 관련 메서드는 useRestaurant에서 관리
      // 사용자 관련 메서드는 useUser에서 관리
      updateLocation,
      updateUserInfo,
      logout,
      setupAuthListener,
      // loadGroupData는 useGroup에서 관리
      // loadMonthlyExpenseData, loadGroupMonthlyExpenseData, loadStatsData는 useExpense에서 관리
      handleLogout,
      // 모달 관련은 useModal에서 관리
      handleStatusUpdated,
      expenseChart,
      modalFilteredRestaurants,
      handleInputFocus,
      handleInputChange,
      handleInputBlur,
      closeDropdown,
      selectModalRestaurant
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
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  color: #1e293b;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  backdrop-filter: blur(10px);
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
  color: #0f172a;
  letter-spacing: -0.02em;
}

.header-left p {
  font-size: 1.1rem;
  margin: 0;
  font-weight: 500;
  color: #64748b;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.expense-info {
  display: flex;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
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
  background: #f1f5f9;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
}

.expense-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.expense-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.expense-amount {
  font-size: 1.1rem;
  color: #1e293b;
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
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.default-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #64748b;
  border: 2px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.user-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #1e293b;
}


.group-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.group-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
}

.logout-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.75rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.logout-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
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

/* 멤버 초대 모달 스타일 */
.invite-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 1rem;
  background: white;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.form-hint {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.role-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.role-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.role-option:hover {
  border-color: #22c55e;
  background: #f0fdf4;
}

.role-option input[type="radio"] {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #22c55e;
}

.role-option input[type="radio"]:checked + .role-icon + .role-info {
  color: #059669;
}

.role-icon {
  font-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 50%;
}

.role-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.role-name {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
}

.role-desc {
  font-size: 0.875rem;
  color: #6b7280;
}

/* ===== 새로운 음식점 상세보기 모달 스타일 ===== */
.restaurant-detail-new {
  max-width: 1200px;
  width: 95vw;
  max-height: 90vh;
  overflow: hidden;
}

.restaurant-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  height: 70vh;
  overflow: hidden;
}

.restaurant-info-panel {
  overflow-y: auto;
  padding-right: 1rem;
}

.map-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 정보 카드 */
.info-card, .menu-card, .map-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.restaurant-image-header {
  position: relative;
  border-radius: 0.75rem;
  overflow: hidden;
  margin-bottom: 1rem;
}

.restaurant-image-header img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.restaurant-emoji-image {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
  font-size: 4rem;
  border: 2px solid #e0e0e0;
}

.info-overlay {
  position: absolute;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.category-badge {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.rating-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-end;
}

.rating, .distance {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.restaurant-meta h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 0.5rem;
}

.restaurant-meta p {
  margin: 0.5rem 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.address {
  font-weight: 500;
  color: #374151 !important;
}

/* 메뉴 카드 */
.menu-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
}

.menu-item-new {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.menu-item-new:hover {
  background: #f3f4f6;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.menu-content {
  flex: 1;
}

.menu-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.menu-description {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

.menu-price {
  font-weight: 700;
  color: #dc2626;
  font-size: 1.125rem;
  margin-left: 1rem;
}

.no-menu {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.no-menu .sub-text {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* 지도 카드 */
.map-container {
  height: 300px;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  margin-bottom: 1rem;
}

.map-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f9fafb;
  color: #6b7280;
}

.map-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.map-address {
  font-size: 0.875rem;
  margin-top: 0.5rem;
  color: #374151;
  font-weight: 500;
}

/* 길찾기 버튼들 */
.direction-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.direction-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.direction-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.direction-btn:nth-child(2) {
  background: #059669;
}

.direction-btn:nth-child(2):hover {
  background: #047857;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

/* 추가 정보 */
.additional-info {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #374151;
}

.value {
  color: #6b7280;
  text-align: right;
}

/* 반응형 */
@media (max-width: 768px) {
  .restaurant-detail-new {
    width: 98vw;
    height: 95vh;
  }
  
  .restaurant-detail-grid {
    grid-template-columns: 1fr;
    height: auto;
    max-height: 80vh;
  }
  
  .restaurant-info-panel {
    padding-right: 0;
  }
  
  .direction-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
