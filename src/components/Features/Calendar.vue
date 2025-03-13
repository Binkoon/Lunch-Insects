<template>
  <div class="calendar-container">
    <!-- 헤더: 이전 주, 현재 주차, 다음 주 -->
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

    <!-- 주간 일정 (버튼 클릭 시 모달 호출) -->
    <div class="calendar-week">
      <button v-for="(day, index) in daysInWeek" :key="index"
              class="day-btn"
              :class="{'saturday-day': isSaturday(day), 'sunday-day': isSunday(day), 'holiday-day': isHoliday(day)}"
              @click="day ? openModal(day) : null">
        
        <template v-if="day">
          <span class="day-number">{{ day.day }}</span>
          <div v-if="day.holiday" class="holiday">{{ day.holiday }}</div>
          <div class="event-container">
            <div v-for="event in day.events" :key="event.id" 
                 class="event" 
                 :class="{'no-event-bg': event.type === 'no-event'}">
              {{ event.title }} ({{ event.user }})
              <button class="delete-btn" @click.stop="deleteEvent(day.date, event.id)">✕</button>
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
      @submit="addEvent" 
      :eventData="newEvent" 
    />
  </div>
</template>


<script>
import CommonModal from "@/components/Common/Modal.vue";
import { getHolidays } from "@/utils/holidayApi";

export default {
  components: { CommonModal },
  data() {
    return {
      currentYear: new Date().getFullYear(),
      currentWeek: this.getCurrentWeek(),
      showModal: false,
      selectedDate: null,
      newEvent: { title: "", user: "", date: null, type: "" },
      events: [],
      holidays: {},
      weekdays: ["일", "월", "화", "수", "목", "금", "토"], // ✅ 요일 고정
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
          events: this.events.filter(event => event.date === dateString),
        });
      }
      return days;
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
    openModal(day) {
      this.selectedDate = day.date;
      this.newEvent = { title: "", user: "", date: day.date, type: "" };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    addEvent(eventData) {
      if (!eventData.title || !eventData.user) {
        return;
      }

      const isDuplicate = this.events.some(event => 
        event.date === eventData.date && event.title === eventData.title
      );

      if (!isDuplicate) {
        this.events.push({
          id: Date.now(),
          date: eventData.date,
          title: eventData.title,
          user: eventData.user,
          type: eventData.type, // ✅ no-event 여부 저장
        });
      }

      this.closeModal();
    },
    deleteEvent(date, eventId) {
      this.events = this.events.filter(event => !(event.date === date && event.id === eventId));
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
.calendar-container {
  width: 100%;
  max-width: 1400px; /* ✅ 전체 컨테이너 너비 확장 */
  margin: auto;
  text-align: center;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

/* ✅ 요일 높이 조정 */
.calendar-weekdays {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  padding: 15px 0;
  font-size: 16px;
}


/* ✅ 주차 & 네비게이션 버튼 가로 정렬 */
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 10px;
}

.nav-btn:hover {
  background: #bbb;
}

  
/* ✅ 날짜 컨테이너 크기 맞춤 */
.calendar-week {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  padding: 0 10px; /* ✅ 양옆 여백 조정 */
}


/* ✅ 날짜 버튼 크기 확장 및 숫자 정렬 */
.day-btn {
  flex: 1;
  height: 160px; /* ✅ 높이 증가 */
  min-width: 180px; /* ✅ 버튼 너비 증가 */
  border-radius: 8px;
  background: #f9f9f9;
  cursor: pointer;
  transition: background 0.2s ease-in-out;
  border: none;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* ✅ 왼쪽 정렬 */
  justify-content: flex-start; /* ✅ 상단 정렬 */
  padding: 10px 15px; /* ✅ 내부 패딩 */
}

/* ✅ 숫자 크기 줄이고 위치 조정 */
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

.event {
  background: rgba(0, 128, 255, 0.1);
  padding: 5px 8px;
  border-radius: 5px;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
}
  
  .saturday-day .day-number {
    color: blue;
  }
  
  .sunday-day .day-number, .holiday-day .day-number {
    color: red;
  }

.delete-btn {
  background: red;
  color: white;
  border: none;
  padding: 5px;
  cursor: pointer;
  border-radius: 5px;
  font-size: 12px;
}

/* ✅ 희망 음식점 선택(no-event) 스타일 추가 */
.no-event-bg {
  background: #D4EDDA; /* 연두색 배경 */
  color: #155724; /* 텍스트 색상 */
  border: 1px solid #C3E6CB;
  padding: 5px 8px;
  border-radius: 5px;
  font-size: 14px;
  display: flex;
  width: 90%;
}
  </style>
  