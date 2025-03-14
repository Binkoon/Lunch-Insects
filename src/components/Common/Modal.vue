<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <!-- ✅ 선택 화면 -->
      <div v-if="showSelection">
        <h2>일정이 있나요?</h2>
        <div class="button-container">
          <CommonButton buttonStyle="primary" class="modal-btn" @click="selectHasEvent(true)">나는 일정이 있어!</CommonButton>
          <CommonButton buttonStyle="secondary" class="modal-btn" @click="selectHasEvent(false)">나는 일정이 없어!</CommonButton>
        </div>
      </div>

      <!-- ✅ 기존 일정 추가 -->
      <div v-else-if="hasEvent">
        <div class="modal-header">
          <h2>{{ title }}</h2>
          <button class="close-button" @click="close">닫기</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">일정 사유:</label>
            <input v-model="eventData.reason" type="text" class="modal-input" placeholder="일정 사유 입력" />
          </div>

          <div class="form-group">
            <label class="form-label">사용자:</label>
            <select v-model="eventData.userId" class="modal-select">
              <option value="">-</option>
              <option value="John">John</option>
              <option value="Jack">Jack</option>
              <option value="Jane">Jane</option>
              <option value="Jill">Jill</option>
            </select>
          </div>

          <div class="button-container">
            <CommonButton buttonStyle="primary" class="modal-btn" @click="submitEvent">추가</CommonButton>
          </div>
        </div>
      </div>

      <!-- ✅ 일정이 없는 경우 음식점 & 사용자 선택 -->
      <div v-else>
        <div class="modal-header">
          <h2>희망하는 음식점을 선택하세요</h2>
          <button class="close-button" @click="close">닫기</button>
        </div>

        <div class="modal-body">
          <!-- ✅ 다중 선택 가능한 음식점 리스트 -->
          <div class="form-group">
            <label class="form-label">음식점:</label>
            <div class="checkbox-group">
              <label v-for="restaurant in restaurantList" :key="restaurant" class="checkbox-label">
                <input type="checkbox" :value="restaurant" v-model="noEventData.restaurants" @change="limitSelection" />
                {{ restaurant }}
              </label>
            </div>
          </div>

          <!-- ✅ 사용자 선택 -->
          <div class="form-group">
            <label class="form-label">사용자:</label>
            <select v-model="noEventData.userId" class="modal-select">
              <option value="">-</option>
              <option value="John">John</option>
              <option value="Jack">Jack</option>
              <option value="Jane">Jane</option>
              <option value="Jill">Jill</option>
            </select>
          </div>

          <div class="button-container">
            <CommonButton buttonStyle="primary" class="modal-btn" @click="submitNoEvent">등록</CommonButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CommonButton from "@/components/Common/Button.vue";

export default {
  components: { CommonButton },
  props: {
    show: Boolean,
    title: {
      type: String,
      default: "모달 제목",
    },
    eventData: Object,
  },
  data() {
    return {
      showSelection: true,
      hasEvent: false,
      noEventData: { restaurants: [], userId: "" }, // ✅ 음식점을 배열로 저장, 사용자 필드명 변경
      restaurantList: [
        "금성관", "리원", "멘무샤", "맥도날드", "맘스터치", "신의주 부대찌개",
        "콜리그", "왕비집", "26층", "26층 (VIP)", "은앤정 닭갈비", 
        "태진옥", "청진동 해장국", "용호동 낙지"
      ],
    };
  },
  methods: {
    close() {
      this.showSelection = true;
      this.hasEvent = false;
      this.noEventData = { restaurants: [], userId: "" };
      this.$emit("close");
    },
    selectHasEvent(hasEvent) {
      this.hasEvent = hasEvent;
      this.showSelection = false;
    },
    limitSelection() {
      if (this.noEventData.restaurants.length > 3) {
        alert("최대 3개의 음식점만 선택할 수 있습니다!");
        this.noEventData.restaurants.pop(); // 마지막 선택한 값 제거
      }
    },
    submitEvent() {
      console.log("📌 Modal에서 제출된 데이터:", this.eventData);

      if (!this.eventData || typeof this.eventData !== "object") {
        console.error("❌ 잘못된 이벤트 데이터 전달됨:", this.eventData);
        return;
      }

      this.$emit("submit", {
        reason: this.eventData.reason, 
        userId: this.eventData.userId,  
        date: this.eventData.date,    
        type: "event",
      });

      this.close();
    },
    submitNoEvent() {
      this.$emit("submit", {
        reason: this.noEventData.restaurants.join(", "), 
        userId: this.noEventData.userId,
        date: this.eventData?.date || new Date().toISOString().split("T")[0],
        type: "no-event",
      });
      this.close();
    },
  },
};
</script>

<style scoped>
/* ✅ 스타일 유지 */
.modal-overlay {
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

.modal-content {
  background: white;
  width: 420px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
}

.close-button {
  background: linear-gradient(to right, #ff9800, #ffeb3b);
  border: none;
  padding: 8px 14px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.close-button:hover {
  opacity: 0.8;
}

.form-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.form-label {
  width: 80px;
  font-weight: bold;
  text-align: right;
}

.modal-input, .modal-select {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  max-width: 200px;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.modal-btn {
  padding: 10px 20px;
  border-radius: 5px;
  min-width: 120px;
}
</style>
