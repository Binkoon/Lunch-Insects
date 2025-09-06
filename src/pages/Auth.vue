<template>
  <div class="auth-page">
    <!-- 배경 -->
    <div class="auth-background">
      <div class="background-image"></div>
      <div class="gradient-overlay"></div>
    </div>

    <!-- 메인 콘텐츠 -->
    <div class="auth-container">
      <!-- 로고 섹션 -->
      <div class="auth-header">
        <div class="logo-section">
          <div class="logo-icon">📅</div>
          <div class="logo-text">
            <span class="logo-main">식충이</span>
            <span class="logo-sub">캘린더</span>
          </div>
        </div>
        <p class="welcome-text">동료들과 함께하는 스마트한 점심 관리</p>
      </div>

      <!-- 인증 폼 컨테이너 -->
      <div class="auth-form-container">
        <!-- 로그인 폼 -->
        <div v-if="authMode === 'login'" class="auth-form">
          <div class="form-header">
            <h2>로그인</h2>
            <p>계정에 로그인하여 시작하세요</p>
            <div v-if="isDevelopment" class="dev-info">
              <p><strong>개발환경 계정:</strong></p>
              <p>이메일: <code>test1@example.com</code></p>
              <p>비밀번호: <code>test1</code></p>
              <div class="dev-buttons">
                <button class="dev-login-btn" @click="devLogin">
                  개발용 계정으로 로그인
                </button>
                <button class="dev-signup-btn" @click="devSignup">
                  개발용 계정 생성
                </button>
              </div>
              <p class="dev-note">계정이 없으면 "개발용 계정 생성" 버튼을 클릭하세요</p>
            </div>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group">
              <label>이메일</label>
              <input
                v-model="loginData.email"
                type="email"
                placeholder="your-email@example.com"
                required
                :class="{ error: loginErrors.email }"
              />
              <div v-if="loginErrors.email" class="error-message">
                {{ loginErrors.email }}
              </div>
            </div>

            <div class="form-group">
              <label>비밀번호</label>
              <div class="password-input">
                <input
                  v-model="loginData.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="비밀번호를 입력하세요"
                  required
                  :class="{ error: loginErrors.password }"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="togglePassword"
                >
                  {{ showPassword ? '보기' : '숨기기' }}
                </button>
              </div>
              <div v-if="loginErrors.password" class="error-message">
                {{ loginErrors.password }}
              </div>
            </div>

            <div class="form-options">
              <label class="checkbox-label">
                <input v-model="loginData.rememberMe" type="checkbox" />
                로그인 상태 유지
              </label>
              <a href="#" class="forgot-password">비밀번호를 잊으셨나요?</a>
            </div>

            <div v-if="loginErrors.general" class="error-message general-error">
              {{ loginErrors.general }}
            </div>

            <button
              type="submit"
              class="auth-btn primary"
              :disabled="loading"
            >
              <span v-if="loading" class="loading-spinner"></span>
              {{ loading ? '로그인 중...' : '로그인' }}
            </button>
          </form>

          <div class="auth-switch">
            <p>계정이 없으신가요?</p>
            <button class="switch-btn" @click="switchToSignup">
              회원가입하기
            </button>
          </div>
        </div>

        <!-- 회원가입 폼 -->
        <div v-if="authMode === 'signup'" class="auth-form">
          <!-- 브레드크럼 -->
          <div class="breadcrumb">
            <div class="breadcrumb-item" :class="{ active: signupStep >= 1 }">
              <span class="step-number">1</span>
              <span class="step-text">기본정보</span>
            </div>
            <div class="breadcrumb-separator"></div>
            <div class="breadcrumb-item" :class="{ active: signupStep >= 2 }">
              <span class="step-number">2</span>
              <span class="step-text">프로필</span>
            </div>
            <div class="breadcrumb-separator"></div>
            <div class="breadcrumb-item" :class="{ active: signupStep >= 3 }">
              <span class="step-number">3</span>
              <span class="step-text">완료</span>
            </div>
          </div>

          <div class="form-header">
            <h2>회원가입</h2>
            <p>{{ getSignupStepDescription() }}</p>
          </div>

          <!-- 1단계: 기본 정보 -->
          <form v-if="signupStep === 1" @submit.prevent="nextSignupStep" class="signup-form">
            <div class="form-group">
              <label>이메일</label>
              <input
                v-model="signupData.email"
                type="email"
                placeholder="your-email@example.com"
                required
                :class="{ error: signupErrors.email }"
                @blur="validateEmail"
              />
              <div v-if="signupErrors.email" class="error-message">
                {{ signupErrors.email }}
              </div>
            </div>

            <div class="form-group">
              <label>비밀번호</label>
              <div class="password-input">
                <input
                  v-model="signupData.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="8자 이상의 비밀번호"
                  required
                  :class="{ error: signupErrors.password }"
                  @input="validatePassword"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="togglePassword"
                >
                  {{ showPassword ? '보기' : '숨기기' }}
                </button>
              </div>
              <div v-if="signupErrors.password" class="error-message">
                {{ signupErrors.password }}
              </div>
              <div class="password-strength" v-if="signupData.password">
                <div class="strength-bar">
                  <div 
                    class="strength-fill" 
                    :class="passwordStrength.level"
                    :style="{ width: passwordStrength.percentage + '%' }"
                  ></div>
                </div>
                <span class="strength-text">{{ passwordStrength.text }}</span>
              </div>
            </div>

            <div class="form-group">
              <label>비밀번호 확인</label>
              <input
                v-model="signupData.confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                required
                :class="{ error: signupErrors.confirmPassword }"
                @input="validateConfirmPassword"
              />
              <div v-if="signupErrors.confirmPassword" class="error-message">
                {{ signupErrors.confirmPassword }}
              </div>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input 
                  v-model="signupData.agreeTerms" 
                  type="checkbox" 
                  required
                />
                <span>이용약관 및 개인정보처리방침에 동의합니다</span>
              </label>
            </div>

            <button
              type="submit"
              class="auth-btn primary"
              :disabled="!isStep1Valid"
            >
              다음 단계
            </button>
          </form>

          <!-- 2단계: 프로필 정보 -->
          <form v-if="signupStep === 2" @submit.prevent="nextSignupStep" class="signup-form">
            <div class="form-group">
              <label>이름</label>
              <input
                v-model="signupData.name"
                type="text"
                placeholder="홍길동"
                required
                :class="{ error: signupErrors.name }"
              />
              <div v-if="signupErrors.name" class="error-message">
                {{ signupErrors.name }}
              </div>
            </div>

            <div class="form-group">
              <label>부서/팀 (선택사항)</label>
              <input
                v-model="signupData.department"
                type="text"
                placeholder="개발팀"
              />
            </div>

            <div class="form-group">
              <label>선호 음식 카테고리</label>
              <div class="category-grid">
                <label 
                  v-for="category in foodCategories" 
                  :key="category.id"
                  class="category-option"
                  :class="{ selected: signupData.preferences.includes(category.id) }"
                >
                  <input 
                    type="checkbox" 
                    :value="category.id"
                    v-model="signupData.preferences"
                  />
                  <span class="category-icon">{{ category.icon }}</span>
                  <span class="category-name">{{ category.name }}</span>
                </label>
              </div>
            </div>

            <div class="form-actions">
              <button
                type="button"
                class="auth-btn secondary"
                @click="prevSignupStep"
              >
                이전
              </button>
              <button
                type="submit"
                class="auth-btn primary"
                :disabled="!isStep2Valid"
              >
                다음 단계
              </button>
            </div>
          </form>

          <!-- 3단계: 완료 -->
          <div v-if="signupStep === 3" class="signup-complete">
            <div class="complete-icon">🎉</div>
            <h3>회원가입이 완료되었습니다!</h3>
            <p>이제 동료들과 함께 점심을 계획해보세요.</p>
            
            <div class="complete-actions">
              <button
                class="auth-btn primary"
                @click="handleSignup"
                :disabled="loading"
              >
                <span v-if="loading" class="loading-spinner"></span>
                {{ loading ? '처리 중...' : '시작하기' }}
              </button>
            </div>
          </div>

          <div class="auth-switch">
            <p>이미 계정이 있으신가요?</p>
            <button class="switch-btn" @click="switchToLogin">
              로그인하기
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
// import { login, signup, resetPassword, devAutoLogin } from '@/services/firebaseAuth';

export default {
  name: 'Auth',
  setup() {
    const router = useRouter();
    
    // 인증 모드 (login, signup)
    const authMode = ref('login');
    
    // 로딩 상태
    const loading = ref(false);
    const showPassword = ref(false);
    
    // 로그인 데이터
    const loginData = ref({
      email: '',
      password: '',
      rememberMe: false
    });
    
    // 회원가입 데이터
    const signupData = ref({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      department: '',
      preferences: [],
      agreeTerms: false
    });
    
    // 회원가입 단계
    const signupStep = ref(1);
    
    // 에러 메시지
    const loginErrors = ref({
      email: '',
      password: '',
      general: ''
    });
    const signupErrors = ref({});
    
    // 개발환경 확인
    const isDevelopment = computed(() => {
      return import.meta.env.MODE === 'development';
    });
    
    // 음식 카테고리
    const foodCategories = ref([
      { id: 'korean', name: '한식', icon: '🍚' },
      { id: 'chinese', name: '중식', icon: '🥢' },
      { id: 'japanese', name: '일식', icon: '🍣' },
      { id: 'western', name: '양식', icon: '🍝' },
      { id: 'fastfood', name: '패스트푸드', icon: '🍔' },
      { id: 'cafe', name: '카페/디저트', icon: '☕' },
      { id: 'healthy', name: '건강식', icon: '🥗' },
      { id: 'snack', name: '간식', icon: '🍿' }
    ]);
    
    // 비밀번호 강도 계산
    const passwordStrength = computed(() => {
      const password = signupData.value.password;
      if (!password) return { level: 'weak', percentage: 0, text: '' };
      
      let score = 0;
      if (password.length >= 8) score += 20;
      if (password.length >= 12) score += 10;
      if (/[a-z]/.test(password)) score += 10;
      if (/[A-Z]/.test(password)) score += 10;
      if (/[0-9]/.test(password)) score += 10;
      if (/[^A-Za-z0-9]/.test(password)) score += 10;
      
      if (score < 30) return { level: 'weak', percentage: score, text: '약함' };
      if (score < 60) return { level: 'medium', percentage: score, text: '보통' };
      return { level: 'strong', percentage: score, text: '강함' };
    });
    
    // 1단계 유효성 검사
    const isStep1Valid = computed(() => {
      return signupData.value.email && 
             signupData.value.password && 
             signupData.value.confirmPassword &&
             signupData.value.agreeTerms &&
             !signupErrors.value.email &&
             !signupErrors.value.password &&
             !signupErrors.value.confirmPassword;
    });
    
    // 2단계 유효성 검사
    const isStep2Valid = computed(() => {
      return signupData.value.name && signupData.value.name.trim().length > 0;
    });
    
    // 인증 모드 전환
    const switchToLogin = () => {
      authMode.value = 'login';
      clearErrors();
      resetForms();
    };
    
    const switchToSignup = () => {
      authMode.value = 'signup';
      signupStep.value = 1;
      clearErrors();
      resetForms();
    };
    
    // 폼 초기화
    const resetForms = () => {
      loginData.value = { email: '', password: '', rememberMe: false };
      signupData.value = { 
        email: '', 
        password: '', 
        confirmPassword: '', 
        name: '', 
        department: '', 
        preferences: [], 
        agreeTerms: false 
      };
    };
    
    // 에러 초기화
    const clearErrors = () => {
      loginErrors.value = {
        email: '',
        password: '',
        general: ''
      };
      signupErrors.value = {};
    };
    
    // 비밀번호 표시 토글
    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };
    
    // 이메일 유효성 검사
    const validateEmail = () => {
      const email = signupData.value.email;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!email) {
        signupErrors.value.email = '';
        return;
      }
      
      if (!emailRegex.test(email)) {
        signupErrors.value.email = '올바른 이메일 형식이 아닙니다.';
      } else {
        signupErrors.value.email = '';
      }
    };
    
    // 비밀번호 유효성 검사
    const validatePassword = () => {
      const password = signupData.value.password;
      
      if (!password) {
        signupErrors.value.password = '';
        return;
      }
      
      if (password.length < 8) {
        signupErrors.value.password = '비밀번호는 8자 이상이어야 합니다.';
      } else {
        signupErrors.value.password = '';
      }
    };
    
    // 비밀번호 확인 검사
    const validateConfirmPassword = () => {
      const password = signupData.value.password;
      const confirmPassword = signupData.value.confirmPassword;
      
      if (!confirmPassword) {
        signupErrors.value.confirmPassword = '';
        return;
      }
      
      if (password !== confirmPassword) {
        signupErrors.value.confirmPassword = '비밀번호가 일치하지 않습니다.';
      } else {
        signupErrors.value.confirmPassword = '';
      }
    };
    
    // 회원가입 단계 설명
    const getSignupStepDescription = () => {
      switch (signupStep.value) {
        case 1: return '기본 정보를 입력해주세요';
        case 2: return '프로필 정보를 설정해주세요';
        case 3: return '회원가입을 완료하세요';
        default: return '';
      }
    };
    
    // 회원가입 단계 이동
    const nextSignupStep = () => {
      if (signupStep.value < 3) {
        signupStep.value++;
      }
    };
    
    const prevSignupStep = () => {
      if (signupStep.value > 1) {
        signupStep.value--;
      }
    };
    
    // 개발용 계정 생성 (목업)
    const devSignup = async () => {
      loading.value = true;
      clearErrors();
      
      try {
        // 목업 계정 생성 처리
        await new Promise(resolve => setTimeout(resolve, 1500)); // 로딩 시뮬레이션
        
        console.log('개발용 계정 생성 성공 (목업)');
        
        // 계정 생성 후 바로 로그인하여 메인 페이지로 이동
        router.push('/home');
        
      } catch (error) {
        console.error('개발용 계정 생성 실패:', error);
        loginErrors.value.general = '계정 생성에 실패했습니다.';
      } finally {
        loading.value = false;
      }
    };
    
    // 개발용 로그인 (목업)
    const devLogin = async () => {
      loading.value = true;
      clearErrors();
      
      try {
        // 개발용 계정 정보로 자동 입력
        loginData.value.email = 'test1@example.com';
        loginData.value.password = 'test1';
        
        // 목업 로그인 처리
        await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
        
        console.log('개발용 로그인 성공 (목업)');
        
        // 로그인 성공 후 메인 페이지로 이동
        router.push('/home');
      } catch (error) {
        console.error('개발용 로그인 실패:', error);
        loginErrors.value.general = '로그인에 실패했습니다.';
      } finally {
        loading.value = false;
      }
    };
    
    // 로그인 처리
    const handleLogin = async () => {
      loading.value = true;
      clearErrors();
      
      try {
        // 목업 로그인 처리
        await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
        
        // 간단한 유효성 검사
        if (loginData.value.email !== 'test1@example.com' || loginData.value.password !== 'test1') {
          throw new Error('Invalid credentials');
        }
        
        console.log('로그인 성공 (목업)');
        
        // 메인 페이지로 이동
        router.push('/home');
        
      } catch (error) {
        console.error('로그인 실패:', error);
        
        // 에러 메시지 설정
        if (loginData.value.email !== 'test1@example.com') {
          loginErrors.value.email = '등록되지 않은 이메일입니다.';
        } else if (loginData.value.password !== 'test1') {
          loginErrors.value.password = '비밀번호가 일치하지 않습니다.';
        } else {
          loginErrors.value.general = '로그인에 실패했습니다.';
        }
      } finally {
        loading.value = false;
      }
    };
    
    // 회원가입 처리
    const handleSignup = async () => {
      loading.value = true;
      
      try {
        // 목업 회원가입 처리
        await new Promise(resolve => setTimeout(resolve, 1500)); // 로딩 시뮬레이션
        
        console.log('회원가입 성공 (목업):', signupData.value.email);
        
        // 메인 페이지로 이동
        router.push('/home');
        
      } catch (error) {
        console.error('회원가입 실패:', error);
        alert('회원가입에 실패했습니다. 다시 시도해주세요.');
      } finally {
        loading.value = false;
      }
    };
    
    return {
      authMode,
      loading,
      showPassword,
      loginData,
      signupData,
      signupStep,
      loginErrors,
      signupErrors,
      isDevelopment,
      foodCategories,
      passwordStrength,
      isStep1Valid,
      isStep2Valid,
      switchToLogin,
      switchToSignup,
      togglePassword,
      validateEmail,
      validatePassword,
      validateConfirmPassword,
      getSignupStepDescription,
      nextSignupStep,
      prevSignupStep,
      devSignup,
      devLogin,
      handleLogin,
      handleSignup
    };
  }
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('@/assets/header_img_food2.jpg') center/cover no-repeat;
  opacity: 0.3;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.8) 0%,
    rgba(118, 75, 162, 0.8) 100%
  );
}

.auth-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.auth-header {
  color: white;
  text-align: center;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
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
  line-height: 1;
  margin-bottom: 0.25rem;
}

.logo-sub {
  font-size: 1.5rem;
  font-weight: 300;
  opacity: 0.9;
  line-height: 1;
}

.welcome-text {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0;
}

.auth-form-container {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.auth-form {
  width: 100%;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.form-header p {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.dev-info {
  background: #f0f9ff;
  border: 2px solid #0ea5e9;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  text-align: left;
}

.dev-info p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: #1e40af;
}

.dev-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.dev-login-btn, .dev-signup-btn {
  background: #0ea5e9;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 120px;
}

.dev-login-btn:hover, .dev-signup-btn:hover {
  background: #0284c7;
  transform: translateY(-1px);
}

.dev-signup-btn {
  background: #10b981;
}

.dev-signup-btn:hover {
  background: #059669;
}

.dev-note {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.5rem;
  font-style: italic;
}

.dev-info code {
  background: #f3f4f6;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: #1f2937;
}

/* 브레드크럼 */
.breadcrumb {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.breadcrumb-item.active {
  background: var(--color-primary);
  color: white;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--border-light);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.breadcrumb-item.active .step-number {
  background: white;
  color: var(--color-primary);
}

.step-text {
  font-size: 0.9rem;
  font-weight: 600;
}

.breadcrumb-separator {
  width: 20px;
  height: 2px;
  background: var(--border-light);
  margin: 0 0.5rem;
}

/* 폼 스타일 */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border-light);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--bg-secondary);
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.form-group input.error {
  border-color: var(--color-danger);
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.password-toggle:hover {
  background: var(--bg-tertiary);
}

.error-message {
  color: var(--color-danger);
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.general-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 500;
}

.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  width: 100%;
  height: 4px;
  background: var(--border-light);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-fill.weak {
  background: var(--color-danger);
}

.strength-fill.medium {
  background: var(--color-warning);
}

.strength-fill.strong {
  background: var(--color-success);
}

.strength-text {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.forgot-password {
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.forgot-password:hover {
  text-decoration: underline;
}

.auth-btn {
  width: 100%;
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.auth-btn.primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
}

.auth-btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 2px solid var(--border-light);
}

.auth-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.auth-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.auth-switch {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-light);
}

.auth-switch p {
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
}

.switch-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

.switch-btn:hover {
  color: var(--color-secondary);
}

/* 카테고리 그리드 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.8rem;
}

.category-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0.5rem;
  border: 2px solid var(--border-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-option:hover {
  border-color: var(--color-primary);
  background: rgba(14, 165, 233, 0.05);
}

.category-option.selected {
  border-color: var(--color-primary);
  background: rgba(14, 165, 233, 0.1);
}

.category-option input {
  display: none;
}

.category-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.category-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

/* 폼 액션 */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.form-actions .auth-btn {
  flex: 1;
}

/* 회원가입 완료 */
.signup-complete {
  text-align: center;
  padding: 2rem 0;
}

.complete-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.signup-complete h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.signup-complete p {
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
}

.complete-actions {
  display: flex;
  justify-content: center;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .auth-container {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .auth-form-container {
    padding: 2rem;
  }
  
  .logo-main {
    font-size: 2.5rem;
  }
  
  .logo-sub {
    font-size: 1.2rem;
  }
  
  .breadcrumb {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .breadcrumb-separator {
    width: 2px;
    height: 20px;
    margin: 0.5rem 0;
  }
  
  .category-grid {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>
