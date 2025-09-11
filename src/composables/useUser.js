import { ref, computed } from 'vue'
import { getCurrentUser, onAuthStateChange } from '@/services/firebaseAuth'
import { getUser, getUserMonthlyExpenses, updateUser } from '@/services/firebaseDBv2'
import { DEFAULT_USER } from '@/config/constants'

/**
 * 사용자 관련 비즈니스 로직을 관리하는 Composable
 * 단일책임: 사용자 인증, 프로필, 지출 데이터 관리
 */
export const useUser = () => {
  // 상태
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
  })

  const loading = ref(false)

  // 계산된 속성
  const userExpenses = computed(() => currentUser.value.expenses || {
    ticketPoints: 0,
    cash: 0
  })

  // 현재 위치 정보 (사용자 데이터에서 가져옴)
  const currentLocation = computed(() => {
    const userLocation = currentUser.value.location
    if (userLocation && userLocation.lat && userLocation.lng) {
      return {
        name: userLocation.name || '현재 위치',
        address: userLocation.address || `${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`,
        lat: userLocation.lat,
        lng: userLocation.lng
      }
    }
    return {
      name: '한진빌딩',
      address: '서울특별시 중구 남대문로 63',
      lat: 37.5665,
      lng: 126.9780
    }
  })

  // 인증된 사용자 데이터 로드
  const loadUserDataFromAuth = async (authUser) => {
    try {
      // Firestore에서 사용자 데이터 조회
      const userData = await getUser(authUser.uid)
      
      if (userData && userData.success && userData.data) {
        const user = userData.data;
        currentUser.value = {
          id: user.id,
          name: user.name || '사용자',
          email: authUser.email,
          avatar: user.avatar || null,
          expenses: user.expenses || {
            ticketPoints: 0,
            cash: 0
          },
          location: user.location || {
            name: '',
            address: '',
            lat: null,
            lng: null
          }
        }
      } else {
        // Firestore에 사용자 데이터가 없는 경우 기본값 사용
        currentUser.value = {
          ...DEFAULT_USER,
          id: authUser.uid,
          email: authUser.email
        }
      }
      
      // 이번달 지출액 로드
      await loadMonthlyExpenses()
      
    } catch (error) {
      console.error('사용자 데이터 로드 실패:', error)
      currentUser.value = null
    }
  }

  // 사용자 데이터 로드
  const loadUserData = async () => {
    try {
      const authUser = getCurrentUser()
      
      if (authUser) {
        await loadUserDataFromAuth(authUser)
      } else {
        currentUser.value = null
      }
    } catch (error) {
      console.error('사용자 데이터 로드 실패:', error)
      currentUser.value = null
    }
  }

  // 이번달 지출액 로드
  const loadMonthlyExpenses = async () => {
    try {
      if (currentUser.value.id && currentUser.value.id !== 'guest') {
        // 이번달 지출액 조회
        const expenses = await getUserMonthlyExpenses(currentUser.value.id)
        
        if (expenses) {
          currentUser.value.expenses = {
            ticketPoints: expenses.ticketPoints || 0,
            cash: expenses.cash || 0,
            lastUpdated: expenses.lastUpdated || new Date()
          }
        } else {
          currentUser.value.expenses = {
            ticketPoints: 0,
            cash: 0,
            lastUpdated: new Date()
          }
        }
      }
    } catch (error) {
      console.error('이번달 지출액 로드 실패:', error)
      currentUser.value.expenses = {
        ticketPoints: 0,
        cash: 0,
        lastUpdated: new Date()
      }
    }
  }

  // 위치 정보 업데이트
  const updateLocation = (locationData) => {
    if (currentUser.value) {
      currentUser.value.location = {
        ...currentUser.value.location,
        ...locationData
      }
    }
  }

  // 사용자 정보 업데이트
  const updateUserInfo = async (userData) => {
    try {
      if (currentUser.value?.id) {
        await updateUser(currentUser.value.id, userData)
        currentUser.value = { ...currentUser.value, ...userData }
      }
    } catch (error) {
      console.error('사용자 정보 업데이트 실패:', error)
    }
  }

  // 로그아웃
  const logout = async () => {
    try {
      currentUser.value = null
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  // 인증 상태 변경 리스너 설정
  const setupAuthListener = (callback) => {
    return onAuthStateChange(async (user) => {
      if (user) {
        await loadUserDataFromAuth(user)
        if (callback) callback(user)
      } else {
        currentUser.value = null
        if (callback) callback(null)
      }
    })
  }

  return {
    // 상태
    currentUser,
    loading,
    
    // 계산된 속성
    userExpenses,
    currentLocation,
    
    // 메서드
    loadUserData,
    loadUserDataFromAuth,
    loadMonthlyExpenses,
    updateLocation,
    updateUserInfo,
    logout,
    setupAuthListener
  }
}
