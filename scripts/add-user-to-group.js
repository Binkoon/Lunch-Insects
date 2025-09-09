import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
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

async function addUserToGroup() {
  console.log('🔧 사용자를 그룹에 추가...\n');
  
  try {
    // 모든 그룹 조회
    const groupsSnapshot = await getDocs(collection(db, 'groups'));
    
    if (groupsSnapshot.docs.length === 0) {
      console.log('❌ 그룹이 없습니다.');
      return;
    }
    
    const groupDoc = groupsSnapshot.docs[0]; // 첫 번째 그룹 사용
    const groupData = groupDoc.data();
    const groupId = groupDoc.id;
    
    console.log(`📊 그룹: ${groupData.name} (ID: ${groupId})`);
    console.log(`현재 멤버 수: ${groupData.members?.length || 0}`);
    console.log(`현재 멤버들:`, groupData.members || []);
    
    // 사용자 ID들 (Firestore users 컬렉션의 문서 ID들)
    const userIds = [
      'HJfAyP52Sgb4F1STZWwk4TNysG43', // larpore@gmail.com
      'KGr3pqOS9hgPPoEa7f8HDOgzpgF3', // lhjin@ekmtc.com
      'S2jUOErjPfRt31RvrGHhR7zboF32', // minseob@ekmtc.com
      'SM2sR3SrvmUydfK4kUYzLhs0EYs2', // hongjh@ekmtc.com
      'WT76Sjtoy9YVyj6MJks0fpunT613', // hjchun@ekmtc.com
      'bPPynPG6owM53bK9DnjZNEOAEjp2', // songgy@ekmtc.com
      'wUCjxQTj2BbKFLcdSkbXnkRnz1j1'  // donghun@ekmtc.com
    ];
    
    // 그룹의 members 배열 업데이트
    await updateDoc(doc(db, 'groups', groupId), {
      members: userIds
    });
    
    console.log('✅ 그룹 멤버 업데이트 완료!');
    console.log(`새로운 멤버 수: ${userIds.length}`);
    console.log('멤버 ID들:', userIds);
    
  } catch (error) {
    console.error('❌ 그룹 업데이트 실패:', error);
  }
}

addUserToGroup().catch(console.error);
