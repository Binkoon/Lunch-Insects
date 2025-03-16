<template>
  <div class="cooltime-container">
    <h2>⏳ 마지막으로 먹은 메뉴</h2>

    <!-- ✅ 가로 정렬을 위한 Flex 컨테이너 -->
    <div class="user-list">
      <div v-for="(menus, user) in groupedMenus" :key="user" class="user-section">
        <h3>{{ user }}</h3>
        <table>
          <thead>
            <tr>
              <th>음식점</th>
              <th>먹은 날짜</th>
              <th>경과 일수</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(menu, index) in menus" :key="index" :class="getHighlightClass(menu.daysPassed)">
              <td>{{ menu.restaurant }}</td>
              <td>{{ menu.date }}</td>
              <td>{{ menu.daysPassed }}일 전</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { getMenuCounts } from "@/firebase/firebaseDB";

export default {
  data() {
    return {
      menuCounts: [],
    };
  },
  computed: {
    groupedMenus() {
      let groupedData = {};

      // 🔥 유저별 그룹화 및 정렬
      this.menuCounts.forEach(menu => {
        if (!groupedData[menu.userId]) {
          groupedData[menu.userId] = [];
        }
        groupedData[menu.userId].push({
          ...menu,
          daysPassed: this.getDaysPassed(menu.date),
        });
      });

      // 🔥 유저별 내림차순 정렬 후 5개 제한
      Object.keys(groupedData).forEach(user => {
        groupedData[user] = groupedData[user]
          .sort((a, b) => b.daysPassed - a.daysPassed)
          .slice(0, 5);
      });

      return groupedData;
    }
  },
  methods: {
    getDaysPassed(date) {
      const today = new Date();
      const pastDate = new Date(date);
      const diffTime = Math.abs(today - pastDate);
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    },
    getHighlightClass(days) {
      if (days > 21) return "highlight-red";
      if (days > 14) return "highlight-orange";
      if (days > 7) return "highlight-yellow";
      return "";
    },
    async fetchMenuCounts() {
      this.menuCounts = await getMenuCounts();
    }
  },
  async mounted() {
    await this.fetchMenuCounts();
  }
};
</script>

<style scoped>
.cooltime-container {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 90%;
  margin: auto;
  text-align: center;
}

/* ✅ 유저 리스트 가로 정렬 */
.user-list {
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap; /* 반응형 지원 */
}

/* ✅ 유저별 개별 섹션 */
.user-section {
  flex: 1;
  min-width: 250px;
  max-width: 350px;
  background: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

/* ✅ 테이블 스타일 */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  font-size: 14px;
}

/* ✅ 경과 일수에 따른 색상 변경 */
.highlight-yellow {
  background-color: #fff9c4;
}
.highlight-orange {
  background-color: #ffcc80;
}
.highlight-red {
  background-color: #ff8a80;
}

/* ✅ 반응형 */
@media (max-width: 1024px) {
  .user-list {
    flex-direction: column;
    align-items: center;
  }
}
</style>
