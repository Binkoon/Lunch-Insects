import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
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
const auth = getAuth(app);

async function checkCurrentUsers() {
  console.log('현재 Firestore 사용자 데이터 확인...\n');
  
  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    
    console.log(`총 사용자 수: ${usersSnapshot.docs.length}\n`);
    
    usersSnapshot.docs.forEach((userDoc, index) => {
      const userData = userDoc.data();
      console.log(`${index + 1}. ${userData.name} (${userData.email})`);
      console.log(`   문서 ID: ${userDoc.id}`);
      console.log(`   내부 id 필드: ${userData.id || '없음'}`);
      console.log(`   authUid 필드: ${userData.authUid || '없음'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('사용자 데이터 조회 실패:', error);
  }
}

checkCurrentUsers().catch(console.error);
