/**
 * 개발환경용 사용자 생성 스크립트
 * Firebase Admin SDK를 사용하여 test1@example.com 계정을 생성합니다.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { config } from 'dotenv';

// 환경변수 로드
config();

// Firebase 설정 (환경변수에서 가져오기)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// 환경변수 검증
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingVars.length > 0) {
  console.error("❌ Firebase 환경변수 누락:", missingVars);
  console.error("📋 .env 파일을 확인하고 Firebase 설정을 완료해주세요.");
  process.exit(1);
}

// Firebase 초기화
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// 개발용 사용자 정보
const DEV_USER = {
  email: 'test1@example.com',
  password: 'test1',
  name: '개발자',
  department: '개발팀',
  preferences: ['korean', 'chinese', 'japanese', 'western']
};

async function createDevUser() {
  try {
    console.log('🔧 개발용 사용자 생성 시작...');
    
    // 기존 계정이 있는지 확인
    try {
      await signInWithEmailAndPassword(auth, DEV_USER.email, DEV_USER.password);
      console.log('✅ 개발용 계정이 이미 존재합니다:', DEV_USER.email);
      return;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // 계정이 없으면 생성
        console.log('📝 새로운 개발용 계정을 생성합니다...');
      } else if (error.code === 'auth/operation-not-allowed') {
        console.error('❌ Firebase Console에서 Email/Password 인증을 활성화해주세요:');
        console.error('   1. Firebase Console → Authentication → Sign-in method');
        console.error('   2. Email/Password 클릭');
        console.error('   3. Enable 토글 켜기');
        console.error('   4. Save 클릭');
        process.exit(1);
      } else {
        throw error;
      }
    }
    
    // 새 계정 생성
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      DEV_USER.email, 
      DEV_USER.password
    );
    
    console.log('✅ 개발용 사용자 생성 성공:', userCredential.user.email);
    console.log('📋 사용자 정보:');
    console.log('   - 이메일:', DEV_USER.email);
    console.log('   - 비밀번호:', DEV_USER.password);
    console.log('   - 이름:', DEV_USER.name);
    console.log('   - 부서:', DEV_USER.department);
    console.log('   - 선호 음식:', DEV_USER.preferences.join(', '));
    
  } catch (error) {
    console.error('❌ 개발용 사용자 생성 실패:', error.message);
    if (error.code === 'auth/operation-not-allowed') {
      console.error('📋 Firebase Console에서 Email/Password 인증을 활성화해주세요!');
    }
    process.exit(1);
  }
}

// 스크립트 실행
createDevUser();
