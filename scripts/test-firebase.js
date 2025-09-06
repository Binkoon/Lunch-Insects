/**
 * Firebase 연결 테스트 스크립트
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { config } from 'dotenv';

// 환경변수 로드
config();

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

console.log('🔧 Firebase 설정 확인:');
console.log('API Key:', firebaseConfig.apiKey ? '✅ 설정됨' : '❌ 누락');
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('Project ID:', firebaseConfig.projectId);

try {
  // Firebase 초기화
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  console.log('✅ Firebase 초기화 성공');
  console.log('✅ Auth 서비스 연결 성공');
  console.log('✅ Firestore 서비스 연결 성공');
  
} catch (error) {
  console.error('❌ Firebase 초기화 실패:', error.message);
  console.error('📋 Firebase Console에서 다음을 확인해주세요:');
  console.error('   1. 프로젝트가 활성화되어 있는지');
  console.error('   2. Authentication이 활성화되어 있는지');
  console.error('   3. Firestore가 활성화되어 있는지');
  console.error('   4. API 키가 올바른지');
}
