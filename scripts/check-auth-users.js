import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
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
const auth = getAuth(app);

async function checkAuthUsers() {
  console.log('🔍 Firebase Auth 계정 확인...\n');
  
  const testAccounts = [
    { email: 'larpore@gmail.com', password: '12345678as' },
    { email: 'lhjin@ekmtc.com', password: '12345678as' },
    { email: 'minseob@ekmtc.com', password: '12345678as' }
  ];
  
  for (const account of testAccounts) {
    try {
      console.log(`테스트: ${account.email}`);
      const userCredential = await signInWithEmailAndPassword(auth, account.email, account.password);
      console.log(`✅ 로그인 성공 - UID: ${userCredential.user.uid}`);
      console.log(`   이메일: ${userCredential.user.email}`);
      console.log(`   이메일 인증: ${userCredential.user.emailVerified}`);
      console.log('');
    } catch (error) {
      console.log(`❌ 로그인 실패: ${error.code} - ${error.message}`);
      console.log('');
    }
  }
}

checkAuthUsers().catch(console.error);
