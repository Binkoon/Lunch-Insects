import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkUserGroups() {
  console.log('🔍 사용자 그룹 확인...\n');
  
  try {
    // 모든 그룹 조회
    const groupsSnapshot = await getDocs(collection(db, 'groups'));
    
    console.log(`📊 총 그룹 수: ${groupsSnapshot.docs.length}\n`);
    
    groupsSnapshot.docs.forEach((groupDoc, index) => {
      const groupData = groupDoc.data();
      console.log(`${index + 1}. ${groupData.name} (ID: ${groupDoc.id})`);
      console.log(`   멤버 수: ${groupData.members?.length || 0}`);
      console.log(`   멤버 ID들:`, groupData.members || []);
      console.log('');
    });
    
    // 특정 사용자 ID로 그룹 검색
    const testUserId = 'HJfAyP52Sgb4F1STZWwk4TNysG43'; // larpore@gmail.com의 UID
    console.log(`🔍 사용자 ${testUserId}의 그룹 검색...`);
    
    const userGroupsQuery = query(
      collection(db, 'groups'),
      where('members', 'array-contains', testUserId)
    );
    const userGroupsSnapshot = await getDocs(userGroupsQuery);
    
    console.log(`📊 사용자가 속한 그룹 수: ${userGroupsSnapshot.docs.length}`);
    
    userGroupsSnapshot.docs.forEach((groupDoc, index) => {
      const groupData = groupDoc.data();
      console.log(`${index + 1}. ${groupData.name} (ID: ${groupDoc.id})`);
    });
    
  } catch (error) {
    console.error('❌ 그룹 조회 실패:', error);
  }
}

checkUserGroups().catch(console.error);
