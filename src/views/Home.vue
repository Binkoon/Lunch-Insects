<template>
    <div class="layout-container">
      <!-- 헤더 -->
      <div class="top-nav">
        <TopNav />
      </div>
  
      <div class="content-container">
        <!-- 주간 캘린더 -->
        <div class="calendar-section">
          <Calendar 
            :showModal="showModal" 
            @open-modal="openModal"
            @close-modal="closeModal"
            @add-event="addEvent"
            :events="events" 
            :preferences="preferences"
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
  import Calendar from "@/components/Features/Calendar.vue";
  import TopNav from "@/components/Common/TopNav.vue";
  import Map from "@/components/Features/Map.vue"; // ✅ 지도 컴포넌트 추가
  import { getAllSchedules, addSchedule } from "@/firebase/firebaseDB"; 
  
  export default {
    components: {
      Calendar,
      TopNav,
      Map, // ✅ Map 추가
    },
    data() {
      return {
        showModal: false,
        selectedDate: "",
        events: [], // ✅ 모든 일정을 저장할 배열
        preferences: [] // ✅ 희망 음식점 데이터 (필요 시 활용)
      };
    },
    methods: {
      /** ✅ Firestore에서 모든 일정 불러오기 */
      async fetchAllEvents() {
        console.log("📌 Firestore에서 전체 일정 불러오는 중...");
  
        this.events = await getAllSchedules();
        console.log("📌 가져온 일정 데이터:", this.events);
  
        this.$forceUpdate(); // 🔥 UI 강제 업데이트
      },

      /** ✅ Firestore 일정 삭제 */
      async deleteEvent(eventId, date) {
        console.log(`🗑️ Firestore 일정 삭제 요청: eventId=${eventId}, date=${date}`);
        const success = await deleteSchedule(eventId);
        if (success) {
          console.log("✅ Firestore에서 일정 삭제 완료!");
          await this.fetchAllEvents(); // 🔥 삭제 후 전체 일정 다시 불러오기
        } else {
          console.error("❌ Firestore에서 일정 삭제 실패");
        }
      },
  
      /** ✅ 일정 추가 */
      async addEvent(eventData) {
        console.log("📌 새로운 일정 추가 요청:", eventData);
  
        // 🔍 eventData 구조 확인
      if (!eventData || typeof eventData !== "object") {
        console.error("❌ Firestore 저장 실패: eventData가 올바르지 않음", eventData);
        return;
      }
  
        try {
          let success = await addSchedule(
            eventData.userId,  
            eventData.date,    
            eventData.reason,  
            [eventData.userId] 
          );
  
          if (success) {
            console.log("✅ Firestore 저장 성공! 모든 일정 다시 불러옵니다.");
            await this.fetchAllEvents();
          } else {
            console.error("❌ Firestore 저장 실패!");
          }
        } catch (error) {
          console.error("❌ Firestore 저장 중 오류 발생:", error);
        }
      },
  
      openModal(date) {
        this.showModal = true;
        this.selectedDate = date;
      },
  
      closeModal() {
        this.showModal = false;
      }
    },
  
    async mounted() {
      await this.fetchAllEvents(); // 🔥 페이지 로드 시 모든 일정 가져오기
    },
  };
  </script>
  
  <style scoped>
  /* ✅ 기존 스타일 유지 */
  .layout-container {
    display: flex;
    flex-direction: column;
    width: 100vw;
    gap: 30px;
    padding: 20px;
  }
  
  .content-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: stretch;
    width: 100vw;
    height: auto;
    gap: 20px;
  }
  
  .calendar-section {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 450px;
  }
  
  /* ✅ 지도 컨테이너 스타일 추가 */
  .map-section {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 450px;
    background: #f9f9f9;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  }
  
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
  