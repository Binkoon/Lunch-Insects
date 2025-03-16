<template>
    <div v-if="showPopup" class="about-overlay">
      <div class="about-modal">
        <h2>📢 사이트 소개 (ver1.0)</h2>
        <p>
          안녕하세요! 현재 사이트는 식사 일정을 관리하고 추천 메뉴를 제공하는 <strong>식충이 캘린더</strong>입니다. 
          아직 개발이 완료되지 않은 상태이며, 일부 기능이 정상적으로 동작하지 않을 수 있습니다.
        </p>
        <p>
          🚧 <strong>현재 작업 중인 기능:</strong><br />
          - 반응형 개선 (모바일/태블릿 최적화) <br />
          - 경로 탐색 정확도 개선 <br />
          - UI 디자인 개선 <br />
          - 기타 버그 수정 🛠️
        </p>
        <p>
          앞으로 지속적인 업데이트를 통해 더욱 완성도를 높여가겠습니다! 많은 피드백 부탁드립니다. 😊
        </p>
  
        <div class="button-container">
          <CommonButton buttonStyle="secondary" @click="closePopup">닫기</CommonButton>
          <CommonButton buttonStyle="primary" @click="hideForOneDay">1일간 안 보기</CommonButton>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import CommonButton from "@/components/Common/Button.vue"; // ✅ 버튼 컴포넌트 사용
  
  export default {
    components: { CommonButton },
    data() {
      return {
        showPopup: false,
      };
    },
    methods: {
      checkPopupVisibility() {
        const hideUntil = localStorage.getItem("hideAboutPopup");
        if (!hideUntil || new Date() > new Date(hideUntil)) {
          this.showPopup = true;
        }
      },
      closePopup() {
        this.showPopup = false;
      },
      hideForOneDay() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        localStorage.setItem("hideAboutPopup", tomorrow.toISOString());
        this.closePopup();
      },
    },
    mounted() {
      this.checkPopupVisibility();
    },
  };
  </script>
  
  <style scoped>
  /* ✅ 모달 배경 */
  .about-overlay {
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
  
  /* ✅ 모달 컨텐츠 */
  .about-modal {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
    width: 450px;
    text-align: center;
  }
  
  /* ✅ 버튼 정렬 */
  .button-container {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
  }
  </style>
  