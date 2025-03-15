<template>
  <div class="layout-container">
    <!-- 헤더 -->
    <div class="top-nav">
      <TopNav />
    </div>

    <!-- 📌 주간 캘린더 & 지도 -->
    <div class="row-container">
      <div class="calendar-section">
        <Calendar 
          :showModal="showModal"
          @open-modal="openModal"
          @close-modal="closeModal"
          @add-event="addEvent"
          @delete-event="deleteEvent"
          :events="events"
          :preferences="preferences"
        />

        <!-- 📌 캘린더 헤더 우측에 "오늘 뭐 먹었어?" 버튼 배치 -->
        <div class="calendar-header-btn">
          <CommonButton 
            buttonStyle="primary"
            @click="openMenuCounterModal"
          >
            🍽️ 오늘 뭐 먹었어?
          </CommonButton>
        </div>
      </div>

      <div class="map-section">
        <Map />
      </div>
    </div>

    <!-- 📌 🍽️ 메뉴 카운터 모달 (이제 CommonButton과 함께 적용됨) -->
    <div v-if="showMenuModal" class="menu-modal-overlay" @click.self="closeMenuCounterModal">
      <div class="menu-modal-content">
        <button class="close-menu-btn" @click="closeMenuCounterModal">✕</button>
        <MenuCounter @close="closeMenuCounterModal" />
      </div>
    </div>

    <!-- 📌 Cooltime 추가 -->
    <div class="row-container">
      <div class="cooltime-section">
        <Cooltime />
      </div>
    </div>

    <!-- 📌 차트 (단독 Row) -->
    <div class="chart-row">
      <MenuChart />
    </div>
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

import CommonButton from "@/components/Common/Button.vue"; // ✅ 공통 버튼 추가

export default {
  components: {
    Calendar,
    TopNav,
    Map,
    MenuCounter,
    MenuChart,
    Cooltime,
    CommonButton, // ✅ 버튼 추가
  },
  data() {
    return {
      showModal: false, // ✅ 일정 추가 모달 (이건 건드리지 않음)
      showMenuModal: false, // ✅ 메뉴 카운터 모달
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

    // ✅ "오늘 뭐 먹었어?" 클릭 시 실행
    openMenuCounterModal() {
      console.log("✅ MenuCounter 모달 열림");
      this.showMenuModal = true;
    },

    // ✅ 모달 닫기
    closeMenuCounterModal() {
      console.log("❌ MenuCounter 모달 닫힘");
      this.showMenuModal = false;
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
  padding: 20px;
  align-items: center;
  justify-content: center;
}

/* ✅ 헤더 */
.top-nav {
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

/* ✅ 캘린더 60% / 지도 40% */
.calendar-section {
  flex: 6;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  position: relative; /* 🔥 버튼 위치 조정 */
}

.map-section {
  flex: 4;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* ✅ Cooltime 단독 Row */
.cooltime-section {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* ✅ 차트 단독 Row */
.chart-row {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
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
  .cooltime-section,
  .chart-row {
    width: 100%;
    max-width: 600px;
  }
}
</style>
