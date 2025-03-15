<template>
    <div class="cooltime-container">
      <h2>⏳ 마지막으로 먹은 메뉴</h2>
      <table class="cooltime-table">
        <thead>
          <tr>
            <th>사용자</th>
            <th>마지막 먹은 음식</th>
            <th>먹은 날짜</th>
            <th>경과 일수</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(entry, index) in cooltimeData" :key="index" :class="{'cooltime-warning': entry.daysPassed < cooldownLimit}">
            <td>{{ entry.user }}</td>
            <td>{{ entry.restaurant }}</td>
            <td>{{ entry.lastDate }}</td>
            <td>{{ entry.daysPassed }}일 전</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import { getMenuCounts } from "@/firebase/firebaseDB";
  
  export default {
    data() {
      return {
        cooltimeData: [],
        cooldownLimit: 7 // ❄️ 쿨타임 제한 (예: 7일 이내 강조)
      };
    },
    methods: {
      async fetchCooltimeData() {
        try {
          const menuData = await getMenuCounts();
  
          // ✅ 사용자별 가장 최근 먹은 메뉴 찾기
          const latestMenuByUser = {};
          menuData.forEach((entry) => {
            const user = entry.userId;
            if (!latestMenuByUser[user] || new Date(entry.date) > new Date(latestMenuByUser[user].date)) {
              latestMenuByUser[user] = entry;
            }
          });
  
          // ✅ 현재 날짜와 비교하여 경과 일 계산
          const today = new Date();
          this.cooltimeData = Object.keys(latestMenuByUser).map(user => {
            const lastEntry = latestMenuByUser[user];
            const lastDate = new Date(lastEntry.date);
            const daysPassed = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
  
            return {
              user,
              restaurant: lastEntry.restaurant,
              lastDate: lastEntry.date,
              daysPassed
            };
          });
  
          console.log("📌 쿨타임 데이터:", this.cooltimeData);
        } catch (error) {
          console.error("❌ 쿨타임 데이터 가져오기 실패:", error);
        }
      }
    },
    async mounted() {
      await this.fetchCooltimeData();
    }
  };
  </script>
  
  <style scoped>
  .cooltime-container {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    margin: auto;
    text-align: center;
  }
  
  .cooltime-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
  }
  
  .cooltime-table th, .cooltime-table td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: center;
  }
  
  .cooltime-table th {
    background: #f4f4f4;
  }
  
  /* ❄️ 쿨타임 내인 경우 강조 표시 */
  .cooltime-warning {
    background: rgba(255, 99, 71, 0.2); /* 🔥 7일 내 먹은 음식 표시 */
    font-weight: bold;
  }
  </style>
  