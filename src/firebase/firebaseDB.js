// src/firebase/firebaseDB.js
import { db } from "./firebase";
import { collection, doc, setDoc, getDocs, deleteDoc, query, where } from "firebase/firestore";

/** ✅ Firestore 일정 추가 함수 */
const addSchedule = async (userId, date, reason, participants) => {
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
      participants,
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
const addPreference = async (userId, date, restaurants, participants) => {
  if (!userId || !date || !restaurants.length) {
    console.error("❌ Firestore 희망 음식점 저장 실패: 필요한 정보가 누락됨");
    return false;
  }

  try {
    const prefRef = doc(db, "preferences", `${date}_${userId}`);
    await setDoc(prefRef, {
      userId,
      date,
      restaurants,
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

  

/** ✅ 특정 날짜의 희망 음식점 가져오기 */
const getPreferencesByDate = async (date) => {
  if (!date) return [];

  try {
    const preferencesRef = collection(db, "preferences");
    const q = query(preferencesRef, where("date", "==", date));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(`📌 해당 날짜(${date}) 희망 음식점 없음`);
      return [];
    }

    let preferences = [];
    querySnapshot.forEach((doc) => {
      preferences.push({ id: doc.id, ...doc.data() });
    });

    console.log(`📌 불러온 희망 음식점(${date}):`, preferences);
    return preferences;
  } catch (error) {
    console.error("❌ 희망 음식점 조회 실패:", error);
    return [];
  }
};

/** ✅ Firestore 일정 삭제 */
const deleteSchedule = async (docId) => {
  if (!docId) return false;

  try {
    await deleteDoc(doc(db, "schedules", docId));
    console.log(`✅ 일정 삭제 완료: ${docId}`);
    return true;
  } catch (error) {
    console.error("❌ 일정 삭제 실패:", error);
    return false;
  }
};

/** ✅ Firestore 희망 음식점 삭제 */
const deletePreference = async (docId) => {
  if (!docId) return false;

  try {
    await deleteDoc(doc(db, "preferences", docId));
    console.log(`✅ 희망 음식점 삭제 완료: ${docId}`);
    return true;
  } catch (error) {
    console.error("❌ 희망 음식점 삭제 실패:", error);
    return false;
  }
};

export {
  addSchedule,
  addPreference,
  getAllSchedules,
  getPreferencesByDate,
  deleteSchedule,
  deletePreference,
};
