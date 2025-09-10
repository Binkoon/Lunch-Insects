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
  const selectedRestaurant = ref(null)

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
      
      // 바스버거 테스트 데이터 추가
      const testRestaurants = [
        {
          id: 'test-basburger-1',
          name: '바스버거',
          branchName: '서소문시청역점',
          fullName: '바스버거 서소문시청역점',
          category: 'fastfood',
          address: '서울 중구 다동길 5 광일빌딩 지하1층',
          phone: '0507-1311-6653',
          rating: 4.2,
          priceRange: '보통',
          distance: 250, // 한진빌딩에서 250m
          walkingTime: 3, // 도보 3분
          menu: [
            { name: '바스버거세트', price: 12400, description: '바스버거 + 감자튀김 + 콜라' },
            { name: '하와이안버거세트', price: 14400, description: '하와이안버거 + 감자튀김 + 콜라' },
            { name: '베이컨버거', price: 10900, description: '베이컨이 들어간 버거' }
          ],
          features: ['와이파이', '주차', '단체석'],
          openingHours: {
            monday: '10:30 - 20:45',
            tuesday: '10:30 - 20:45',
            wednesday: '10:30 - 20:45',
            thursday: '10:30 - 20:45',
            friday: '10:30 - 20:45',
            saturday: '10:30 - 20:45',
            sunday: '10:30 - 20:45'
          }
        }
      ]
      
      restaurants.value = [...(restaurantData || []), ...testRestaurants]
      
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
    selectedRestaurant.value = restaurant
  }

  return {
    // 상태
    restaurants,
    loading,
    selectedCategory,
    searchQuery,
    selectedRestaurant,
    foodCategories,
    
    // 계산된 속성
    filteredRestaurants,
    
    // 메서드
    loadRestaurants,
    selectCategory,
    searchRestaurants,
    selectRestaurant,
    getCategoryName,
    getRestaurantEmoji
  }
}
