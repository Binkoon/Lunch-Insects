import { ref, computed } from 'vue'
import { getAllRestaurants } from '@/services/firebaseDBv2'

/**
 * 음식점 관련 비즈니스 로직을 관리하는 Composable
 * 단일책임: 음식점 데이터 관리, 필터링, 검색, 추천
 */
export const useRestaurant = () => {
  // 상태
  const restaurants = ref([])
  const loading = ref(false)
  const selectedCategory = ref('all')
  const searchQuery = ref('')
  const selectedRestaurantDetail = ref(null)
  const showRestaurantModal = ref(false)

  // 음식점 카테고리 정의
  const foodCategories = ref([
    { id: 'all', name: '전체', icon: '🍽️' },
    { id: 'korean', name: '한식', icon: '🍚' },
    { id: 'japanese', name: '일식', icon: '🍜' },
    { id: 'western', name: '양식', icon: '🍝' },
    { id: 'chinese', name: '중식', icon: '🥢' },
    { id: 'fastfood', name: '패스트푸드', icon: '🍔' }
  ])

  // 카테고리 한글 변환 함수
  const getCategoryName = (category) => {
    const categoryMap = {
      'korean': '한식',
      'japanese': '일식',
      'western': '양식',
      'chinese': '중식',
      'fastfood': '패스트푸드'
    }
    return categoryMap[category] || category
  }

  // 음식점 이름에 따른 이모지 매핑 (설정 기반)
  const getRestaurantEmoji = (restaurantName) => {
    if (!restaurantName) return '🍽️'
    
    const name = restaurantName.toLowerCase()
    
    // 이모지 매핑 규칙 (설정으로 분리 가능)
    const emojiRules = [
      // 한식
      { keywords: ['한식', '김치', '비빔밥', '된장', '찌개', '국', '신의주', '태진옥', '청진동', '용호동', '애성회관', '강남면옥'], emoji: '🍚' },
      // 중식
      { keywords: ['중식', '짜장', '짬뽕', '탕수육', '일품향'], emoji: '🥢' },
      // 일식
      { keywords: ['일식', '초밥', '라멘', '우동', '돈까스', '밀피유'], emoji: '🍜' },
      // 양식
      { keywords: ['양식', '스테이크', '파스타', '피자', '리원', '멘무샤'], emoji: '🍝' },
      // 패스트푸드
      { keywords: ['맥도날드', '맘스터치', 'kfc', 'bbq', '버거', '치킨', '보노보스', '콜리그'], emoji: '🍔' },
      // 카페/디저트
      { keywords: ['카페', '커피', '모모카페', '알로프트', '스쿨푸드'], emoji: '☕' },
      // 고기/구이
      { keywords: ['고기', '구이', '돈우가', '박씨화로구이', '족발', '미쓰족발'], emoji: '🥩' }
    ]
    
    // 규칙에 따라 이모지 반환
    for (const rule of emojiRules) {
      if (rule.keywords.some(keyword => name.includes(keyword))) {
        return rule.emoji
      }
    }
    
    // 기본값
    return '🍽️'
  }

  // 필터링된 음식점 목록
  const filteredRestaurants = computed(() => {
    let filtered = restaurants.value

    // 카테고리 필터링
    if (selectedCategory.value !== 'all') {
      filtered = filtered.filter(restaurant => 
        restaurant.category === selectedCategory.value
      )
    }

    // 검색어 필터링
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(query) ||
        (restaurant.address && restaurant.address.toLowerCase().includes(query)) ||
        (restaurant.category && getCategoryName(restaurant.category).toLowerCase().includes(query))
      )
    }

    return filtered
  })

  // 음식점 데이터 로드
  const loadRestaurants = async () => {
    try {
      loading.value = true
      if (import.meta.env.DEV) {
        console.log('음식점 데이터 로드 시작...')
      }
      
      const restaurantData = await getAllRestaurants(50)
      restaurants.value = restaurantData
      
      if (import.meta.env.DEV) {
        console.log('음식점 데이터 로드 완료:', restaurantData.length, '개')
      }
      
      if (import.meta.env.DEV && restaurantData.length > 0) {
        console.log('첫 번째 음식점:', restaurantData[0])
      }
    } catch (error) {
      console.error('음식점 데이터 로드 실패:', error)
      restaurants.value = []
    } finally {
      loading.value = false
    }
  }

  // 음식점 상세보기
  const viewDetails = async (restaurant) => {
    try {
      // 레스토랑 이름으로 상세(특히 menus, id)를 우선 보강
      const dbRestaurant = await getAllRestaurants(1, restaurant.name)
      if (dbRestaurant && dbRestaurant.length > 0) {
        selectedRestaurantDetail.value = {
          ...restaurant,
          id: dbRestaurant[0].id,
          menus: dbRestaurant[0].menus || dbRestaurant[0].menu || []
        }
      } else {
        selectedRestaurantDetail.value = restaurant
      }
    } catch (e) {
      console.warn('레스토랑 상세 조회 실패, 전달값으로 표시:', e)
      selectedRestaurantDetail.value = restaurant
    }
    
    // 모달 열기
    showRestaurantModal.value = true
  }

  // 카테고리 선택
  const selectCategory = (category) => {
    selectedCategory.value = category
  }

  // 검색어 설정
  const searchRestaurants = (query) => {
    searchQuery.value = query
  }

  // 음식점 선택
  const selectRestaurant = (restaurant) => {
    selectedRestaurantDetail.value = restaurant
  }

  // 모달 닫기
  const closeRestaurantModal = () => {
    showRestaurantModal.value = false
    selectedRestaurantDetail.value = null
  }

  return {
    // 상태
    restaurants,
    loading,
    selectedCategory,
    searchQuery,
    selectedRestaurantDetail,
    showRestaurantModal,
    foodCategories,
    
    // 계산된 속성
    filteredRestaurants,
    
    // 메서드
    loadRestaurants,
    viewDetails,
    selectCategory,
    searchRestaurants,
    selectRestaurant,
    closeRestaurantModal,
    getCategoryName,
    getRestaurantEmoji
  }
}
