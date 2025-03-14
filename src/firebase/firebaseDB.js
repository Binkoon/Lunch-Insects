// src/firebase/firebaseDB.js
import { db } from "./firebase";
import { collection, doc, setDoc, getDocs, deleteDoc, getDoc } from "firebase/firestore";

/** ✅ Firestore 일정 추가 함수 */
const addSchedule = async (userId, date, reason, participants = []) => {
  if (!userId || !date) {
    console.error("❌ Firestore 일정 저장 실패: userId 또는 date가 누락됨");
    return false;
  }

  try {
    const scheduleRef = doc(db, "schedules", `${date}_${userId}`);
    await setDoc(scheduleRef, {
      userId,
      date,
      reason,
      participants, // ✅ 항상 배열 유지
      createdAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true });

    console.log("✅ Firestore 일정 저장 성공!");
    return true;
  } catch (error) {
    console.error("❌ Firestore 일정 저장 실패:", error);
    return false;
  }
};

/** ✅ Firestore 희망 음식점 추가 함수 */
const addPreference = async (userId, date, restaurants = [], participants = []) => {
  if (!userId || !date || restaurants.length === 0) {
    console.error("❌ Firestore 희망 음식점 저장 실패: 필요한 정보가 누락됨");
    return false;
  }

  try {
    const prefRef = doc(db, "preferences", `${date}_${userId}`);
    await setDoc(prefRef, {
      userId,
      date,
      restaurants, // ✅ 항상 배열 유지
      participants,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true });

    console.log("✅ Firestore 희망 음식점 저장 성공!");
    return true;
  } catch (error) {
    console.error("❌ Firestore 희망 음식점 저장 실패:", error);
    return false;
  }
};

/** ✅ Firestore에서 전체 일정 가져오기 */
const getAllSchedules = async () => {
  try {
    const schedulesRef = collection(db, "schedules");
    const querySnapshot = await getDocs(schedulesRef);

    let schedules = [];
    querySnapshot.forEach((doc) => {
      schedules.push({ id: doc.id, ...doc.data() });
    });

    console.log("📌 모든 일정 가져오기 성공:", schedules);
    return schedules;
  } catch (error) {
    console.error("❌ 전체 일정 조회 실패:", error);
    return [];
  }
};

/** ✅ Firestore 일정 삭제 */
const deleteSchedule = async (docId) => {
  if (!docId) {
    console.error("❌ Firestore 삭제 실패: 문서 ID가 없음", docId);
    return false;
  }

  try {
    console.log(`📌 Firestore 삭제 시도: schedules/${docId}`);

    const scheduleRef = doc(db, "schedules", docId);
    const scheduleSnap = await getDoc(scheduleRef);

    if (!scheduleSnap.exists()) {
      console.error("❌ 삭제할 일정이 존재하지 않음 (Firestore)", docId);
      return false;
    }

    console.log("✅ Firestore 일정 문서 확인 완료:", scheduleSnap.data());

    await deleteDoc(scheduleRef);
    console.log(`✅ Firestore 일정 삭제 완료: ${docId}`);

    return true;
  } catch (error) {
    console.error("❌ Firestore 일정 삭제 중 오류 발생:", error);
    return false;
  }
};


/** ✅ Firestore 희망 음식점 즉시 삭제 */
const deletePreference = async (docId) => {
  if (!docId) {
    console.error("❌ Firestore 삭제 실패: 문서 ID가 없음", docId);
    return false;
  }

  try {
    await deleteDoc(doc(db, "preferences", docId));
    console.log(`✅ Firestore 희망 음식점 삭제 완료: ${docId}`);
    return true;
  } catch (error) {
    console.error("❌ Firestore 희망 음식점 삭제 실패:", error);
    return false;
  }
};

export {
  addSchedule,
  addPreference,
  getAllSchedules,
  deleteSchedule,
  deletePreference,
};
