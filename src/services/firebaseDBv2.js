/**
 * 식충이 캘린더 v2.0 - Firebase Firestore 데이터베이스 관리
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase.js';
import { COLLECTIONS } from '../config/collections.js';

// ==================== 사용자 관리 ====================

/**
 * 사용자 생성
 */
export const createUser = async (userData) => {
  try {
    const userRef = await addDoc(collection(db, COLLECTIONS.USERS), {
      ...userData,
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp()
    });
    console.log('사용자 생성 성공:', userRef.id);
    return userRef.id;
  } catch (error) {
    console.error('사용자 생성 실패:', error);
    throw error;
  }
};

/**
 * 사용자 정보 조회 (UID 또는 email로)
 */
export const getUser = async (userIdOrEmail) => {
  try {
    // email인지 확인 (이메일 형식 체크)
    if (userIdOrEmail.includes('@')) {
      return await getUserByEmail(userIdOrEmail);
    }
    
    // Firebase Auth UID로 직접 문서 조회 (이제 문서 ID가 Auth UID와 일치)
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userIdOrEmail));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('사용자 조회 실패:', error);
    throw error;
  }
};

/**
 * 이메일로 사용자 정보 조회
 */
export const getUserByEmail = async (email) => {
  try {
    const usersQuery = query(
      collection(db, COLLECTIONS.USERS),
      where('email', '==', email)
    );
    const querySnapshot = await getDocs(usersQuery);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('이메일로 사용자 조회 실패:', error);
    throw error;
  }
};

/**
 * 사용자 정보 업데이트
 */
export const updateUser = async (userId, userData) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      ...userData,
      lastActiveAt: serverTimestamp()
    });
    console.log('사용자 정보 업데이트 성공');
    return true;
  } catch (error) {
    console.error('사용자 정보 업데이트 실패:', error);
    throw error;
  }
};

// ==================== 그룹 관리 ====================

/**
 * 그룹 생성 (초대 링크와 코드 자동 생성)
 */
export const createGroup = async (groupData) => {
  try {
    const groupRef = await addDoc(collection(db, COLLECTIONS.GROUPS), {
      ...groupData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    const groupId = groupRef.id;
    
    // 그룹 코드 자동 생성
    const groupCode = await createGroupCode(groupId, groupData.createdBy);
    
    // 그룹 정보에 코드와 링크 추가
    await updateDoc(groupRef, {
      inviteCode: groupCode.code,
      inviteLink: `${window.location.origin}/join/${groupId}`,
      codeId: groupCode.id
    });
    
    console.log('그룹 생성 성공:', groupId);
    console.log('그룹 코드:', groupCode.code);
    console.log('초대 링크:', `${window.location.origin}/join/${groupId}`);
    
    return {
      id: groupId,
      code: groupCode.code,
      inviteLink: `${window.location.origin}/join/${groupId}`
    };
  } catch (error) {
    console.error('그룹 생성 실패:', error);
    throw error;
  }
};

/**
 * 그룹 조회
 */
export const getGroup = async (groupId) => {
  try {
    const groupDoc = await getDoc(doc(db, COLLECTIONS.GROUPS, groupId));
    if (groupDoc.exists()) {
      return { id: groupDoc.id, ...groupDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('그룹 조회 실패:', error);
    throw error;
  }
};

/**
 * 사용자의 그룹 목록 조회
 */
export const getUserGroups = async (userId) => {
  try {
    const groupsQuery = query(
      collection(db, COLLECTIONS.GROUPS),
      where('members', 'array-contains', userId)
    );
    const querySnapshot = await getDocs(groupsQuery);
    
    const groups = [];
    querySnapshot.forEach((doc) => {
      groups.push({ id: doc.id, ...doc.data() });
    });
    
    return groups;
  } catch (error) {
    console.error('사용자 그룹 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 그룹 정보 업데이트
 */
export const updateGroup = async (groupId, groupData) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.GROUPS, groupId), {
      ...groupData,
      updatedAt: serverTimestamp()
    });
    console.log('그룹 정보 업데이트 성공');
    return true;
  } catch (error) {
    console.error('그룹 정보 업데이트 실패:', error);
    throw error;
  }
};

/**
 * 그룹에 멤버 추가/강퇴
 */
export const addGroupMember = async (groupId, memberId) => {
  try {
    const ref = doc(db, COLLECTIONS.GROUPS, groupId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    const data = snap.data();
    const members = Array.isArray(data.members) ? data.members : [];
    if (!members.includes(memberId)) members.push(memberId);
    await updateDoc(ref, { members, updatedAt: serverTimestamp() });
    return true;
  } catch (e) {
    console.error('멤버 추가 실패:', e);
    return false;
  }
};

export const removeGroupMember = async (groupId, memberId) => {
  try {
    const ref = doc(db, COLLECTIONS.GROUPS, groupId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    const data = snap.data();
    const members = (Array.isArray(data.members) ? data.members : []).filter(m => m !== memberId);
    await updateDoc(ref, { members, updatedAt: serverTimestamp() });
    return true;
  } catch (e) {
    console.error('멤버 강퇴 실패:', e);
    return false;
  }
};

/**
 * 그룹 생성(관리자=creator)
 */
export const createGroupSimple = async ({ name, description = '', adminId, members = [] }) => {
  try {
    const allMembers = Array.from(new Set([adminId, ...members]));
    const ref = await addDoc(collection(db, COLLECTIONS.GROUPS), {
      name,
      description,
      members: allMembers,
      admin: adminId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    });
    return ref.id;
  } catch (e) {
    console.error('그룹 생성 실패:', e);
    throw e;
  }
};


// ==================== 일정 관리 ====================

/**
 * 일정 생성
 */
export const createSchedule = async (scheduleData) => {
  try {
    const scheduleRef = await addDoc(collection(db, COLLECTIONS.SCHEDULES), {
      ...scheduleData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('일정 생성 성공:', scheduleRef.id);
    return scheduleRef.id;
  } catch (error) {
    console.error('일정 생성 실패:', error);
    throw error;
  }
};

/**
 * 그룹의 일정 조회 (월별)
 */
export const getGroupSchedules = async (groupId, year, month) => {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    
    const schedulesQuery = query(
      collection(db, COLLECTIONS.SCHEDULES),
      where('groupId', '==', groupId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date'),
      orderBy('time')
    );
    
    const querySnapshot = await getDocs(schedulesQuery);
    const schedules = [];
    
    querySnapshot.forEach((doc) => {
      schedules.push({ id: doc.id, ...doc.data() });
    });
    
    return schedules;
  } catch (error) {
    console.error('그룹 일정 조회 실패:', error);
    throw error;
  }
};

/**
 * 일정 업데이트
 */
export const updateSchedule = async (scheduleId, scheduleData) => {
  try {
    await updateDoc(doc(db, COLLECTIONS.SCHEDULES, scheduleId), {
      ...scheduleData,
      updatedAt: serverTimestamp()
    });
    console.log('일정 업데이트 성공');
    return true;
  } catch (error) {
    console.error('일정 업데이트 실패:', error);
    throw error;
  }
};

/**
 * 일정 삭제
 */
export const deleteSchedule = async (scheduleId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.SCHEDULES, scheduleId));
    console.log('일정 삭제 성공');
    return true;
  } catch (error) {
    console.error('일정 삭제 실패:', error);
    throw error;
  }
};

// ==================== 음식점 관리 ====================

/**
 * 음식점 생성
 */
export const createRestaurant = async (restaurantData) => {
  try {
    const restaurantRef = await addDoc(collection(db, COLLECTIONS.RESTAURANTS), {
      ...restaurantData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('음식점 생성 성공:', restaurantRef.id);
    return restaurantRef.id;
  } catch (error) {
    console.error('음식점 생성 실패:', error);
    throw error;
  }
};

/**
 * 위치 기반 음식점 검색
 */
export const getNearbyRestaurants = async (latitude, longitude, radius = 1000) => {
  try {
    // 실제 구현에서는 GeoFirestore를 사용하거나
    // 서버에서 거리 계산을 수행해야 함
    const restaurantsQuery = query(
      collection(db, COLLECTIONS.RESTAURANTS),
      limit(50)
    );
    
    const querySnapshot = await getDocs(restaurantsQuery);
    const restaurants = [];
    
    querySnapshot.forEach((doc) => {
      const restaurant = { id: doc.id, ...doc.data() };
      // 거리 계산 로직 (간단한 예시)
      const distance = calculateDistance(
        latitude, longitude,
        restaurant.location.latitude, restaurant.location.longitude
      );
      
      if (distance <= radius) {
        restaurant.distance = distance;
        restaurant.walkingTime = Math.round(distance / 80); // 분당 80m 가정
        restaurants.push(restaurant);
      }
    });
    
    // 거리순 정렬
    restaurants.sort((a, b) => a.distance - b.distance);
    
    return restaurants;
  } catch (error) {
    console.error('근처 음식점 검색 실패:', error);
    throw error;
  }
};

/**
 * 모든 음식점 조회 (간단한 쿼리)
 */
export const getAllRestaurants = async (limitCount = 50) => {
  try {
    const restaurantsQuery = query(
      collection(db, COLLECTIONS.RESTAURANTS),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(restaurantsQuery);
    const restaurants = [];
    
    querySnapshot.forEach((doc) => {
      restaurants.push({ id: doc.id, ...doc.data() });
    });
    
    return restaurants;
  } catch (error) {
    console.error('음식점 조회 실패:', error);
    throw error;
  }
};

/**
 * 카테고리별 음식점 검색
 */
export const getRestaurantsByCategory = async (category, limitCount = 20) => {
  try {
    const restaurantsQuery = query(
      collection(db, COLLECTIONS.RESTAURANTS),
      where('category', '==', category),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(restaurantsQuery);
    const restaurants = [];
    
    querySnapshot.forEach((doc) => {
      restaurants.push({ id: doc.id, ...doc.data() });
    });
    
    // 클라이언트에서 평점순으로 정렬
    restaurants.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    
    return restaurants;
  } catch (error) {
    console.error('카테고리별 음식점 검색 실패:', error);
    throw error;
  }
};

// ==================== 레스토랑 메뉴 관리 ====================

/**
 * 특정 레스토랑(이름 기준)에 메뉴 배열을 병합 추가
 * restaurantName: string
 * menus: Array<{ name: string, price: number }>
 */
export const addMenusToRestaurantByName = async (restaurantName, menus) => {
  try {
    if (!restaurantName || !menus || menus.length === 0) return false;
    // 레스토랑 문서 찾기 (이름 기준)
    const q = query(collection(db, COLLECTIONS.RESTAURANTS), where('name', '==', restaurantName));
    const snap = await getDocs(q);
    if (snap.empty) {
      console.warn('레스토랑을 찾을 수 없습니다:', restaurantName);
      return false;
    }
    const docRef = snap.docs[0].ref;
    const docData = snap.docs[0].data() || {};
    const existingMenus = Array.isArray(docData.menus) ? docData.menus : [];
    // 간단 병합: 동일명 이름이 있으면 교체, 없으면 추가
    const byName = new Map(existingMenus.map(m => [m.name, m]));
    menus.forEach(m => {
      byName.set(m.name, { name: m.name, price: m.price });
    });
    const merged = Array.from(byName.values());
    await updateDoc(docRef, { menus: merged, updatedAt: serverTimestamp() });
    return true;
  } catch (error) {
    console.error('레스토랑 메뉴 추가 실패:', error);
    return false;
  }
};

// ==================== 사용자 지출 관리 ====================

/**
 * 그룹 내 모든 멤버의 이번달 지출 현황 조회
 */
export const getGroupMembersMonthlyExpenses = async (groupId, year, month) => {
  try {
    // 그룹 멤버 조회
    const group = await getGroup(groupId);
    if (!group || !group.members) {
      return {};
    }

    const membersExpenses = {};
    
    // 각 멤버별로 지출 조회
    for (const member of group.members) {
      const expenses = await getUserMonthlyExpenses(member.id, year, month);
      membersExpenses[member.id] = {
        ...member,
        expenses
      };
    }
    
    return membersExpenses;
  } catch (error) {
    console.error('그룹 멤버 월별 지출 조회 실패:', error);
    return {};
  }
};

/**
 * 매월 자동 초기화 체크 및 실행
 */
export const checkAndResetMonthlyExpenses = async (groupId) => {
  try {
    console.log('📅 월별 지출 초기화 체크 시작...');
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    
    // 매월 1일이 아니면 초기화하지 않음
    if (currentDay !== 1) {
      console.log('🔹 오늘은 월 초기화 날짜가 아닙니다.');
      return { success: true, reset: false, message: '초기화 날짜가 아님' };
    }
    
    // 그룹의 마지막 초기화 날짜 확인
    const groupRef = doc(db, COLLECTIONS.GROUPS, groupId);
    const groupDoc = await getDoc(groupRef);
    
    if (!groupDoc.exists()) {
      throw new Error('그룹을 찾을 수 없습니다.');
    }
    
    const groupData = groupDoc.data();
    const lastResetKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    
    // 이미 이번 달에 초기화했는지 확인
    if (groupData.lastExpenseReset === lastResetKey) {
      console.log('✅ 이번 달 이미 초기화 완료');
      return { success: true, reset: false, message: '이미 초기화됨' };
    }
    
    // 그룹 멤버들의 지출 현황 조회
    const membersExpenses = await getGroupMembersMonthlyExpenses(groupId, currentYear, currentMonth);
    
    console.log('💰 초기화 전 멤버별 지출 현황:', membersExpenses);
    
    // 그룹 문서에 초기화 기록 업데이트
    await updateDoc(groupRef, {
      lastExpenseReset: lastResetKey,
      lastExpenseResetAt: serverTimestamp(),
      previousMonthExpenses: membersExpenses // 이전 달 지출 기록 보관
    });
    
    console.log('✅ 월별 지출 초기화 완료');
    return { 
      success: true, 
      reset: true, 
      resetKey: lastResetKey,
      previousExpenses: membersExpenses,
      message: '초기화 완료' 
    };
    
  } catch (error) {
    console.error('❌ 월별 지출 초기화 실패:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 사용자의 이번달 지출 기록 조회
 */
export const getUserMonthlyExpenses = async (userId, year, month) => {
  try {
    // userId가 없으면 0 반환
    if (!userId) {
      return { ticketPoints: 0, cash: 0, total: 0 };
    }
    // year, month가 제공되지 않은 경우 현재 월 사용
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month || (currentDate.getMonth() + 1);
    
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);
    
    const expensesQuery = query(
      collection(db, COLLECTIONS.MENU_RECORDS),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
    
    const querySnapshot = await getDocs(expensesQuery);
    let totalTicketPoints = 0;
    let totalCash = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.paymentMethod === 'ticket') {
        totalTicketPoints += data.amount || 0;
      } else if (data.paymentMethod === 'cash') {
        totalCash += data.amount || 0;
      }
    });
    
    return {
      ticketPoints: totalTicketPoints,
      cash: totalCash,
      total: totalTicketPoints + totalCash
    };
  } catch (error) {
    // 쿼리 실패 시에도 UI는 0으로 동작하도록 조용히 반환
    console.warn('월별 지출 조회 실패, 0으로 대체합니다:', error?.message || error);
    return {
      ticketPoints: 0,
      cash: 0,
      total: 0
    };
  }
};

/**
 * 모든 사용자 조회
 */
export const getAllUsers = async () => {
  try {
    const usersQuery = query(collection(db, COLLECTIONS.USERS));
    const querySnapshot = await getDocs(usersQuery);
    const users = [];
    
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    return users;
  } catch (error) {
    console.error('사용자 조회 실패:', error);
    return [];
  }
};

/**
 * 레스토랑 이름으로 단일 문서 가져오기
 */
export const getRestaurantByName = async (name) => {
  try {
    const q = query(collection(db, COLLECTIONS.RESTAURANTS), where('name', '==', name), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error('레스토랑 단일 조회 실패:', error);
    return null;
  }
};

/**
 * 레스토랑 ID로 단일 문서 가져오기
 */
export const getRestaurantById = async (id) => {
  try {
    if (!id) return null;
    const ref = doc(db, COLLECTIONS.RESTAURANTS, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (error) {
    console.error('레스토랑 ID 조회 실패:', error);
    return null;
  }
};

// ==================== 메뉴 기록 관리 ====================

/**
 * 메뉴 기록 생성
 */
export const createMenuRecord = async (menuData) => {
  try {
    const menuRef = await addDoc(collection(db, COLLECTIONS.MENU_RECORDS), {
      ...menuData,
      createdAt: serverTimestamp()
    });
    console.log('메뉴 기록 생성 성공:', menuRef.id);
    return menuRef.id;
  } catch (error) {
    console.error('메뉴 기록 생성 실패:', error);
    throw error;
  }
};

/**
 * 사용자의 메뉴 기록 조회
 */
export const getUserMenuRecords = async (userId, limitCount = 50) => {
  try {
    const menuQuery = query(
      collection(db, COLLECTIONS.MENU_RECORDS),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(menuQuery);
    const records = [];
    
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() });
    });
    
    return records;
  } catch (error) {
    console.error('메뉴 기록 조회 실패:', error);
    throw error;
  }
};

// ==================== 유틸리티 함수 ====================

/**
 * 두 지점 간의 거리 계산 (하버사인 공식)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // 미터 단위
};

/**
 * Firestore 타임스탬프를 Date 객체로 변환
 */
export const convertTimestamp = (timestamp) => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

/**
 * Date 객체를 Firestore 타임스탬프로 변환
 */
export const convertToTimestamp = (date) => {
  return Timestamp.fromDate(date);
};

// ==================== 그룹 코드 관리 ====================

/**
 * 6자리 그룹 코드 생성 (영숫자)
 */
const generateGroupCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 그룹 코드 중복 체크
 */
const isGroupCodeUnique = async (code) => {
  try {
    const codeQuery = query(
      collection(db, COLLECTIONS.GROUP_CODES),
      where('code', '==', code),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(codeQuery);
    return querySnapshot.empty;
  } catch (error) {
    console.error('그룹 코드 중복 체크 실패:', error);
    throw error;
  }
};

/**
 * 고유한 그룹 코드 생성 (중복 체크 포함)
 */
const generateUniqueGroupCode = async () => {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const code = generateGroupCode();
    const isUnique = await isGroupCodeUnique(code);
    
    if (isUnique) {
      return code;
    }
    
    attempts++;
  }
  
  throw new Error('고유한 그룹 코드 생성에 실패했습니다.');
};

/**
 * 그룹 코드 생성 및 저장
 */
export const createGroupCode = async (groupId, createdBy) => {
  try {
    const code = await generateUniqueGroupCode();
    
    const codeRef = await addDoc(collection(db, COLLECTIONS.GROUP_CODES), {
      code,
      groupId,
      createdBy,
      isActive: true,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // 30일 후 만료
    });
    
    console.log('그룹 코드 생성 성공:', code);
    return { id: codeRef.id, code };
  } catch (error) {
    console.error('그룹 코드 생성 실패:', error);
    throw error;
  }
};

/**
 * 그룹 코드로 그룹 조회
 */
export const getGroupByCode = async (code) => {
  try {
    const codeQuery = query(
      collection(db, COLLECTIONS.GROUP_CODES),
      where('code', '==', code),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(codeQuery);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const codeDoc = querySnapshot.docs[0];
    const codeData = codeDoc.data();
    
    // 만료 시간 체크
    if (codeData.expiresAt && codeData.expiresAt.toDate() < new Date()) {
      console.log('그룹 코드가 만료되었습니다.');
      return null;
    }
    
    // 그룹 정보 조회
    const group = await getGroup(codeData.groupId);
    return group ? { ...group, codeId: codeDoc.id } : null;
  } catch (error) {
    console.error('그룹 코드 조회 실패:', error);
    throw error;
  }
};

/**
 * 그룹 코드 비활성화
 */
export const deactivateGroupCode = async (codeId) => {
  try {
    const codeRef = doc(db, COLLECTIONS.GROUP_CODES, codeId);
    await updateDoc(codeRef, {
      isActive: false,
      deactivatedAt: serverTimestamp()
    });
    
    console.log('그룹 코드 비활성화 성공');
  } catch (error) {
    console.error('그룹 코드 비활성화 실패:', error);
    throw error;
  }
};

/**
 * 그룹의 활성 코드 조회
 */
export const getActiveGroupCode = async (groupId) => {
  try {
    const codeQuery = query(
      collection(db, COLLECTIONS.GROUP_CODES),
      where('groupId', '==', groupId),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(codeQuery);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const codeDoc = querySnapshot.docs[0];
    return { id: codeDoc.id, ...codeDoc.data() };
  } catch (error) {
    console.error('활성 그룹 코드 조회 실패:', error);
    throw error;
  }
};

/**
 * 초대 링크로 그룹 조회
 */
export const getGroupByInviteLink = async (groupId) => {
  try {
    const group = await getGroup(groupId);
    
    if (!group) {
      return null;
    }
    
    // 그룹이 활성 상태인지 확인
    if (!group.isActive) {
      console.log('비활성화된 그룹입니다.');
      return null;
    }
    
    return group;
  } catch (error) {
    console.error('초대 링크로 그룹 조회 실패:', error);
    throw error;
  }
};

/**
 * 그룹에 멤버 추가
 */
export const addGroupMemberDetailed = async (groupId, userId, userData) => {
  try {
    const groupRef = doc(db, COLLECTIONS.GROUPS, groupId);
    const group = await getGroup(groupId);
    
    if (!group) {
      throw new Error('그룹을 찾을 수 없습니다.');
    }
    
    // 이미 멤버인지 확인
    if (group.members?.includes(userId)) {
      throw new Error('이미 그룹의 멤버입니다.');
    }
    
    // 멤버 추가
    const updatedMembers = [...(group.members || []), userId];
    
    await updateDoc(groupRef, {
      members: updatedMembers,
      updatedAt: serverTimestamp()
    });
    
    // 사용자 정보에 그룹 추가
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    const userGroups = userData.groups || [];
    
    if (!userGroups.includes(groupId)) {
      await updateDoc(userRef, {
        groups: [...userGroups, groupId],
        lastActiveAt: serverTimestamp()
      });
    }
    
    console.log('그룹 멤버 추가 성공:', userId);
    return true;
  } catch (error) {
    console.error('그룹 멤버 추가 실패:', error);
    throw error;
  }
};

// ==================== 이메일 초대 관리 ====================

/**
 * 이메일 초대 생성
 */
export const createEmailInvite = async (groupId, inviteeEmail, invitedBy) => {
  try {
    const inviteRef = await addDoc(collection(db, COLLECTIONS.EMAIL_INVITES), {
      groupId,
      inviteeEmail,
      invitedBy,
      status: 'pending', // pending, accepted, declined, expired
      inviteToken: generateInviteToken(),
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7일 후 만료
    });
    
    console.log('이메일 초대 생성 성공:', inviteRef.id);
    return { id: inviteRef.id, inviteToken: inviteRef.inviteToken };
  } catch (error) {
    console.error('이메일 초대 생성 실패:', error);
    throw error;
  }
};

/**
 * 초대 토큰 생성
 */
const generateInviteToken = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 이메일로 초대 조회
 */
export const getEmailInvite = async (email) => {
  try {
    const inviteQuery = query(
      collection(db, COLLECTIONS.EMAIL_INVITES),
      where('inviteeEmail', '==', email),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(inviteQuery);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const inviteDoc = querySnapshot.docs[0];
    const inviteData = inviteDoc.data();
    
    // 만료 시간 체크
    if (inviteData.expiresAt && inviteData.expiresAt.toDate() < new Date()) {
      console.log('이메일 초대가 만료되었습니다.');
      return null;
    }
    
    // 그룹 정보 조회
    const group = await getGroup(inviteData.groupId);
    return group ? { ...group, inviteId: inviteDoc.id, inviteData } : null;
  } catch (error) {
    console.error('이메일 초대 조회 실패:', error);
    throw error;
  }
};

/**
 * 이메일 초대 수락
 */
export const acceptEmailInvite = async (inviteId, userId, userData) => {
  try {
    const inviteRef = doc(db, COLLECTIONS.EMAIL_INVITES, inviteId);
    const inviteDoc = await getDoc(inviteRef);
    
    if (!inviteDoc.exists()) {
      throw new Error('초대를 찾을 수 없습니다.');
    }
    
    const inviteData = inviteDoc.data();
    
    // 그룹에 멤버 추가
    await addGroupMember(inviteData.groupId, userId, userData);
    
    // 초대 상태 업데이트
    await updateDoc(inviteRef, {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
      acceptedBy: userId
    });
    
    console.log('이메일 초대 수락 성공');
    return true;
  } catch (error) {
    console.error('이메일 초대 수락 실패:', error);
    throw error;
  }
};

/**
 * 이메일 초대 거절
 */
export const declineEmailInvite = async (inviteId) => {
  try {
    const inviteRef = doc(db, COLLECTIONS.EMAIL_INVITES, inviteId);
    
    await updateDoc(inviteRef, {
      status: 'declined',
      declinedAt: serverTimestamp()
    });
    
    console.log('이메일 초대 거절 성공');
    return true;
  } catch (error) {
    console.error('이메일 초대 거절 실패:', error);
    throw error;
  }
};

/**
 * 그룹의 대기 중인 이메일 초대 조회
 */
export const getPendingEmailInvites = async (groupId) => {
  try {
    const inviteQuery = query(
      collection(db, COLLECTIONS.EMAIL_INVITES),
      where('groupId', '==', groupId),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(inviteQuery);
    const invites = [];
    
    querySnapshot.forEach((doc) => {
      invites.push({ id: doc.id, ...doc.data() });
    });
    
    return invites;
  } catch (error) {
    console.error('대기 중인 이메일 초대 조회 실패:', error);
    throw error;
  }
};

// ==================== 멤버 상태 관리 ====================

/**
 * 멤버 상태 저장
 */
export const saveMemberStatus = async (groupId, userId, date, status, details = {}) => {
  try {
    console.log('🔄 Firebase에 멤버 상태 저장 시도:', { groupId, userId, date, status, details });
    
    const statusRef = doc(db, COLLECTIONS.GROUPS, groupId, 'memberStatus', `${userId}_${date}`);
    const statusData = {
      userId,
      date,
      status,
      details,
      updatedAt: new Date()
    };
    
    await setDoc(statusRef, statusData);
    console.log('✅ Firebase 멤버 상태 저장 성공:', { userId, date, status });
    return { success: true };
  } catch (error) {
    console.error('❌ Firebase 멤버 상태 저장 실패:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 멤버 상태 조회
 */
export const getMemberStatus = async (groupId, userId, date) => {
  try {
    const statusRef = doc(db, COLLECTIONS.GROUPS, groupId, 'memberStatus', `${userId}_${date}`);
    const statusSnap = await getDoc(statusRef);
    
    if (statusSnap.exists()) {
      return { success: true, data: statusSnap.data() };
    } else {
      return { success: true, data: null };
    }
  } catch (error) {
    console.error('멤버 상태 조회 실패:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 그룹의 특정 기간 멤버 상태들 조회
 */
export const getGroupMemberStatuses = async (groupId, startDate, endDate) => {
  try {
    const statusRef = collection(db, COLLECTIONS.GROUPS, groupId, 'memberStatus');
    const q = query(
      statusRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
    
    const querySnapshot = await getDocs(q);
    const statuses = {};
    
    console.log('📊 조회된 문서 수:', querySnapshot.size);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📄 문서 데이터:', { docId: doc.id, data });
      
      if (!statuses[data.date]) {
        statuses[data.date] = {};
      }
      statuses[data.date][data.userId] = {
        status: data.status,
        details: data.details
      };
    });
    
    console.log('✅ 그룹 멤버 상태 조회 성공:', Object.keys(statuses).length + '개 날짜');
    console.log('📋 상태 데이터:', statuses);
    return { success: true, data: statuses };
  } catch (error) {
    console.error('그룹 멤버 상태 조회 실패:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 멤버 상태 삭제
 */
export const deleteMemberStatus = async (groupId, userId, date) => {
  try {
    const statusRef = doc(db, COLLECTIONS.GROUPS, groupId, 'memberStatus', `${userId}_${date}`);
    await deleteDoc(statusRef);
    console.log('멤버 상태 삭제 성공:', { userId, date });
    return { success: true };
  } catch (error) {
    console.error('멤버 상태 삭제 실패:', error);
    return { success: false, error: error.message };
  }
};

// 음식점 방문 기록 관리
export const addRestaurantVisit = async (groupId, restaurantName, date, participants = []) => {
  try {
    const visitData = {
      restaurantName,
      date,
      participants,
      groupId,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'restaurantVisits'), visitData);
    console.log('방문 기록 추가 성공:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('방문 기록 추가 실패:', error);
    return { success: false, error };
  }
};

export const getRestaurantVisitCounts = async (groupId, startDate = null, endDate = null) => {
  try {
    let q = query(
      collection(db, 'restaurantVisits'),
      where('groupId', '==', groupId)
    );

    // 날짜 범위 필터링
    if (startDate) {
      q = query(q, where('date', '>=', startDate));
    }
    if (endDate) {
      q = query(q, where('date', '<=', endDate));
    }

    const querySnapshot = await getDocs(q);
    const visitCounts = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const restaurantName = data.restaurantName;
      
      if (visitCounts[restaurantName]) {
        visitCounts[restaurantName]++;
      } else {
        visitCounts[restaurantName] = 1;
      }
    });

    return { success: true, data: visitCounts };
  } catch (error) {
    console.error('방문 횟수 조회 실패:', error);
    return { success: false, error };
  }
};

export const getRestaurantVisitHistory = async (groupId, restaurantName = null) => {
  try {
    let q = query(
      collection(db, 'restaurantVisits'),
      where('groupId', '==', groupId),
      orderBy('date', 'desc')
    );

    if (restaurantName) {
      q = query(q, where('restaurantName', '==', restaurantName));
    }

    const querySnapshot = await getDocs(q);
    const visits = [];

    querySnapshot.forEach((doc) => {
      visits.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, data: visits };
  } catch (error) {
    console.error('방문 기록 조회 실패:', error);
    return { success: false, error };
  }
};

// ==================== 방문 기록 관리 ====================

/**
 * 방문 기록 저장 (캘린더에서 음식점 선택 시 호출)
 */
export const saveVisitRecord = async (userId, groupId, restaurantName, visitDate, participants = []) => {
  try {
    const visitRecord = {
      userId,
      groupId,
      restaurantName,
      visitDate, // YYYY-MM-DD 형식
      participants: participants || [],
      createdAt: serverTimestamp(),
      source: 'calendar', // 캘린더에서 저장된 기록임을 표시
      status: 'pending', // 🆕 하이브리드 시스템: 임시 저장
      confirmedAt: null, // 확정 시간
      cancelledAt: null  // 취소 시간
    };

    const visitRef = await addDoc(collection(db, 'visit_records'), visitRecord);
    console.log('🟡 방문 기록 임시 저장 성공 (pending):', visitRef.id);
    return { success: true, id: visitRef.id, status: 'pending' };
  } catch (error) {
    console.error('방문 기록 저장 실패:', error);
    return { success: false, error };
  }
};

/**
 * 월별 방문 기록 조회
 */
export const getMonthlyVisitRecords = async (groupId, year, month) => {
  try {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    
    // 임시로 orderBy 제거 (인덱스 생성 전까지)
    const q = query(
      collection(db, 'visit_records'),
      where('groupId', '==', groupId),
      where('visitDate', '>=', startDate),
      where('visitDate', '<=', endDate)
      // orderBy('visitDate', 'desc') // 인덱스 생성 후 활성화
    );

    const querySnapshot = await getDocs(q);
    const visits = [];

    querySnapshot.forEach((doc) => {
      visits.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, data: visits };
  } catch (error) {
    console.error('월별 방문 기록 조회 실패:', error);
    return { success: false, error };
  }
};

/**
 * 방문 기록 취소 (당일 내에만 가능)
 */
export const cancelVisitRecord = async (userId, groupId, restaurantName, visitDate) => {
  try {
    const q = query(
      collection(db, 'visit_records'),
      where('userId', '==', userId),
      where('groupId', '==', groupId),
      where('restaurantName', '==', restaurantName),
      where('visitDate', '==', visitDate),
      where('status', '==', 'pending') // pending 상태만 취소 가능
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, error: '취소할 수 있는 방문 기록이 없습니다.' };
    }

    // 가장 최근 기록을 취소
    const visitDoc = querySnapshot.docs[0];
    await updateDoc(visitDoc.ref, {
      status: 'cancelled',
      cancelledAt: serverTimestamp()
    });

    console.log('❌ 방문 기록 취소 성공:', visitDoc.id);
    return { success: true, id: visitDoc.id };
  } catch (error) {
    console.error('방문 기록 취소 실패:', error);
    return { success: false, error };
  }
};

/**
 * 방문 기록 확정 (자동 또는 수동)
 */
export const confirmVisitRecord = async (visitId) => {
  try {
    const visitRef = doc(db, 'visit_records', visitId);
    await updateDoc(visitRef, {
      status: 'confirmed',
      confirmedAt: serverTimestamp()
    });

    console.log('✅ 방문 기록 확정 성공:', visitId);
    return { success: true, id: visitId };
  } catch (error) {
    console.error('방문 기록 확정 실패:', error);
    return { success: false, error };
  }
};

/**
 * 하루 지난 pending 기록들을 자동 확정
 */
export const autoConfirmOldVisits = async (groupId) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const q = query(
      collection(db, 'visit_records'),
      where('groupId', '==', groupId),
      where('status', '==', 'pending'),
      where('visitDate', '<=', yesterdayStr)
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    let count = 0;

    querySnapshot.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'confirmed',
        confirmedAt: serverTimestamp()
      });
      count++;
    });

    if (count > 0) {
      await batch.commit();
      console.log(`🔄 ${count}개의 방문 기록이 자동 확정되었습니다.`);
    }

    return { success: true, confirmedCount: count };
  } catch (error) {
    console.error('자동 확정 실패:', error);
    return { success: false, error };
  }
};

/**
 * 전체 방문 통계 조회 (ExpenseChart용) - 하이브리드 시스템
 */
export const getVisitStatistics = async (groupId, includeMode = 'all') => {
  try {
    // 임시로 orderBy 제거 (인덱스 생성 전까지)
    const q = query(
      collection(db, 'visit_records'),
      where('groupId', '==', groupId)
      // orderBy('createdAt', 'desc') // 인덱스 생성 후 활성화
    );

    const querySnapshot = await getDocs(q);
    const allVisits = [];

    querySnapshot.forEach((doc) => {
      allVisits.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // 모드별 필터링
    let visits = [];
    switch (includeMode) {
      case 'confirmed': // 확정된 것만
        visits = allVisits.filter(visit => visit.status === 'confirmed');
        break;
      case 'pending': // 대기 중인 것만  
        visits = allVisits.filter(visit => visit.status === 'pending');
        break;
      case 'all': // 모두 (취소된 것 제외)
      default:
        visits = allVisits.filter(visit => visit.status !== 'cancelled');
        break;
    }

    // 월별 방문 횟수 계산
    const currentDate = new Date();
    const currentMonth = currentDate.getFullYear() + '-' + String(currentDate.getMonth() + 1).padStart(2, '0');
    
    const monthlyVisits = visits.filter(visit => 
      visit.visitDate && visit.visitDate.startsWith(currentMonth)
    ).length;

    // 음식점별 방문 횟수 계산
    const restaurantVisits = {};
    visits.forEach(visit => {
      const name = visit.restaurantName;
      restaurantVisits[name] = (restaurantVisits[name] || 0) + 1;
    });

    // 상태별 통계
    const statusCounts = {
      pending: allVisits.filter(v => v.status === 'pending').length,
      confirmed: allVisits.filter(v => v.status === 'confirmed').length,
      cancelled: allVisits.filter(v => v.status === 'cancelled').length
    };

    console.log(`📊 방문 통계 조회 완료: 총 ${visits.length}건 (모드: ${includeMode})`);
    console.log('📈 상태별 통계:', statusCounts);

    return { 
      success: true, 
      data: {
        totalVisits: visits.length,
        monthlyVisits,
        restaurantVisits,
        allVisits: visits,
        statusCounts,
        includeMode
      }
    };
  } catch (error) {
    console.error('방문 통계 조회 실패:', error);
    return { success: false, error };
  }
};

// 기존 데이터 마이그레이션을 위한 함수
export const migrateVisitData = async (groupId, visitData) => {
  try {
    const batch = writeBatch(db);
    
    for (const [restaurantName, count] of Object.entries(visitData)) {
      // 각 방문마다 개별 문서 생성 (날짜는 임의로 설정)
      for (let i = 0; i < count; i++) {
        const visitRef = doc(collection(db, 'restaurantVisits'));
        batch.set(visitRef, {
          restaurantName,
          date: `2024-${String(3 + Math.floor(i / 10)).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`, // 3월부터 분산
          participants: [],
          groupId,
          createdAt: serverTimestamp(),
          migrated: true
        });
      }
    }

    await batch.commit();
    console.log('데이터 마이그레이션 완료');
    return { success: true };
  } catch (error) {
    console.error('데이터 마이그레이션 실패:', error);
    return { success: false, error };
  }
};
