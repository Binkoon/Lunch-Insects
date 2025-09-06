<template>
  <div class="about-page">
    <div class="about-container">
      <h1>📢 사이트 소개 (ver1.0)</h1>
      
      <div class="about-content">
        <p>
          안녕하세요! 현재 사이트는 식사 일정을 관리하고 추천 메뉴를 제공하는 <strong>식충이 캘린더</strong>입니다. 
          아직 개발이 완료되지 않은 상태이며, 일부 기능이 정상적으로 동작하지 않을 수 있습니다.
        </p>
        
        <div class="feature-section">
          <h2>🚧 현재 작업 중인 기능</h2>
          <ul>
            <li>반응형 개선 (모바일/태블릿 최적화)</li>
            <li>경로 탐색 정확도 개선</li>
            <li>UI 디자인 개선</li>
            <li>기타 버그 수정 🛠️</li>
          </ul>
        </div>

        <div class="update-section">
          <h2>🔄 최근 업데이트</h2>
          <ul>
            <li>네이버 지도 API 제거 (유료화 대응)</li>
            <li>보안 강화 (환경변수 노출 방지)</li>
            <li>에러 처리 개선</li>
            <li>코드 품질 향상</li>
            <li>중복 코드 제거</li>
          </ul>
        </div>

        <p class="feedback-text">
          앞으로 지속적인 업데이트를 통해 더욱 완성도를 높여가겠습니다! 많은 피드백 부탁드립니다. 😊
        </p>
      </div>

      <div class="button-container">
        <button class="home-btn" @click="goHome">홈으로 돌아가기</button>
      </div>
    </div>
  </div>
</template>
  
<script>
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    
    const goHome = () => {
      router.push("/");
    };
    
    return {
      goHome
    };
  }
};
</script>
  
<style scoped>
.about-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: var(--rem-40) var(--rem-20);
  display: flex;
  align-items: center;
  justify-content: center;
}

.about-container {
  background: var(--bg-primary);
  padding: var(--rem-40);
  border-radius: var(--rem-15);
  box-shadow: var(--shadow-xl);
  max-width: var(--rem-800);
  width: 100%;
}

.about-container h1 {
  text-align: center;
  color: var(--text-primary);
  margin-bottom: var(--rem-30);
  font-size: 2.5rem;
}

.about-content {
  margin-bottom: var(--rem-30);
}

.about-content p {
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: var(--rem-20);
}

.feature-section,
.update-section {
  margin: var(--rem-25) 0;
  padding: var(--rem-20);
  background: var(--bg-secondary);
  border-radius: var(--rem-10);
  border-left: var(--rem-4) solid var(--color-primary);
}

.feature-section h2,
.update-section h2 {
  color: var(--text-primary);
  margin-bottom: var(--rem-15);
  font-size: 1.3rem;
}

.feature-section ul,
.update-section ul {
  list-style: none;
  padding: 0;
}

.feature-section li,
.update-section li {
  padding: var(--rem-8) 0;
  color: var(--text-secondary);
  font-size: 1rem;
}

.feedback-text {
  text-align: center;
  font-style: italic;
  color: var(--text-muted);
  margin-top: var(--rem-30);
}

.button-container {
  text-align: center;
  margin-top: var(--rem-30);
}

.home-btn {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: var(--text-light);
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--rem-12) var(--rem-24);
  font-size: var(--rem-16);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
}

.home-btn:hover {
  transform: translateY(calc(-1 * var(--rem-2)));
  box-shadow: var(--shadow-lg);
}

/* 반응형 */
@media (max-width: 48rem) { /* 768px */
  .about-page {
    padding: var(--rem-20) var(--rem-10);
  }
  
  .about-container {
    padding: var(--rem-20);
  }
  
  .about-container h1 {
    font-size: 2rem;
  }
  
  .feature-section,
  .update-section {
    padding: var(--rem-15);
  }
}
</style>
  