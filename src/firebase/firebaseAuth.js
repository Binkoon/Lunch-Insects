// src/firebase/firebaseAuth.js

// 아직 로그인 기능은 없이, 관리자가 콘솔에서 추가하는 식으로 가는 중. (다만 추후에 로그인 기능 도입할 수도 있음)
import { auth } from "./firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

// 로그인 함수
const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("로그인 실패:", error.message);
    throw error;
  }
};

// 로그아웃 함수
const logout = async () => {
  try {
    await signOut(auth);
    console.log("로그아웃 성공");
  } catch (error) {
    console.error("로그아웃 실패:", error.message);
  }
};

export { login, logout };
