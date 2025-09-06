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
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase.js';

// 컬렉션 참조
const COLLECTIONS = {
  USERS: 'users',
  GROUPS: 'groups',
  RESTAURANTS: 'restaurants',
  SCHEDULES: 'schedules',
  MENU_RECORDS: 'menuRecords',
  NOTIFICATIONS: 'notifications',
  GROUP_INVITES: 'groupInvites',
  EMAIL_INVITES: 'emailInvites',
  USER_PREFERENCES: 'userPreferences',
  STATISTICS: 'statistics',
  GROUP_CODES: 'groupCodes'
};

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
 * 사용자 정보 조회
 */
export const getUser = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
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
 * 카테고리별 음식점 검색
 */
export const getRestaurantsByCategory = async (category, limitCount = 20) => {
  try {
    const restaurantsQuery = query(
      collection(db, COLLECTIONS.RESTAURANTS),
      where('category', '==', category),
      orderBy('rating', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(restaurantsQuery);
    const restaurants = [];
    
    querySnapshot.forEach((doc) => {
      restaurants.push({ id: doc.id, ...doc.data() });
    });
    
    return restaurants;
  } catch (error) {
    console.error('카테고리별 음식점 검색 실패:', error);
    throw error;
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
export const addGroupMember = async (groupId, userId, userData) => {
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
    const statusRef = doc(db, COLLECTIONS.GROUPS, groupId, 'memberStatus', `${userId}_${date}`);
    const statusData = {
      userId,
      date,
      status,
      details,
      updatedAt: new Date()
    };
    
    await setDoc(statusRef, statusData);
    console.log('멤버 상태 저장 성공:', { userId, date, status });
    return { success: true };
  } catch (error) {
    console.error('멤버 상태 저장 실패:', error);
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
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (!statuses[data.date]) {
        statuses[data.date] = {};
      }
      statuses[data.date][data.userId] = {
        status: data.status,
        details: data.details
      };
    });
    
    console.log('그룹 멤버 상태 조회 성공:', statuses);
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
