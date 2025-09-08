/**
 * Firebase Auth에 사용자 계정을 생성하는 스크립트
 * 모든 사용자의 초기 비밀번호: 12345678as
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
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
const auth = getAuth(app);

// ==================== 실제 팀원 이메일 목록 ====================

const teamEmails = [
  'larpore@gmail.com',      // 강현빈
  'donghun@ekmtc.com',      // 하동훈
  'songgy@ekmtc.com',       // 송근영
  'hongjh@ekmtc.com',       // 홍종환
  'lhjin@ekmtc.com',        // 이희진
  'minseob@ekmtc.com',      // 송민섭
  'hjchun@ekmtc.com'        // 전하진
];

const defaultPassword = '12345678as';

// ==================== 계정 생성 함수 ====================

async function createUserAccount(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log(`✓ 계정 생성 성공: ${email} (${userCredential.user.uid})`);
    return userCredential.user.uid;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️ 계정이 이미 존재함: ${email}`);
      return null;
    } else {
      console.error(`❌ 계정 생성 실패 (${email}):`, error.message);
      throw error;
    }
  }
}

// ==================== 메인 실행 함수 ====================

async function createAllUserAccounts() {
  console.log('🚀 Firebase Auth 계정 생성 시작...\n');
  console.log(`🔑 초기 비밀번호: ${defaultPassword}\n`);
  
  try {
    const results = [];
    
    for (const email of teamEmails) {
      console.log(`계정 생성 중: ${email}`);
      const uid = await createUserAccount(email, defaultPassword);
      results.push({ email, uid, success: uid !== null });
      
      // 요청 간격을 두어 Firebase 제한을 피함
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n✅ 계정 생성 완료!');
    console.log('\n📊 생성 결과:');
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`- 성공: ${successCount}개`);
    console.log(`- 실패/이미존재: ${failCount}개`);
    
    console.log('\n🔗 생성된 계정 목록:');
    results.forEach(result => {
      const status = result.success ? '✓' : '⚠️';
      console.log(`${status} ${result.email} ${result.uid ? `(${result.uid})` : ''}`);
    });
    
    console.log('\n🎉 모든 팀원이 다음 비밀번호로 로그인할 수 있습니다:');
    console.log(`비밀번호: ${defaultPassword}`);
    
  } catch (error) {
    console.error('❌ 계정 생성 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
createAllUserAccounts().catch(console.error);
