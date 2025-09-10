<template>
  <section class="hero-section">
    <div class="hero-background">
      <div class="hero-overlay"></div>
      <div class="hero-pattern"></div>
    </div>
    
    <div class="hero-content">
      <div class="hero-header">
        <h1 class="hero-title">식충이 캘린더</h1>
        <div class="hero-subtitle">
          <p class="hero-quote font-handwriting">"직장인에게 중요한건 돈과 밥이다"</p>
          <p class="hero-description">점심 메뉴 고민은 이제 그만! 스마트한 식사 계획으로 하루를 시작하세요</p>
        </div>
      </div>
      
      <div class="hero-actions">
        <Button variant="primary" size="lg" @click="scrollToCalendar">
          📅 캘린더 보기
        </Button>
        <Button variant="ghost" size="lg" @click="scrollToFeatures">
          ✨ 기능 둘러보기
        </Button>
      </div>
      
      <div class="hero-navigation">
        <router-link to="/home" class="nav-link">홈</router-link>
        <router-link to="/about" class="nav-link">소개</router-link>
      </div>
    </div>
    
    <div class="hero-scroll-indicator">
      <div class="scroll-arrow">↓</div>
    </div>
  </section>
</template>

<script>
import { Button } from '@/components/ui';

export default {
  components: {
    Button
  },
  methods: {
    scrollToCalendar() {
      const calendarElement = document.querySelector('.calendar-container');
      if (calendarElement) {
        calendarElement.scrollIntoView({ behavior: 'smooth' });
      }
    },
    scrollToFeatures() {
      const featuresElement = document.querySelector('.stats-section');
      if (featuresElement) {
        featuresElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
};
</script>

<style scoped>
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(77, 168, 218, 0.9) 0%, 
    rgba(90, 219, 181, 0.8) 50%, 
    rgba(180, 227, 61, 0.7) 100%
  );
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
}

.hero-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: var(--text-light);
  max-width: var(--rem-800);
  padding: var(--rem-40) var(--rem-20);
}

.hero-header {
  margin-bottom: var(--rem-40);
}

.hero-title {
  font-size: var(--rem-64);
  font-weight: 900;
  margin-bottom: var(--rem-24);
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #fff, #f0f8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: titleGlow 3s ease-in-out infinite alternate;
}

@keyframes titleGlow {
  from { filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.5)); }
  to { filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.8)); }
}

.hero-subtitle {
  margin-bottom: var(--rem-32);
}

.hero-quote {
  font-size: var(--rem-32);
  font-weight: 600;
  margin-bottom: var(--rem-16);
  color: #fff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  animation: quoteFloat 4s ease-in-out infinite;
}

@keyframes quoteFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.hero-description {
  font-size: var(--rem-20);
  line-height: 1.6;
  opacity: 0.9;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.hero-actions {
  display: flex;
  gap: var(--rem-20);
  justify-content: center;
  margin-bottom: var(--rem-40);
  flex-wrap: wrap;
}

.hero-navigation {
  display: flex;
  gap: var(--rem-24);
  justify-content: center;
  margin-bottom: var(--rem-20);
}

.nav-link {
  color: var(--text-light);
  font-size: var(--rem-18);
  padding: var(--rem-12) var(--rem-24);
  border-radius: var(--rem-30);
  transition: all 0.3s ease;
  text-decoration: none;
  font-weight: 600;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(calc(-1 * var(--rem-3)));
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.hero-scroll-indicator {
  position: absolute;
  bottom: var(--rem-40);
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.scroll-arrow {
  font-size: var(--rem-32);
  color: var(--text-light);
  animation: bounce 2s infinite;
  cursor: pointer;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

/* 반응형 디자인 */
@media (max-width: 48rem) { /* 768px */
  .hero-title {
    font-size: var(--rem-48);
  }
  
  .hero-quote {
    font-size: var(--rem-24);
  }
  
  .hero-description {
    font-size: var(--rem-18);
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-navigation {
    flex-direction: column;
    align-items: center;
    gap: var(--rem-16);
  }
}

@media (max-width: 37.5rem) { /* 600px */
  .hero-title {
    font-size: var(--rem-36);
  }
  
  .hero-quote {
    font-size: var(--rem-20);
  }
  
  .hero-description {
    font-size: var(--rem-16);
  }
  
  .hero-content {
    padding: var(--rem-20) var(--rem-16);
  }
}
</style>
