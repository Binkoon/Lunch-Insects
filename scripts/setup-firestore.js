/**
 * Firebase Firestore 컬렉션 설정 및 샘플 데이터 생성 스크립트
 * 식충이 캘린더 v2.0
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import dotenv from 'dotenv';

// 환경변수 로드
dotenv.config();

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 개발환경에서 에뮬레이터 사용 (선택사항)
if (process.env.NODE_ENV === 'development' && process.env.USE_FIRESTORE_EMULATOR === 'true') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔧 Firestore 에뮬레이터에 연결됨');
  } catch (error) {
    console.log('Firestore 에뮬레이터 연결 실패 (이미 연결됨 또는 에뮬레이터 미실행)');
  }
}

// 컬렉션 참조
const COLLECTIONS = {
  USERS: 'users',
  RESTAURANTS: 'restaurants', 
  SCHEDULES: 'schedules',
  GROUPS: 'groups',
  MEMBER_STATUS: 'memberStatus',
  PROPOSALS: 'proposals',
  MENU_RECORDS: 'menuRecords'
};

// ==================== 샘플 데이터 ====================

const sampleUsers = [
  {
    email: 'test1@example.com',
    name: '강현빈',
    department: '개발팀',
    preferences: ['korean', 'japanese'],
    expenses: { ticketPoints: 15000, cash: 25000 },
    location: {
      name: '한진빌딩',
      address: '서울특별시 중구 남대문로 63',
      lat: 37.5665,
      lng: 126.9780
    }
  },
  {
    email: 'test2@example.com',
    name: '하동훈',
    department: '개발팀',
    preferences: ['western', 'chinese'],
    expenses: { ticketPoints: 12000, cash: 30000 },
    location: {
      name: '한진빌딩',
      address: '서울특별시 중구 남대문로 63',
      lat: 37.5665,
      lng: 126.9780
    }
  },
  {
    email: 'test3@example.com',
    name: '송근영',
    department: '개발팀',
    preferences: ['korean', 'fastfood'],
    expenses: { ticketPoints: 8000, cash: 20000 },
    location: {
      name: '한진빌딩',
      address: '서울특별시 중구 남대문로 63',
      lat: 37.5665,
      lng: 126.9780
    }
  },
  {
    email: 'test4@example.com',
    name: '홍종환',
    department: '개발팀',
    preferences: ['japanese', 'western'],
    expenses: { ticketPoints: 20000, cash: 15000 },
    location: {
      name: '한진빌딩',
      address: '서울특별시 중구 남대문로 63',
      lat: 37.5665,
      lng: 126.9780
    }
  }
];

const sampleRestaurants = [
  {
    name: '금성관',
    category: 'korean',
    location: {
      address: '서울특별시 중구 남대문로 63',
      lat: 37.5665,
      lng: 126.9780
    },
    rating: 4.2,
    priceRange: '8,000원',
    distance: 300,
    walkingTime: 4,
    description: '전통 한식당',
    phone: '02-1234-5678'
  },
  {
    name: '돈우가',
    category: 'japanese',
    location: {
      address: '서울특별시 중구 남대문로 65',
      lat: 37.5667,
      lng: 126.9782
    },
    rating: 4.2,
    priceRange: '12,000원',
    distance: 700,
    walkingTime: 9,
    description: '일식 돈까스 전문점',
    phone: '02-1234-5679'
  },
  {
    name: '리원',
    category: 'chinese',
    location: {
      address: '서울특별시 중구 남대문로 67',
      lat: 37.5669,
      lng: 126.9784
    },
    rating: 4.0,
    priceRange: '15,000원',
    distance: 500,
    walkingTime: 6,
    description: '중식당',
    phone: '02-1234-5680'
  },
  {
    name: '바스버거',
    category: 'fastfood',
    location: {
      address: '서울특별시 중구 남대문로 69',
      lat: 37.5671,
      lng: 126.9786
    },
    rating: 4.1,
    priceRange: '9,000원',
    distance: 400,
    walkingTime: 5,
    description: '햄버거 전문점',
    phone: '02-1234-5681'
  },
  {
    name: '맘스터치',
    category: 'fastfood',
    location: {
      address: '서울특별시 중구 남대문로 71',
      lat: 37.5673,
      lng: 126.9788
    },
    rating: 3.8,
    priceRange: '7,000원',
    distance: 600,
    walkingTime: 8,
    description: '치킨 전문점',
    phone: '02-1234-5682'
  }
];

// ==================== 데이터 생성 함수 ====================

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';

async function createUserDocument(userData) {
  try {
    const userRef = await addDoc(collection(db, COLLECTIONS.USERS), {
      ...userData,
      isActive: true,
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`✓ 사용자 생성: ${userData.name} (${userRef.id})`);
    return userRef.id;
  } catch (error) {
    console.error(`사용자 생성 실패 (${userData.name}):`, error);
    throw error;
  }
}

async function createRestaurantDocument(restaurantData) {
  try {
    const restaurantRef = await addDoc(collection(db, COLLECTIONS.RESTAURANTS), {
      ...restaurantData,
      visitCount: 0,
      lastVisited: null,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`✓ 음식점 생성: ${restaurantData.name} (${restaurantRef.id})`);
    return restaurantRef.id;
  } catch (error) {
    console.error(`음식점 생성 실패 (${restaurantData.name}):`, error);
    throw error;
  }
}

async function createGroupDocument(groupData) {
  try {
    const groupRef = await addDoc(collection(db, COLLECTIONS.GROUPS), {
      ...groupData,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`✓ 그룹 생성: ${groupData.name} (${groupRef.id})`);
    return groupRef.id;
  } catch (error) {
    console.error(`그룹 생성 실패 (${groupData.name}):`, error);
    throw error;
  }
}

async function createScheduleDocument(scheduleData) {
  try {
    const scheduleRef = await addDoc(collection(db, COLLECTIONS.SCHEDULES), {
      ...scheduleData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`✓ 일정 생성: ${scheduleData.title} (${scheduleRef.id})`);
    return scheduleRef.id;
  } catch (error) {
    console.error(`일정 생성 실패 (${scheduleData.title}):`, error);
    throw error;
  }
}

async function createProposalDocument(proposalData) {
  try {
    const proposalRef = await addDoc(collection(db, COLLECTIONS.PROPOSALS), {
      ...proposalData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`✓ 제안 생성: ${proposalData.restaurant.name} (${proposalRef.id})`);
    return proposalRef.id;
  } catch (error) {
    console.error(`제안 생성 실패 (${proposalData.restaurant.name}):`, error);
    throw error;
  }
}

// ==================== 메인 실행 함수 ====================

async function setupFirestore() {
  console.log('🚀 Firebase Firestore 설정 시작...\n');
  
  try {
    // 1. 컬렉션 존재 확인 및 생성
    console.log('📋 컬렉션 존재 확인 및 생성 중...');
    const collections = Object.values(COLLECTIONS);
    
    for (const collectionName of collections) {
      try {
        const testQuery = query(collection(db, collectionName), limit(1));
        await getDocs(testQuery);
        console.log(`✓ ${collectionName} 컬렉션 확인 완료`);
      } catch (error) {
        if (error.code === 'permission-denied') {
          console.log(`⚠️  ${collectionName} 컬렉션 접근 실패 - 권한 문제`);
        } else {
          console.log(`⚠️  ${collectionName} 컬렉션 접근 실패:`, error.message);
        }
      }
    }
    
    console.log('\n👥 사용자 데이터 생성 중...');
    const userIds = [];
    for (const user of sampleUsers) {
      const userId = await createUserDocument(user);
      userIds.push(userId);
    }
    
    console.log('\n🍽️ 음식점 데이터 생성 중...');
    const restaurantIds = [];
    for (const restaurant of sampleRestaurants) {
      const restaurantId = await createRestaurantDocument(restaurant);
      restaurantIds.push(restaurantId);
    }
    
    console.log('\n👥 그룹 데이터 생성 중...');
    const groupId = await createGroupDocument({
      name: '개발팀',
      description: '개발팀 점심 모임',
      members: userIds,
      admin: userIds[0],
      inviteCode: 'DEV123',
      inviteLink: 'https://lunch-insects.com/join/dev123',
      settings: {
        allowMemberInvite: true,
        requireApproval: false,
        maxMembers: 50
      }
    });
    
    console.log('\n📅 일정 데이터 생성 중...');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const scheduleId = await createScheduleDocument({
      groupId: groupId,
      date: tomorrow.toISOString().split('T')[0], // YYYY-MM-DD
      time: '12:00',
      title: '개발팀 점심 모임',
      description: '금성관에서 한식 점심',
      type: 'meal',
      restaurant: {
        id: restaurantIds[0],
        name: '금성관',
        category: 'korean',
        address: '서울특별시 중구 남대문로 63'
      },
      participants: userIds,
      organizer: userIds[0],
      status: 'scheduled'
    });
    
    console.log('\n💡 제안 데이터 생성 중...');
    const proposalId = await createProposalDocument({
      groupId: groupId,
      date: tomorrow.toISOString().split('T')[0],
      restaurant: {
        id: restaurantIds[1],
        name: '돈우가',
        category: 'japanese',
        distance: 700,
        rating: 4.2,
        priceRange: '12,000원'
      },
      proposer: {
        id: userIds[1],
        name: '하동훈'
      },
      votes: {
        accepted: [userIds[1]],
        rejected: []
      },
      status: 'pending'
    });
    
    console.log('\n✅ Firebase Firestore 설정 완료!');
    console.log('\n📊 생성된 데이터 요약:');
    console.log(`- 사용자: ${userIds.length}명`);
    console.log(`- 음식점: ${restaurantIds.length}개`);
    console.log(`- 그룹: 1개 (${groupId})`);
    console.log(`- 일정: 1개 (${scheduleId})`);
    console.log(`- 제안: 1개 (${proposalId})`);
    
    console.log('\n🔗 테스트 계정:');
    console.log('- test1@example.com (강현빈)');
    console.log('- test2@example.com (하동훈)');
    console.log('- test3@example.com (송근영)');
    console.log('- test4@example.com (홍종환)');
    
    console.log('\n🎉 설정이 완료되었습니다! 이제 앱을 실행해보세요.');
    
  } catch (error) {
    console.error('❌ Firebase Firestore 설정 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
setupFirestore().catch(console.error);

export { setupFirestore };
