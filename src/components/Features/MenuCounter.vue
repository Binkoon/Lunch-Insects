<template>
    <div class="menu-counter-container">
      <h2>🍽️ 오늘 뭐 먹었어?</h2>
  
      <!-- ✅ 음식 선택 폼 -->
      <div class="form-group">
        <label>음식점 선택:</label>
        <select v-model="selectedRestaurant" class="dropdown">
          <option value="" disabled>음식점을 선택하세요</option>
          <option v-for="restaurant in restaurantList" :key="restaurant" :value="restaurant">
            {{ restaurant }}
          </option>
        </select>
      </div>
  
      <div class="form-group">
        <label>사용자:</label>
        <select v-model="selectedUser" class="dropdown">
          <option value="" disabled>사용자를 선택하세요</option>
          <option v-for="user in userList" :key="user" :value="user">{{ user }}</option>
        </select>
      </div>
  
      <div class="form-group">
        <label>날짜:</label>
        <input type="date" v-model="selectedDate" class="date-picker" />
      </div>
  
      <button class="submit-btn" @click="submitMenuCount">등록</button>
  
      <hr />
  
      <!-- ✅ Firestore에서 가져온 메뉴 카운트 리스트 -->
      <h3>🍛 최근 먹은 메뉴</h3>
      <ul class="menu-list">
        <li v-for="(menu, index) in menuCounts" :key="index">
            📌 {{ menu.userId }} - {{ menu.restaurant }} ({{ menu.date }})  
            <span>🍽️ {{ menu.count ?? 1 }}</span> <!-- 🔥 count가 없으면 기본값 1 -->
        </li>
    </ul>
    </div>
  </template>
  
  <script>
  import { addMenuCount, getMenuCounts } from "@/firebase/firebaseDB"; // ✅ Firestore 함수 가져오기
  
  export default {
    data() {
      return {
        selectedRestaurant: "",
        selectedUser: "",
        selectedDate: new Date().toISOString().split("T")[0], // 오늘 날짜 기본값
        menuCounts: [], // 🔥 Firestore에서 불러온 데이터 저장
        restaurantList: [
          "금성관", "리원", "멘무샤", "맥도날드", "맘스터치", "신의주 부대찌개",
          "콜리그", "왕비집", "26층", "26층 (VIP)", "은앤정 닭갈비", 
          "태진옥", "청진동 해장국", "용호동 낙지", "미쓰족발", "칙바이칙",
          "밀피유", "보노보스", "애성회관", "돈우가", "박씨화로구이", 
          "KFC", "BBQ", "신의주 찹쌀순대", "스쿨푸드", "모모카페", "알로프트"
        ],
        userList: ["John", "Jack", "Jane", "Jill"], // ✅ 사용자 리스트
      };
    },
    methods: {
      /** ✅ Firestore에 메뉴 카운트 추가 */
      async submitMenuCount() {
        if (!this.selectedRestaurant || !this.selectedUser || !this.selectedDate) {
          alert("⚠️ 모든 항목을 선택해주세요!");
          return;
        }
  
        try {
          console.log("📌 Firestore에 저장 시도:", {
            userId: this.selectedUser,
            restaurant: this.selectedRestaurant,
            date: this.selectedDate
          });
  
          const success = await addMenuCount(this.selectedUser, this.selectedRestaurant, this.selectedDate);
          
          if (success) {
            console.log("✅ Firestore 메뉴 등록 성공!");
            alert("✅ 메뉴 등록 성공!");
            this.resetForm();
            this.fetchMenuCounts(); // 🔥 Firestore 데이터 다시 불러오기
          } else {
            console.error("❌ Firestore 메뉴 등록 실패!");
            alert("❌ 메뉴 등록 실패! 다시 시도해주세요.");
          }
        } catch (error) {
          console.error("❌ Firestore 메뉴 등록 중 오류 발생:", error);
          alert("❌ 오류 발생! 콘솔을 확인하세요.");
        }
      },
  
      /** ✅ Firestore에서 메뉴 데이터 가져오기 */
      async fetchMenuCounts() {
        console.log("📌 Firestore에서 메뉴 데이터 가져오는 중...");
        
        this.menuCounts = await getMenuCounts();
  
        console.log("📌 가져온 메뉴 데이터:", this.menuCounts);
      },
  
      /** ✅ 입력 폼 초기화 */
      resetForm() {
        this.selectedRestaurant = "";
        this.selectedUser = "";
        this.selectedDate = new Date().toISOString().split("T")[0]; // 오늘 날짜로 초기화
      }
    },
  
    async mounted() {
      await this.fetchMenuCounts(); // 🔥 페이지 로드 시 Firestore 데이터 가져오기
    }
  };
  </script>
  
  <style scoped>
  .menu-counter-container {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    margin: auto;
    text-align: center;
  }
  
  h2, h3 {
    margin-bottom: 15px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
    text-align: left;
  }
  
  label {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .dropdown, .date-picker {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
  }
  
  .submit-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 10px;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
    width: 100%;
  }
  
  .submit-btn:hover {
    background: #0056b3;
  }
  
  /* ✅ Firestore에서 가져온 메뉴 리스트 스타일 */
  .menu-list {
    list-style: none;
    padding: 0;
  }
  
  .menu-list li {
    background: #f9f9f9;
    padding: 10px;
    margin-bottom: 5px;
    border-radius: 5px;
    font-size: 14px;
    text-align: left;
  }
  </style>
  