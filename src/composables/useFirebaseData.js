import { ref } from 'vue';
import { 
  getGroup, 
  getUserMonthlyExpenses, 
  getAllUsers, 
  getAllRestaurants, 
  getUser,
  getUserGroups 
} from '@/services/firebaseDBv2.js';

/**
 * Firebase 데이터 로딩 Composable
 * 그룹, 사용자, 음식점 등의 데이터를 관리합니다
 */
export function useFirebaseData() {
  // 상태
  const loading = ref(false);
  const error = ref(null);

  /**
   * 그룹 데이터 로드
   */
  const loadGroupData = async (groupId) => {
    if (!groupId) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const groupData = await getGroup(groupId);
      return groupData;
    } catch (err) {
      console.error('그룹 데이터 로드 실패:', err);
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 사용자 그룹 목록 로드
   */
  const loadUserGroups = async (userId) => {
    if (!userId) return [];
    
    loading.value = true;
    error.value = null;
    
    try {
      const groups = await getUserGroups(userId);
      return groups || [];
    } catch (err) {
      console.error('사용자 그룹 로드 실패:', err);
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 사용자 월별 지출 데이터 로드
   */
  const loadUserExpenses = async (userId) => {
    if (!userId) return { ticketPoints: 0, cash: 0 };
    
    loading.value = true;
    error.value = null;
    
    try {
      const expenses = await getUserMonthlyExpenses(userId);
      return expenses || { ticketPoints: 0, cash: 0 };
    } catch (err) {
      console.error('사용자 지출 데이터 로드 실패:', err);
      error.value = err.message;
      return { ticketPoints: 0, cash: 0 };
    } finally {
      loading.value = false;
    }
  };

  /**
   * 모든 사용자 목록 로드 (그룹용)
   */
  const loadAllUsers = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const users = await getAllUsers();
      return users || [];
    } catch (err) {
      console.error('전체 사용자 로드 실패:', err);
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 모든 음식점 목록 로드
   */
  const loadAllRestaurants = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const restaurants = await getAllRestaurants();
      return restaurants || [];
    } catch (err) {
      console.error('음식점 목록 로드 실패:', err);
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 특정 사용자 정보 로드
   */
  const loadUser = async (userId) => {
    if (!userId) return null;
    
    loading.value = true;
    error.value = null;
    
    try {
      const userData = await getUser(userId);
      return userData;
    } catch (err) {
      console.error('사용자 정보 로드 실패:', err);
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 여러 사용자 정보를 한번에 로드
   */
  const loadMultipleUsers = async (userIds) => {
    if (!userIds || userIds.length === 0) return [];
    
    loading.value = true;
    error.value = null;
    
    try {
      const userPromises = userIds.map(id => getUser(id));
      const users = await Promise.all(userPromises);
      return users.filter(user => user !== null);
    } catch (err) {
      console.error('여러 사용자 정보 로드 실패:', err);
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  };

  return {
    // 상태
    loading,
    error,
    
    // 메서드
    loadGroupData,
    loadUserGroups,
    loadUserExpenses,
    loadAllUsers,
    loadAllRestaurants,
    loadUser,
    loadMultipleUsers
  };
}
