// src/firebase/firebaseAuth.js

import { auth } from "./firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
// import { createUser } from "./firebaseDBv2"; // 순환 참조 방지를 위해 주석 처리

// 로그인 함수
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("로그인 성공:", userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error("로그인 실패:", error.message);
    throw error;
  }
};

// 개발환경 허용 이메일 목록
const ALLOWED_EMAILS = [
  import.meta.env.VITE_DEV_USER_EMAIL || 'test@example.com'
];

// 회원가입 함수 (개발환경 제한)
export const signup = async (email, password, userData) => {
  try {
    // 개발환경에서만 특정 이메일 허용
    if (import.meta.env.MODE === 'development' && !ALLOWED_EMAILS.includes(email)) {
      throw new Error('개발환경에서는 허용된 이메일만 사용할 수 있습니다.');
    }
    
    // 프로덕션 환경에서는 회원가입 비활성화
    if (import.meta.env.MODE === 'production') {
      throw new Error('현재 회원가입이 비활성화되어 있습니다.');
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // 사용자 프로필 업데이트
    await updateProfile(user, {
      displayName: userData.name
    });
    
    // Firestore에 사용자 데이터 저장 (별도 함수에서 처리)
    // await createUser({
    //   id: user.uid,
    //   email: user.email,
    //   name: userData.name,
    //   department: userData.department || '',
    //   preferences: userData.preferences || [],
    //   groups: [],
    //   createdAt: new Date(),
    //   lastActiveAt: new Date()
    // });
    
    console.log("회원가입 성공:", user.email);
    return user;
  } catch (error) {
    console.error("회원가입 실패:", error.message);
    throw error;
  }
};

// 로그아웃 함수
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("로그아웃 성공");
  } catch (error) {
    console.error("로그아웃 실패:", error);
    throw error;
  }
};

// 비밀번호 재설정
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("비밀번호 재설정 이메일 전송 성공");
  } catch (error) {
    console.error("비밀번호 재설정 실패:", error.message);
    throw error;
  }
};

// 인증 상태 변경 감지
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// 현재 사용자 가져오기
export const getCurrentUser = () => {
  return auth.currentUser;
};

// 개발용 자동 로그인
export const devAutoLogin = async () => {
  if (import.meta.env.MODE !== 'development') {
    return null;
  }
  
  try {
    const email = import.meta.env.VITE_DEV_USER_EMAIL || 'test@example.com';
    const password = import.meta.env.VITE_DEV_USER_PASSWORD || 'testpassword';
    const user = await login(email, password);
    console.log('🔧 개발용 자동 로그인 성공:', user.email);
    return user;
  } catch (error) {
    console.log('🔧 개발용 계정이 없습니다. 수동으로 로그인해주세요.');
    return null;
  }
};