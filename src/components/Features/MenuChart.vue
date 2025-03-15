<template>
    <div class="chart-container">
      <h2>📊 메뉴 카운트 차트</h2>
      <canvas ref="menuChart"></canvas>
    </div>
  </template>
  
  <script>
  import { Chart, registerables } from "chart.js";
  import { getMenuCounts } from "@/firebase/firebaseDB"; // ✅ Firestore에서 데이터 가져오기
  
  Chart.register(...registerables);
  
  export default {
    data() {
      return {
        menuChart: null,
        menuData: [],
        userList: ["John", "Jack", "Jane", "Jill"], // ✅ 사용자 리스트
        colors: [
          "rgba(255, 99, 132, 0.6)", // John (빨강)
          "rgba(54, 162, 235, 0.6)", // Jack (파랑)
          "rgba(255, 206, 86, 0.6)", // Jane (노랑)
          "rgba(75, 192, 192, 0.6)", // Jill (초록)
        ],
      };
    },
    methods: {
      /** ✅ Firestore에서 메뉴 카운트 가져오기 */
      async fetchMenuCounts() {
        this.menuData = await getMenuCounts(); // 🔥 Firestore에서 데이터 가져오기
        this.renderChart();
      },
  
      /** ✅ 사용자별 메뉴 카운트 차트 렌더링 */
      renderChart() {
        if (this.menuChart) {
          this.menuChart.destroy(); // 🔥 기존 차트 제거
        }
  
        const ctx = this.$refs.menuChart.getContext("2d");
  
        // 🔥 사용자별 데이터 정리
        const menuCounts = {};
        this.userList.forEach(user => {
          menuCounts[user] = {};
        });
  
        this.menuData.forEach(item => {
          if (!menuCounts[item.userId][item.restaurant]) {
            menuCounts[item.userId][item.restaurant] = 0;
          }
          menuCounts[item.userId][item.restaurant] += item.count || 1; // ✅ count 없으면 기본 1
        });
  
        const allRestaurants = [
          ...new Set(this.menuData.map(item => item.restaurant)),
        ]; // 🔥 모든 음식점 리스트 (중복 제거)
  
        const datasets = this.userList.map((user, index) => ({
          label: `${user} 🍽️`,
          data: allRestaurants.map(
            restaurant => menuCounts[user][restaurant] || 0
          ),
          backgroundColor: this.colors[index],
          borderColor: this.colors[index].replace("0.6", "1"),
          borderWidth: 1,
        }));
  
        this.menuChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: allRestaurants, // X축: 음식점 리스트
            datasets: datasets, // 사용자별 데이터셋
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true },
            },
            plugins: {
              legend: { position: "top" }, // ✅ 범례 상단 배치
            },
          },
        });
      },
    },
    async mounted() {
      await this.fetchMenuCounts(); // 🔥 페이지 로드 시 데이터 가져오기
    },
  };
  </script>
  
  <style scoped>
  .chart-container {
    width: 100%;
    max-width: 700px;
    height: 400px;
    margin: auto;
  }
  </style>
  