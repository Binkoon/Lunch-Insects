<template>
  <div class="layout-container">
    <!-- 헤더 -->
    <div class="top-nav">
      <TopNav />
    </div>

    <!-- 주간 캘린더 & 지도 컨테이너 -->
    <div class="content-container">
      <!-- 주간 캘린더 -->
      <div class="calendar-section">
        <Calendar 
          :showModal="showModal" 
          @open-modal="openModal"
          @close-modal="closeModal"
          @add-event="addEvent"
          :newEvent="newEvent"
        />
      </div>

      <!-- 지도 -->
      <div class="map-section">
        <Map />
      </div>
    </div>
  </div>
</template>

<script>
import Calendar from "/src/components/Features/Calendar.vue";
import Map from "/src/components/Features/Map.vue";
import TopNav from "/src/components/Common/TopNav.vue";

export default {
  components: {
    Calendar,
    Map,
    TopNav,
  },
  data() {
    return {
      showModal: false,
      newEvent: { title: "", user: "" },
    };
  },
  methods: {
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.newEvent = { title: "", user: "" };
    },
    addEvent(eventData) {
      console.log("새로운 일정 추가됨:", eventData);
    },
  },
};
</script>

<style scoped>
/* ✅ 전체 레이아웃 */
.layout-container {
  display: flex;
  flex-direction: column;
  width: 100vw; /* ✅ 전체 화면을 차지하도록 수정 */
  gap: 30px;
  padding: 20px;
}

/* ✅ 주간 캘린더 & 지도 컨테이너 */
.content-container {
  display: flex;
  flex-direction: row; /* ✅ 가로 정렬 */
  justify-content: space-between; /* ✅ 양쪽 끝에 배치 */
  align-items: stretch; /* ✅ 세로 길이 맞춤 */
  width: 100vw; /* ✅ 화면 전체 너비 */
  height: auto;
  gap: 20px; /* ✅ 간격 추가 */
}

/* ✅ 주간 캘린더 */
.calendar-section {
  flex: 1; /* ✅ 50% 공간 차지 */
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 450px;
}

/* ✅ 지도 */
.map-section {
  flex: 1; /* ✅ 50% 공간 차지 */
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 450px;
  background: #f9f9f9;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

/* ✅ 반응형: 화면이 작아지면 세로 정렬 */
@media (max-width: 1024px) {
  .content-container {
    flex-direction: column;
    align-items: center;
  }

  .calendar-section,
  .map-section {
    max-width: 100%;
  }
}

</style>
