/**
 * 실제 팀원 데이터로 업데이트하는 스크립트
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
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

// ==================== 실제 팀원 데이터 ====================

const realUsers = [
  {
    email: 'larpore@gmail.com',
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
    email: 'donghun@ekmtc.com',
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
    email: 'songgy@ekmtc.com',
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
    email: 'hongjh@ekmtc.com',
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
  },
  {
    email: 'lhjin@ekmtc.com',
    name: '이희진',
    department: '개발팀',
    preferences: ['korean', 'chinese'],
    expenses: { ticketPoints: 10000, cash: 18000 },
    location: {
      name: '한진빌딩',
      address: '서울특별시 중구 남대문로 63',
      lat: 37.5665,
      lng: 126.9780
    }
  },
  {
    email: 'minseob@ekmtc.com',
    name: '송민섭',
    department: '개발팀',
    preferences: ['japanese', 'fastfood'],
    expenses: { ticketPoints: 14000, cash: 22000 },
    location: {
      name: '한진빌딩',
      address: '서울특별시 중구 남대문로 63',
      lat: 37.5665,
      lng: 126.9780
    }
  },
  {
    email: 'hjchun@ekmtc.com',
    name: '전하진',
    department: '개발팀',
    preferences: ['western', 'korean'],
    expenses: { ticketPoints: 16000, cash: 28000 },
    location: {
      name: '한진빌딩',
      address: '서울특별시 중구 남대문로 63',
      lat: 37.5665,
      lng: 126.9780
    }
  }
];

// ==================== 실제 음식점 데이터 ====================

const realRestaurants = [
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
  },
  {
    name: '신의주부대찌개',
    category: 'korean',
    location: {
      address: '서울특별시 중구 남대문로 73',
      lat: 37.5675,
      lng: 126.9790
    },
    rating: 4.3,
    priceRange: '9,000원',
    distance: 800,
    walkingTime: 10,
    description: '부대찌개 전문점',
    phone: '02-1234-5683'
  },
  {
    name: '태진옥',
    category: 'korean',
    location: {
      address: '서울특별시 중구 남대문로 75',
      lat: 37.5677,
      lng: 126.9792
    },
    rating: 4.1,
    priceRange: '10,000원',
    distance: 900,
    walkingTime: 11,
    description: '냉면 전문점',
    phone: '02-1234-5684'
  },
  {
    name: '이가네양꼬치',
    category: 'chinese',
    location: {
      address: '서울특별시 중구 남대문로 77',
      lat: 37.5679,
      lng: 126.9794
    },
    rating: 4.4,
    priceRange: '18,000원',
    distance: 1000,
    walkingTime: 12,
    description: '양꼬치 전문점',
    phone: '02-1234-5685'
  },
  {
    name: '분지로',
    category: 'japanese',
    location: {
      address: '서울특별시 중구 남대문로 79',
      lat: 37.5681,
      lng: 126.9796
    },
    rating: 4.0,
    priceRange: '13,000원',
    distance: 1200,
    walkingTime: 15,
    description: '일식 라면 전문점',
    phone: '02-1234-5686'
  },
  {
    name: '밀피유',
    category: 'western',
    location: {
      address: '서울특별시 중구 남대문로 81',
      lat: 37.5683,
      lng: 126.9798
    },
    rating: 4.2,
    priceRange: '16,000원',
    distance: 1300,
    walkingTime: 16,
    description: '이탈리안 레스토랑',
    phone: '02-1234-5687'
  },
  {
    name: '은앤정닭갈비',
    category: 'korean',
    location: {
      address: '서울특별시 중구 남대문로 83',
      lat: 37.5685,
      lng: 126.9800
    },
    rating: 4.3,
    priceRange: '14,000원',
    distance: 1400,
    walkingTime: 17,
    description: '닭갈비 전문점',
    phone: '02-1234-5688'
  },
  {
    name: '보노보스햄버거',
    category: 'fastfood',
    location: {
      address: '서울특별시 중구 남대문로 85',
      lat: 37.5687,
      lng: 126.9802
    },
    rating: 4.0,
    priceRange: '8,500원',
    distance: 1500,
    walkingTime: 18,
    description: '프리미엄 햄버거',
    phone: '02-1234-5689'
  },
  {
    name: '미쓰족발',
    category: 'korean',
    location: {
      address: '서울특별시 중구 남대문로 87',
      lat: 37.5689,
      lng: 126.9804
    },
    rating: 4.1,
    priceRange: '25,000원',
    distance: 1600,
    walkingTime: 20,
    description: '족발 전문점',
    phone: '02-1234-5690'
  },
  {
    name: '대한곱창',
    category: 'korean',
    location: {
      address: '서울특별시 중구 남대문로 89',
      lat: 37.5691,
      lng: 126.9806
    },
    rating: 4.2,
    priceRange: '20,000원',
    distance: 1700,
    walkingTime: 21,
    description: '곱창 전문점',
    phone: '02-1234-5691'
  },
  {
    name: '월가갈비',
    category: 'korean',
    location: {
      address: '서울특별시 중구 남대문로 91',
      lat: 37.5693,
      lng: 126.9808
    },
    rating: 4.5,
    priceRange: '35,000원',
    distance: 1800,
    walkingTime: 22,
    description: '프리미엄 갈비',
    phone: '02-1234-5692'
  },
  {
    name: '창고43',
    category: 'western',
    location: {
      address: '서울특별시 중구 남대문로 93',
      lat: 37.5695,
      lng: 126.9810
    },
    rating: 4.3,
    priceRange: '22,000원',
    distance: 1900,
    walkingTime: 23,
    description: '스테이크 전문점',
    phone: '02-1234-5693'
  },
  {
    name: 'KFC',
    category: 'fastfood',
    location: {
      address: '서울특별시 중구 남대문로 95',
      lat: 37.5697,
      lng: 126.9812
    },
    rating: 3.9,
    priceRange: '6,000원',
    distance: 2000,
    walkingTime: 25,
    description: '케이에프씨',
    phone: '02-1234-5694'
  },
  {
    name: '26층 구내식당',
    category: 'korean',
    location: {
      address: '서울특별시 중구 남대문로 63',
      lat: 37.5665,
      lng: 126.9780
    },
    rating: 3.5,
    priceRange: '5,000원',
    distance: 0,
    walkingTime: 0,
    description: '사내 구내식당',
    phone: '02-1234-5695'
  },
  {
    name: '정신라멘',
    category: 'japanese',
    location: {
      address: '서울특별시 중구 남대문로 97',
      lat: 37.5699,
      lng: 126.9814
    },
    rating: 4.4,
    priceRange: '11,000원',
    distance: 2100,
    walkingTime: 26,
    description: '라멘 전문점',
    phone: '02-1234-5696'
  },
  {
    name: '멘무샤',
    category: 'japanese',
    location: {
      address: '서울특별시 중구 남대문로 99',
      lat: 37.5701,
      lng: 126.9816
    },
    rating: 4.1,
    priceRange: '9,500원',
    distance: 2200,
    walkingTime: 27,
    description: '일식 라면',
    phone: '02-1234-5697'
  },
  {
    name: '콜리그',
    category: 'western',
    location: {
      address: '서울특별시 중구 남대문로 101',
      lat: 37.5703,
      lng: 126.9818
    },
    rating: 4.2,
    priceRange: '18,000원',
    distance: 2300,
    walkingTime: 28,
    description: '이탈리안 파스타',
    phone: '02-1234-5698'
  },
  {
    name: '행복한소바',
    category: 'japanese',
    location: {
      address: '서울특별시 중구 남대문로 103',
      lat: 37.5705,
      lng: 126.9820
    },
    rating: 4.2,
    priceRange: '8,500원',
    distance: 2400,
    walkingTime: 30,
    description: '소바 전문점',
    phone: '02-1234-5699'
  },
  {
    name: '청진동해장국',
    category: 'korean',
    location: {
      address: '서울특별시 중구 남대문로 105',
      lat: 37.5707,
      lng: 126.9822
    },
    rating: 4.3,
    priceRange: '7,000원',
    distance: 2500,
    walkingTime: 31,
    description: '해장국 전문점',
    phone: '02-1234-5700'
  },
  {
    name: '박씨화로구이',
    category: 'korean',
    location: {
      address: '서울특별시 중구 남대문로 107',
      lat: 37.5709,
      lng: 126.9824
    },
    rating: 4.4,
    priceRange: '28,000원',
    distance: 2600,
    walkingTime: 32,
    description: '화로구이 전문점',
    phone: '02-1234-5701'
  },
  {
    name: '우대포블랙',
    category: 'western',
    location: {
      address: '서울특별시 중구 남대문로 109',
      lat: 37.5711,
      lng: 126.9826
    },
    rating: 4.5,
    priceRange: '35,000원',
    distance: 2700,
    walkingTime: 33,
    description: '프리미엄 스테이크',
    phone: '02-1234-5702'
  },
  {
    name: '풍닭',
    category: 'korean',
    location: {
      address: '서울특별시 중구 남대문로 111',
      lat: 37.5713,
      lng: 126.9828
    },
    rating: 4.1,
    priceRange: '12,000원',
    distance: 2800,
    walkingTime: 35,
    description: '치킨 전문점',
    phone: '02-1234-5703'
  }
];

// ==================== 데이터 생성 함수 ====================

async function createUserDocument(userData) {
  try {
    const userRef = await addDoc(collection(db, 'users'), {
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
    const restaurantRef = await addDoc(collection(db, 'restaurants'), {
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
    const groupRef = await addDoc(collection(db, 'groups'), {
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

// ==================== 기존 데이터 삭제 함수 ====================

async function clearCollection(collectionName) {
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log(`✓ ${collectionName} 컬렉션 데이터 삭제 완료`);
  } catch (error) {
    console.error(`${collectionName} 컬렉션 삭제 실패:`, error);
  }
}

// ==================== 메인 실행 함수 ====================

async function updateRealData() {
  console.log('🚀 실제 팀원 데이터로 업데이트 시작...\n');
  
  try {
    // 1. 기존 데이터 삭제
    console.log('🗑️ 기존 데이터 삭제 중...');
    await clearCollection('users');
    await clearCollection('restaurants');
    await clearCollection('groups');
    await clearCollection('schedules');
    await clearCollection('proposals');
    await clearCollection('menuRecords');
    
    // 2. 실제 사용자 데이터 생성
    console.log('\n👥 실제 사용자 데이터 생성 중...');
    const userIds = [];
    for (const user of realUsers) {
      const userId = await createUserDocument(user);
      userIds.push(userId);
    }
    
    // 3. 실제 음식점 데이터 생성
    console.log('\n🍽️ 실제 음식점 데이터 생성 중...');
    const restaurantIds = [];
    for (const restaurant of realRestaurants) {
      const restaurantId = await createRestaurantDocument(restaurant);
      restaurantIds.push(restaurantId);
    }
    
    // 4. DT 4인방 그룹 생성
    console.log('\n👥 DT 4인방 그룹 생성 중...');
    const groupId = await createGroupDocument({
      name: 'DT 4인방',
      description: 'DT 4인방 점심 모임',
      members: userIds,
      admin: userIds[0], // 강현빈이 관리자
      inviteCode: 'DT4INBANG',
      inviteLink: 'https://lunch-insects.com/join/dt4inbang',
      settings: {
        allowMemberInvite: true,
        requireApproval: false,
        maxMembers: 10
      }
    });
    
    console.log('\n✅ 실제 데이터 업데이트 완료!');
    console.log('\n📊 생성된 데이터 요약:');
    console.log(`- 사용자: ${userIds.length}명`);
    console.log(`- 음식점: ${restaurantIds.length}개`);
    console.log(`- 그룹: 1개 (${groupId})`);
    
    console.log('\n🔗 실제 팀원 계정:');
    realUsers.forEach(user => {
      console.log(`- ${user.email} (${user.name})`);
    });
    
    console.log('\n🎉 DT 4인방 데이터 설정이 완료되었습니다!');
    
  } catch (error) {
    console.error('❌ 실제 데이터 업데이트 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
updateRealData().catch(console.error);
