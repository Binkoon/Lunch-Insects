<template>
    <div class="random-box">
      <h3>🎰 오늘의 추천 메뉴</h3>
      <div class="roulette-container">
        <div v-if="isRolling" class="roulette-text rolling">🎲 선택 중...</div>
        <div v-else class="roulette-text result">{{ selectedMenu }}</div>
      </div>
      <CommonButton buttonStyle="primary" @click="rollMenu">🔄 다시 돌리기</CommonButton>
    </div>
  </template>
  
  <script>
  import CommonButton from "@/components/Common/Button.vue";
  
  export default {
    components: { CommonButton },
    data() {
      return {
        restaurantList: [
          "금성관", "리원", "멘무샤", "맥도날드", "맘스터치", "신의주 부대찌개",
          "콜리그", "왕비집", "26층", "26층 (VIP)", "은앤정 닭갈비", 
          "태진옥", "청진동 해장국", "용호동 낙지", "미쓰족발", "칙바이칙",
          "밀피유", "보노보스", "애성회관", "돈우가", "박씨화로구이", "KFC",
          "BBQ", "신의주 찹쌀순대", "스쿨푸드", "모모카페", "알로프트", "일품향", "강남면옥"
        ],
        selectedMenu: "❓ 무엇을 먹을까요?",
        isRolling: false
      };
    },
    methods: {
      rollMenu() {
        this.isRolling = true;
        setTimeout(() => {
          const randomIndex = Math.floor(Math.random() * this.restaurantList.length);
          this.selectedMenu = this.restaurantList[randomIndex];
          this.isRolling = false;
        }, 1500); // 1.5초 후 결과 표시
      }
    }
  };
  </script>
  
  <style scoped>
  .random-box {
    width: 100%;
    max-width: 320px;
    background: white;
    padding: 15px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .roulette-container {
    margin: 15px 0;
    font-size: 18px;
    font-weight: bold;
    padding: 10px;
    border-radius: 8px;
    background: #f9f9f9;
    transition: all 0.3s;
  }
  
  .rolling {
    color: #007bff;
    animation: blink 0.5s infinite alternate;
  }
  
  @keyframes blink {
    from { opacity: 1; }
    to { opacity: 0.5; }
  }
  
  .result {
    color: #28a745;
  }
  </style>
  