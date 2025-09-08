import { ref, onMounted, onUnmounted } from 'vue';
import { getCurrentUser, logout, onAuthStateChange } from '@/services/firebaseAuth.js';
import { getUser } from '@/services/firebaseDBv2.js';

/**
 * 인증 상태 관리 Composable
 * 사용자 로그인/로그아웃 상태와 사용자 정보를 관리합니다
 */
export function useAuth() {
  // 상태
  const currentUser = ref(null);
  const isLoading = ref(true);
  const isAuthenticated = ref(false);

  // 인증 상태 리스너 해제 함수
  let unsubscribeAuth = null;

  /**
   * Firebase에서 현재 사용자 정보를 로드
   */
  const loadCurrentUser = async () => {
    try {
      const authUser = getCurrentUser();
      if (!authUser) {
        currentUser.value = null;
        isAuthenticated.value = false;
        return null;
      }

      // Firebase DB에서 사용자 세부 정보 가져오기
      const userData = await getUser(authUser.uid);
      if (userData) {
        currentUser.value = {
          id: authUser.uid,
          email: authUser.email,
          name: userData.name || authUser.displayName || 'Unknown',
          profileImage: userData.profileImage || authUser.photoURL,
          avatar: userData.profileImage || authUser.photoURL,
          expenses: {
            ticketPoints: 0,
            cash: 0
          },
          ...userData
        };
        isAuthenticated.value = true;
        return currentUser.value;
      } else {
        currentUser.value = {
          id: authUser.uid,
          email: authUser.email,
          name: authUser.displayName || 'Unknown',
          profileImage: authUser.photoURL,
          avatar: authUser.photoURL,
          expenses: {
            ticketPoints: 0,
            cash: 0
          }
        };
        isAuthenticated.value = true;
        return currentUser.value;
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
      currentUser.value = null;
      isAuthenticated.value = false;
      return null;
    }
  };

  /**
   * 인증 상태 리스너 설정
   */
  const setupAuthListener = () => {
    unsubscribeAuth = onAuthStateChange(async (user) => {
      isLoading.value = true;
      try {
        if (user) {
          await loadCurrentUser();
        } else {
          currentUser.value = null;
          isAuthenticated.value = false;
        }
      } catch (error) {
        console.error('인증 상태 변경 처리 실패:', error);
      } finally {
        isLoading.value = false;
      }
    });
  };

  /**
   * 로그아웃 처리
   */
  const handleLogout = async () => {
    try {
      await logout();
      currentUser.value = null;
      isAuthenticated.value = false;
    } catch (error) {
      console.error('❌ 로그아웃 실패:', error);
      throw error;
    }
  };

  /**
   * 초기화
   */
  const initialize = async () => {
    isLoading.value = true;
    try {
      // 현재 인증 상태 확인
      await loadCurrentUser();
      // 인증 상태 변화 감지 시작
      setupAuthListener();
    } catch (error) {
      console.error('인증 초기화 실패:', error);
    } finally {
      isLoading.value = false;
    }
  };

  // 컴포넌트 마운트 시 초기화
  onMounted(() => {
    initialize();
  });

  // 컴포넌트 언마운트 시 리스너 해제
  onUnmounted(() => {
    if (unsubscribeAuth) {
      unsubscribeAuth();
    }
  });

  return {
    // 상태
    currentUser,
    isLoading,
    isAuthenticated,
    
    // 메서드
    loadCurrentUser,
    handleLogout,
    initialize
  };
}
