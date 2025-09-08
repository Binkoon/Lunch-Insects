<template>
  <div class="landing-page">
    <!-- 히어로 섹션 -->
    <section class="hero-section">
      <!-- 배경 애니메이션 -->
      <div class="hero-background">
        <div class="floating-shapes">
          <div 
            v-for="i in 20" 
            :key="i"
            class="floating-shape"
            :style="getRandomShapeStyle(i)"
          ></div>
        </div>
        <div class="gradient-overlay"></div>
      </div>

      <!-- 메인 콘텐츠 -->
      <div class="hero-content">
        <div class="hero-container">

          <!-- 로고 섹션 -->
          <div class="logo-section" :class="{ 'animate': logoAnimated }">
            <div class="logo-container">
              <div class="logo-icon">🍽️</div>
              <div class="logo-text">
                <span class="logo-main">식충이</span>
                <span class="logo-sub">캘린더</span>
              </div>
            </div>
          </div>

          <!-- 메인 타이틀 -->
          <div class="title-section" :class="{ 'animate': titleAnimated }">
            <h1 class="main-title">
              <span class="title-line" :class="{ 'animate': titleLine1Animated }">
                직장인에게 중요한건
              </span>
              <span class="title-line highlight" :class="{ 'animate': titleLine2Animated }">
                돈과 밥이다
              </span>
            </h1>
            <div class="title-decoration" :class="{ 'animate': decorationAnimated }">
              <div class="decoration-line"></div>
              <div class="decoration-dot"></div>
              <div class="decoration-line"></div>
            </div>
          </div>

          <!-- 서브 타이틀 -->
          <div class="subtitle-section" :class="{ 'animate': subtitleAnimated }">
            <p class="subtitle-text">
              동료들과 함께하는 스마트한 점심 관리 플랫폼
            </p>
            <p class="subtitle-description">
              일정 공유부터 음식점 추천까지, 모든 것을 한 곳에서
            </p>
          </div>

          <!-- CTA 버튼들 -->
          <div class="cta-section" :class="{ 'animate': ctaAnimated }">
            <button class="cta-primary" @click="goToApp">
              <span class="btn-text">앱 시작하기</span>
              <span class="btn-icon">→</span>
            </button>
            <button class="cta-secondary" @click="scrollToFeatures">
              <span class="btn-text">기능 보기</span>
              <span class="btn-icon">↓</span>
            </button>
          </div>

          <!-- 통계 카드들 -->
          <div class="stats-section" :class="{ 'animate': statsAnimated }">
            <div class="stat-card">
              <div class="stat-number">{{ platformStats.activeUsers }}+</div>
              <div class="stat-label">등록 사용자</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ platformStats.restaurants }}+</div>
              <div class="stat-label">등록된 음식점</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ platformStats.groups }}+</div>
              <div class="stat-label">활성 그룹</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 스크롤 인디케이터 -->
      <div class="scroll-indicator" :class="{ 'animate': scrollIndicatorAnimated }">
        <div class="scroll-line"></div>
        <div class="scroll-text">스크롤하여 더 보기</div>
      </div>
    </section>

    <!-- 기능 소개 섹션 -->
    <section class="features-section" ref="featuresSection">
      <div class="features-container">
        <div class="section-header">
          <h2 class="section-title">왜 식충이 캘린더인가?</h2>
          <p class="section-subtitle">
            동료들과 함께하는 점심 시간을 더욱 스마트하게 만들어보세요
          </p>
        </div>

        <div class="features-grid">
          <div class="feature-card" v-for="(feature, index) in features" :key="index">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA 섹션 -->
    <section class="final-cta-section">
      <div class="cta-container">
        <h2 class="cta-title">지금 시작해보세요</h2>
        <p class="cta-description">
          동료들과 함께 더 나은 점심 문화를 만들어가세요
        </p>
        <button class="cta-button" @click="goToApp">
          <span class="btn-text">무료로 시작하기</span>
          <span class="btn-icon">🚀</span>
        </button>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAllUsers, getAllRestaurants } from '@/services/firebaseDBv2.js';

export default {
  name: 'Intro',
  components: {},
  setup() {
    const router = useRouter();
    const featuresSection = ref(null);
    
    // 애니메이션 상태
    const logoAnimated = ref(false);
    const titleAnimated = ref(false);
    const titleLine1Animated = ref(false);
    const titleLine2Animated = ref(false);
    const decorationAnimated = ref(false);
    const subtitleAnimated = ref(false);
    const ctaAnimated = ref(false);
    const statsAnimated = ref(false);
    const scrollIndicatorAnimated = ref(false);

    // 플랫폼 통계 데이터
    const platformStats = ref({
      activeUsers: 0,
      restaurants: 0,
      groups: 0
    });

    // 기능 데이터
    const features = ref([
      {
        icon: '📅',
        title: '스마트 캘린더',
        description: '월별 캘린더로 동료들과 일정을 공유하고 점심 약속을 잡아보세요'
      },
      {
        icon: '🍽️',
        title: '맞춤 음식점 추천',
        description: '위치와 취향을 기반으로 최적의 음식점을 추천해드립니다'
      },
      {
        icon: '👥',
        title: '그룹 관리',
        description: '팀 단위로 그룹을 만들어 함께 점심을 즐겨보세요'
      },
      {
        icon: '📊',
        title: '통계 분석',
        description: '점심 패턴과 지출을 분석하여 더 나은 선택을 도와드립니다'
      },
      {
        icon: '🎯',
        title: '개인화 추천',
        description: 'AI가 학습한 당신의 취향으로 맞춤형 추천을 제공합니다'
      },
      {
        icon: '📱',
        title: '모바일 최적화',
        description: '언제 어디서나 편리하게 사용할 수 있는 반응형 디자인'
      }
    ]);

    // 랜덤 모양 스타일 생성
    const getRandomShapeStyle = (index) => {
      const size = Math.random() * 100 + 50;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const animationDelay = Math.random() * 10;
      const animationDuration = Math.random() * 20 + 10;
      
      return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${left}%`,
        top: `${top}%`,
        animationDelay: `${animationDelay}s`,
        animationDuration: `${animationDuration}s`
      };
    };

    // 앱으로 이동 (인증 페이지로) - 섹션별 사라짐 애니메이션
    const goToApp = () => {
      const sections = [
        '.logo-section', 
        '.title-section',
        '.cta-section',
        '.stats-section'
      ];
      
      // 각 섹션을 순차적으로 사라지게 하기
      sections.forEach((selector, index) => {
        const element = document.querySelector(selector);
        if (element) {
          setTimeout(() => {
            element.style.transition = 'transform 0.4s ease-in-out, opacity 0.4s ease-in-out';
            element.style.transform = 'translateY(-20px) scale(0.95)';
            element.style.opacity = '0';
          }, index * 100); // 100ms 간격으로 순차 실행
        }
      });
      
      // 모든 섹션이 사라진 후 페이지 이동
      setTimeout(() => {
        router.push('/auth');
      }, sections.length * 100 + 400);
    };

    // 기능 섹션으로 스크롤
    const scrollToFeatures = () => {
      if (featuresSection.value) {
        featuresSection.value.scrollIntoView({ 
          behavior: 'smooth' 
        });
      }
    };

    // 애니메이션 시퀀스 실행
    const startAnimationSequence = () => {
      // 로고 애니메이션 시작
      setTimeout(() => logoAnimated.value = true, 200);
      setTimeout(() => titleAnimated.value = true, 500);
      setTimeout(() => titleLine1Animated.value = true, 700);
      setTimeout(() => titleLine2Animated.value = true, 900);
      setTimeout(() => decorationAnimated.value = true, 1100);
      setTimeout(() => subtitleAnimated.value = true, 1300);
      setTimeout(() => ctaAnimated.value = true, 1500);
      setTimeout(() => statsAnimated.value = true, 1700);
      setTimeout(() => scrollIndicatorAnimated.value = true, 1900);
    };

    // Firebase에서 통계 데이터 로드
    const loadPlatformStats = async () => {
      try {
        console.log('플랫폼 통계 로드 시작...');
        
        // 전체 사용자 수 로드
        const users = await getAllUsers();
        
        // 음식점 수 로드
        const restaurants = await getAllRestaurants(1000); // 충분히 큰 수로 제한
        
        // 통계 데이터 업데이트
        platformStats.value.activeUsers = users.length; // 전체 등록자 수
        platformStats.value.restaurants = restaurants.length;
        platformStats.value.groups = 1; // 현재 활성 그룹 수
        
        console.log('플랫폼 통계 로드 완료:', platformStats.value);
      } catch (error) {
        console.error('플랫폼 통계 로드 실패:', error);
        // 오류 시 기본값 설정
        platformStats.value.activeUsers = 0;
        platformStats.value.restaurants = 0;
        platformStats.value.groups = 0;
      }
    };

    onMounted(() => {
      startAnimationSequence();
      loadPlatformStats();
    });

    return {
      featuresSection,
      logoAnimated,
      titleAnimated,
      titleLine1Animated,
      titleLine2Animated,
      decorationAnimated,
      subtitleAnimated,
      ctaAnimated,
      statsAnimated,
      scrollIndicatorAnimated,
      features,
      platformStats,
      getRandomShapeStyle,
      goToApp,
      scrollToFeatures
    };
  }
};
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: url('@/assets/header_img_food2.jpg') center/cover no-repeat;
  overflow-x: hidden;
  position: relative;
}

/* 히어로 섹션 */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.floating-shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float linear infinite;
}

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.6) 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
  backdrop-filter: blur(1px);
}

.hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  padding: 0 2rem;
  text-align: center;
}

.hero-container {
  max-width: 800px;
  margin: 0 auto;
}


/* 로고 섹션 */
.logo-section {
  margin-bottom: 3rem;
  opacity: 0;
  transform: translateY(30px);
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-section.animate {
  opacity: 1;
  transform: translateY(0);
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.logo-icon {
  font-size: 4rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.logo-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.logo-main {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.logo-sub {
  font-size: 1.5rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1;
}

/* 타이틀 섹션 */
.title-section {
  margin-bottom: 2rem;
  opacity: 0;
  transform: translateY(30px);
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.title-section.animate {
  opacity: 1;
  transform: translateY(0);
}

.main-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 1.5rem 0;
  line-height: 1.2;
}

.title-line {
  display: block;
  opacity: 0;
  transform: translateX(-30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.title-line.animate {
  opacity: 1;
  transform: translateX(0);
}

.title-line.highlight {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
}

.title-decoration {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.title-decoration.animate {
  opacity: 1;
  transform: scale(1);
}

.decoration-line {
  width: 60px;
  height: 2px;
  background: rgba(255, 255, 255, 0.6);
}

.decoration-dot {
  width: 8px;
  height: 8px;
  background: #ffd700;
  border-radius: 50%;
}

/* 서브타이틀 섹션 */
.subtitle-section {
  margin-bottom: 3rem;
  opacity: 0;
  transform: translateY(30px);
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.subtitle-section.animate {
  opacity: 1;
  transform: translateY(0);
}

.subtitle-text {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 1rem 0;
  font-weight: 300;
}

.subtitle-description {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-weight: 300;
}

/* CTA 섹션 */
.cta-section {
  margin-bottom: 4rem;
  opacity: 0;
  transform: translateY(30px);
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.cta-section.animate {
  opacity: 1;
  transform: translateY(0);
}

.cta-section {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-primary,
.cta-secondary {
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.cta-primary {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
}

.cta-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 215, 0, 0.4);
}

.cta-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.cta-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

/* 통계 섹션 */
.stats-section {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
  opacity: 0;
  transform: translateY(30px);
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.stats-section.animate {
  opacity: 1;
  transform: translateY(0);
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 1.5rem 2rem;
  text-align: center;
  min-width: 120px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
}

/* 스크롤 인디케이터 */
.scroll-indicator {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0;
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.scroll-indicator.animate {
  opacity: 1;
}

.scroll-line {
  width: 2px;
  height: 40px;
  background: rgba(255, 255, 255, 0.6);
  animation: scrollPulse 2s infinite;
}

@keyframes scrollPulse {
  0%, 100% {
    opacity: 0.6;
    transform: scaleY(1);
  }
  50% {
    opacity: 1;
    transform: scaleY(1.2);
  }
}

.scroll-text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
}

/* 기능 섹션 */
.features-section {
  padding: 6rem 2rem;
  background: white;
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 1rem 0;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #666;
  margin: 0;
  font-weight: 300;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
}

.feature-description {
  font-size: 1rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* 최종 CTA 섹션 */
.final-cta-section {
  padding: 6rem 2rem;
  background: url('@/assets/header_img_food2.jpg') center/cover no-repeat;
  background-attachment: fixed;
  text-align: center;
  position: relative;
}

.final-cta-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0.7) 100%
  );
  z-index: 1;
}

.final-cta-section .cta-container {
  position: relative;
  z-index: 2;
}

.cta-container {
  max-width: 600px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 1rem 0;
}

.cta-description {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 2rem 0;
  font-weight: 300;
}

.cta-button {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
  border: none;
  border-radius: 50px;
  padding: 1.2rem 3rem;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(255, 215, 0, 0.4);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .landing-page {
    background-attachment: scroll;
  }
  
  .final-cta-section {
    background-attachment: scroll;
  }
  
  .hero-content {
    padding: 0 1rem;
  }
  
  .main-title {
    font-size: 2.5rem;
  }
  
  .logo-main {
    font-size: 2.5rem;
  }
  
  .logo-sub {
    font-size: 1.2rem;
  }
  
  .subtitle-text {
    font-size: 1.2rem;
  }
  
  .cta-section {
    flex-direction: column;
    align-items: center;
  }
  
  .stats-section {
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1rem 1.5rem;
    min-width: 100px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .cta-title {
    font-size: 2rem;
  }
}
</style>