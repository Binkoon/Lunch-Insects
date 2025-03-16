<template>
  <div class="layout-container">
    <!-- 📌 About 모달 (처음 실행 시만 보임) -->
    <About v-if="showAboutPopup" @close="showAboutPopup = false" />
    <!-- 헤더 -->
    <div class="top-nav">
      <TopNav />
    </div>

    <!-- 📌 주간 캘린더 & 지도 -->
    <div class="row-container">
      <div class="calendar-section">
        <div class="calendar-header">
          <!-- 📌 버튼 추가된 헤더 -->
          <div class="calendar-buttons">
            <CommonButton 
              buttonStyle="primary"
              @click="openMenuCounterModal"
            >
              🍽️ 오늘 뭐 먹었어?
            </CommonButton>

            <CommonButton 
              buttonStyle="secondary"
              @click="openRandomModal"
            >
              🎲 랜덤 메뉴 보기
            </CommonButton>
          </div>
          <Calendar 
            :showModal="showModal"
            @open-modal="openModal"
            @close-modal="closeModal"
            @add-event="addEvent"
            @delete-event="deleteEvent"
            :events="events"
            :preferences="preferences"
          />
        </div>
      </div>

      <div class="map-section">
        <Map />
      </div>
    </div>

    <!-- 📌 🍽️ 메뉴 카운터 모달 -->
    <div v-if="showMenuModal" class="menu-modal-overlay" @click.self="closeMenuCounterModal">
      <div class="menu-modal-content">
        <button class="close-menu-btn" @click="closeMenuCounterModal">✕</button>
        <MenuCounter @close="closeMenuCounterModal" />
      </div>
    </div>

    <!-- 📌 "마지막으로 먹은 메뉴" + "차트" 가로 배치 -->
    <div class="menu-chart-container">
      <div class="last-menu">
        <Cooltime />
      </div>
      <div class="chart-section">
        <MenuChart />
      </div>
    </div>

    <!-- 📌 랜덤 메뉴 모달 -->
    <div v-if="showRandomModal" class="random-modal-overlay" @click.self="closeRandomModal">
      <div class="random-modal-content">
        <button class="close-random-btn" @click="closeRandomModal">✕</button>
        <RandomBox />
      </div>
    </div>

    <!-- 📌 푸터 -->
    <Footer />
  </div>
</template>


<script>
import Calendar from "@/components/Features/Calendar.vue";
import TopNav from "@/components/Common/TopNav.vue";
import Map from "@/components/Features/Map.vue";
import { getAllSchedules, addSchedule, deleteSchedule, deletePreference } from "@/firebase/firebaseDB";
import MenuCounter from "@/components/Features/MenuCounter.vue";
import MenuChart from "@/components/Features/MenuChart.vue";
import Cooltime from "@/components/Features/Cooltime.vue";
import RandomBox from "@/components/Features/RandomBox.vue";
import CommonButton from "@/components/Common/Button.vue";
import Footer from "@/components/Common/Footer.vue";

import About from "@/views/About.vue"; // ✅ About 모달 추가

export default {
  components: {
    Calendar,
    TopNav,
    Map,
    MenuCounter,
    MenuChart,
    Cooltime,
    RandomBox,
    CommonButton,
    Footer,
  },
  data() {
    return {
      showModal: false,
      showMenuModal: false,
      showRandomModal: false, // 🔥 랜덤 모달 상태 추가
      selectedDate: "",
      events: [],
      preferences: [],
    };
  },
  methods: {
    async fetchAllEvents() {
      this.events = await getAllSchedules();
      this.$forceUpdate();
    },
    async deleteEvent(eventId, date, type) {
      let success = false;
      if (type === "schedule") {
        success = await deleteSchedule(eventId);
      } else if (type === "no-event") {
        success = await deletePreference(eventId);
      }
      if (success) {
        await this.fetchAllEvents();
      }
    },
    async addEvent(eventData) {
      let success = await addSchedule(eventData.userId, eventData.date, eventData.reason, [eventData.userId]);
      if (success) {
        await this.fetchAllEvents();
      }
    },
    openModal(date) {
      this.showModal = true;
      this.selectedDate = date;
    },
    closeModal() {
      this.showModal = false;
    },
    openMenuCounterModal() {
      this.showMenuModal = true;
    },
    closeMenuCounterModal() {
      this.showMenuModal = false;
    },
    openRandomModal() {
      this.showRandomModal = true;
    },
    closeRandomModal() {
      this.showRandomModal = false;
    },
  },
  async mounted() {
    await this.fetchAllEvents();
  },
};
</script>

<style scoped>
/* ✅ 전체 레이아웃 */
.layout-container {
  display: flex;
  flex-direction: column;
  width: 100vw;
  padding: 10px;
  align-items: center;
  justify-content: center;
}

/* ✅ 헤더 */
.top-nav, .Footer {
  width: 100%;
}

/* ✅ 캘린더 & 지도 Row */
.row-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 10px;
  margin-top: 20px;
  margin-bottom: 20px;
}

/* ✅ 캘린더 65% / 지도 35% */
.calendar-section {
  flex: 6.5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 1300px; /* 🔥 캘린더 width 고정 */
  position: relative;
}

.map-section {
  flex: 3.5;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* ✅ "마지막으로 먹은 메뉴" & "차트" 가로 배치 */
.menu-chart-container {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  gap: 40px;
  margin-top: 20px;
}

/* ✅ 마지막으로 먹은 메뉴 (Cooltime) - 가로 70% */
.last-menu {
  flex: 7;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* ✅ 차트 (MenuChart) - 가로 30% */
.chart-section {
  flex: 3;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* ✅ 랜덤 메뉴 버튼 */
.random-menu-btn {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* ✅ 랜덤 메뉴 모달 */
.random-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.random-modal-content {
  background: white;
  width: 420px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.3);
  position: relative;
}

/* ✅ 모달 닫기 버튼 */
.close-random-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: red;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
}

.close-random-btn:hover {
  background: darkred;
}

/* ✅ "오늘 뭐 먹었어?" 버튼 (캘린더 헤더 우측) */
.calendar-header-btn {
  position: absolute;
  top: 10px;
  right: 20px;
}

/* ✅ 메뉴 카운터 모달 스타일 */
.menu-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.menu-modal-content {
  background: white;
  width: 420px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.3);
  position: relative;
}

/* ✅ 모달 닫기 버튼 */
.close-menu-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: red;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
}

.close-menu-btn:hover {
  background: darkred;
}

/* 📌 반응형 */
@media (max-width: 1024px) {
  .row-container {
    flex-direction: column;
    align-items: center;
  }

  .calendar-section,
  .map-section,
  .menu-chart-container {
    width: 100%;
    max-width: 600px;
  }

  /* 🔥 모바일에서 세로 정렬 */
  .menu-chart-container {
    flex-direction: column;
    align-items: center;
  }

  .last-menu {
    flex: none;
    width: 100%;
  }

  .chart-menu {
    flex: none;
    width: 100%;
  }
}
</style>
