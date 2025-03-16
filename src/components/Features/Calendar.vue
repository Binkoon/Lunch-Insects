<template>
  <div class="calendar-container">
    <!-- 헤더 -->
    <div class="calendar-header">
      <button class="nav-btn" @click="prevWeek">◀</button>
      <h2>{{ currentYear }}년 {{ weekNumber }}W</h2>
      <button class="nav-btn" @click="nextWeek">▶</button>
    </div>

    <!-- 요일 표시 -->
    <div class="calendar-weekdays">
      <div v-for="(day, index) in weekdays" :key="index" class="weekday">
        {{ day }}
      </div>
    </div>

    <!-- 주간 일정 -->
    <div class="calendar-week">
      <button v-for="(day, index) in daysInWeek" :key="index"
              class="day-btn"
              :class="{'saturday-day': isSaturday(day), 'sunday-day': isSunday(day), 'holiday-day': isHoliday(day)}"
              @click="day ? openModal(day.date) : null">
        
        <template v-if="day">
          <span class="day-number">{{ day.day }}</span>
          <div v-if="day.holiday" class="holiday">{{ day.holiday }}</div>
          <div class="event-container">
            <div v-for="event in getEventsForDate(day.date)" :key="event.id" 
                class="event" 
                :class="{'schedule-event': event.type === 'schedule', 'no-event-bg': event.type === 'no-event'}">
              {{ event.reason || "이벤트 없음" }} ({{ event.userId || "알 수 없음" }})
              <span> ({{ event.type }}) </span>  <!-- ✅ 여기에서 type 확인 -->
              <button class="delete-btn" @click.stop="deleteEvent(event.id, day.date, event.type)">✕</button>
            </div>
          </div>
        </template>
      </button>
    </div>
    
    <!-- 일정 추가 모달 -->
    <CommonModal 
      :show="showModal" 
      title="일정 추가" 
      @close="closeModal" 
      @submit="submitEvent"
      :eventData="newEvent"
    />
  </div>
</template>

<script>
import CommonModal from "@/components/Common/Modal.vue";
import { getHolidays } from "@/utils/holidayApi";

export default {
  components: { CommonModal },
  props: {
    showModal: Boolean, 
    events: Array, 
    preferences: Array, 
  },
  data() {
    return {
      currentYear: new Date().getFullYear(),
      currentWeek: this.getCurrentWeek(),
      selectedDate: null,
      newEvent: { reason: "", userId: "", date: null, type: "event" },
      holidays: {},
      weekdays: ["일", "월", "화", "수", "목", "금", "토"],
    };
  },
  computed: {
    weekNumber() {
      const firstJan = new Date(this.currentYear, 0, 1);
      const firstWeekStart = firstJan.getDate() - firstJan.getDay();
      const currentDate = new Date(this.currentYear, 0, this.currentWeek * 7);
      const diffDays = Math.floor((currentDate - firstJan) / (1000 * 60 * 60 * 24));
      return Math.ceil((diffDays + firstWeekStart) / 7);
    },
    daysInWeek() {
      const firstDayOfYear = new Date(this.currentYear, 0, 1);
      const days = [];
      const startOfWeek = new Date(firstDayOfYear);
      startOfWeek.setDate(firstDayOfYear.getDate() + (this.currentWeek - 1) * 7 - startOfWeek.getDay());

      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

        days.push({
          date: dateString,
          day: currentDate.getDate(),
          holiday: this.holidays[dateString] || "",
        });
      }
      return days;
    }
  },
  watch: {
    events: {
      handler() {
        this.$forceUpdate();
      },
      deep: true,
    },
    preferences: {
      handler() {
        this.$forceUpdate();
      },
      deep: true,
    },
  },
  methods: {
    async fetchHolidays() {
      this.holidays = await getHolidays(this.currentYear);
    },
    getCurrentWeek() {
      const today = new Date();
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
      return Math.ceil(((today - firstDayOfYear) / (1000 * 60 * 60 * 24) + firstDayOfYear.getDay()) / 7);
    },
    prevWeek() {
      if (this.currentWeek === 1) {
        this.currentYear--;
        this.currentWeek = 52;
      } else {
        this.currentWeek--;
      }
      this.fetchHolidays();
    },
    nextWeek() {
      if (this.currentWeek >= 52) {
        this.currentYear++;
        this.currentWeek = 1;
      } else {
        this.currentWeek++;
      }
      this.fetchHolidays();
    },
    openModal(date) {
      this.selectedDate = date;
      this.newEvent = { reason: "", userId: "", date, type: "event" };
      this.$emit("open-modal", this.newEvent);
    },
    closeModal() {
      this.$emit("close-modal");
    },
    submitEvent(eventData) {
      this.$emit("add-event", eventData);
    },
    /** 🔥 Firestore에서 가져온 데이터를 날짜별로 정리 */
    getEventsForDate(date) {
      console.log(`📌 이벤트 필터링 중: ${date}`, this.events, this.preferences);

      const scheduleEvents = this.events
        .filter(event => event.date === date)
        .map(event => ({
          ...event,
          reason: event.reason || "일정 없음",
          userId: event.userId || "알 수 없음",
          type: "schedule" // ✅ 일정이 있는 경우 'schedule' 타입
        }));

      const preferenceEvents = this.preferences
        .filter(preference => preference.date === date)
        .map(preference => ({ 
          id: preference.id,
          reason: preference.restaurants ? preference.restaurants.join(", ") : "음식점 선택 없음",
          userId: preference.participants ? preference.participants.join(", ") : "참여자 없음",
          type: "no-event" // ✅ 일정이 없는 경우 'no-event' 타입
        }));

      return [...scheduleEvents, ...preferenceEvents];

      // // ✅ 이벤트 타입을 콘솔에서 확인
      // allEvents.forEach(event => {
      //   console.log(`✅ 이벤트 타입 확인 - ID: ${event.id}, Type: ${event.type}, Reason: ${event.reason}`);
      // });

      // return allEvents;
    },
    deleteEvent(eventId, date, type) {
      console.log("🗑️ 삭제 요청됨:", eventId, date, type);
      this.$emit("delete-event", eventId, date, type);
    },
    isSaturday(day) {
      return day && new Date(day.date).getDay() === 6;
    },
    isSunday(day) {
      return day && new Date(day.date).getDay() === 0;
    },
    isHoliday(day) {
      return day && day.holiday;
    },
  },
  mounted() {
    this.fetchHolidays();
  },
};
</script>
  
<style scoped>
/* ✅ 캘린더 높이 조정 */
.calendar-container {
  width: 100%;
  max-width: 1500px;
  margin: auto;
  text-align: center;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  height: 400px; /* 🔥 기존보다 높이 증가 */
}

/* ✅ 요일 높이 조정 */
.calendar-weekdays {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  padding: 15px 0;
  font-size: 16px;
}

/* ✅ 주차 & 네비게이션 버튼 */
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 10px;
}

/* ✅ 날짜 컨테이너 - 자동 줄바꿈 추가 */
.calendar-week {
  display: flex;
  flex-wrap: wrap; /* 🔥 자동으로 줄바꿈 */
  gap: 10px;
  width: 100%;
  padding: 0 10px;
  justify-content: center;
}

/* ✅ 날짜 버튼 크기 증가 */
.day-btn {
  flex: 1;
  height: 250px; /* 🔥 기존보다 높이 증가 */
  min-width: 140px;
  max-width: calc(100% / 7 - 10px);
  border-radius: 8px;
  background: #f9f9f9;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
  border: none;
  font-size: 18px;
  font-weight: normal;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 10px 15px;
}

/* ✅ 요일 줄어들면서 캘린더 자동 배치 조정 */
@media (max-width: 1024px) {
  .day-btn {
    max-width: calc(100% / 5 - 10px); /* 🔥 2×5 레이아웃 */
  }
}

@media (max-width: 768px) {
  .day-btn {
    max-width: calc(100% / 4 - 10px); /* 🔥 3×4 레이아웃 */
  }
}

@media (max-width: 600px) {
  .day-btn {
    max-width: calc(100% / 3 - 10px); /* 🔥 4×3 레이아웃 */
  }
}

@media (max-width: 450px) {
  .day-btn {
    max-width: calc(100% / 2 - 10px); /* 🔥 7×1 레이아웃 */
  }
}

/* ✅ 숫자 크기 조정 */
.day-number {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.day-btn:hover {
  background: #e0e0e0;
}

/* ✅ 일정 목록 */
.event-container {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  width: 100%;
}

/* ✅ 일정 스타일 */
.schedule-event, .no-event-bg {
  font-size: 12px; /* 🔥 글자 크기 줄이기 */
  font-weight: normal; /* 🔥 글자 굵기 제거 */
  padding: 5px 10px;
  border-radius: 15px;
  text-align: center;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* ✅ 일정 스타일 - 일정 있음 */
.schedule-event {
  background: linear-gradient(45deg, #4da8da, #5adbb5, #b4e33d);
  color: white;
}

/* ✅ 일정 스타일 - 희망 음식점 */
.no-event-bg {
  background: linear-gradient(45deg, #6cd8b5, #98e65b);
  color: white;
}

/* ✅ 일정 삭제 버튼 */
.delete-btn {
  background: rgba(255, 0, 0, 0.8);
  color: white;
  border: none;
  padding: 5px;
  cursor: pointer;
  border-radius: 5px;
  font-size: 10px; /* 🔥 크기 줄이기 */
}

.delete-btn:hover {
  background: red;
}

/* ✅ 날짜 숫자 색상 적용 */
.day-number {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

/* ✅ 주말 및 공휴일 색상 지정 */
.saturday-day .day-number {
  color: blue !important;
}

.sunday-day .day-number,
.holiday-day .day-number {
  color: red !important;
}
</style>