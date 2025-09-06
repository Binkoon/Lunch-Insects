<template>
  <div class="onboarding">
    <!-- 온보딩 단계 표시 -->
    <div class="onboarding-progress">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
        ></div>
      </div>
      <div class="progress-text">
        {{ currentStep }} / {{ totalSteps }}
      </div>
    </div>

    <!-- 단계별 콘텐츠 -->
    <div class="onboarding-content">
      <!-- 1단계: 환영 메시지 -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="step-icon">👋</div>
        <h1 class="step-title">식충이 캘린더에 오신 것을 환영합니다!</h1>
        <p class="step-description">
          동료들과 함께하는 스마트한 점심 관리 플랫폼입니다.<br>
          몇 가지 간단한 설정으로 시작해보세요.
        </p>
        <div class="step-actions">
          <button class="btn primary" @click="nextStep">
            시작하기
          </button>
        </div>
      </div>

      <!-- 2단계: 프로필 설정 -->
      <div v-if="currentStep === 2" class="step-content">
        <div class="step-icon">👤</div>
        <h1 class="step-title">프로필을 설정해주세요</h1>
        <p class="step-description">
          동료들이 쉽게 알아볼 수 있도록 프로필을 설정해주세요.
        </p>
        
        <form @submit.prevent="saveProfile" class="profile-form">
          <div class="form-group">
            <label>이름</label>
            <input 
              v-model="profile.name"
              type="text" 
              placeholder="홍길동"
              required
            />
          </div>
          
          <div class="form-group">
            <label>부서/팀</label>
            <input 
              v-model="profile.department"
              type="text" 
              placeholder="개발팀"
            />
          </div>
          
          <div class="form-group">
            <label>선호 음식 카테고리</label>
            <div class="category-selector">
              <label 
                v-for="category in foodCategories" 
                :key="category.id"
                class="category-option"
                :class="{ selected: profile.preferences.includes(category.id) }"
              >
                <input 
                  type="checkbox" 
                  :value="category.id"
                  v-model="profile.preferences"
                />
                <span class="category-icon">{{ category.icon }}</span>
                <span class="category-name">{{ category.name }}</span>
              </label>
            </div>
          </div>
          
          <div class="step-actions">
            <button type="button" class="btn secondary" @click="prevStep">
              이전
            </button>
            <button type="submit" class="btn primary" :disabled="!profile.name">
              다음
            </button>
          </div>
        </form>
      </div>

      <!-- 3단계: 그룹 참여 방식 선택 -->
      <div v-if="currentStep === 3" class="step-content">
        <div class="step-icon">👥</div>
        <h1 class="step-title">그룹에 참여하세요</h1>
        <p class="step-description">
          동료들과 함께 점심을 계획하려면 그룹에 참여해야 합니다.
        </p>
        
        <div class="group-options">
          <div class="option-card" @click="selectGroupOption('join')">
            <div class="option-icon">🔑</div>
            <h3>기존 그룹 참여</h3>
            <p>동료로부터 받은 초대 코드나 링크로 참여</p>
          </div>
          
          <div class="option-card" @click="selectGroupOption('create')">
            <div class="option-icon">➕</div>
            <h3>새 그룹 생성</h3>
            <p>새로운 그룹을 만들고 동료들을 초대</p>
          </div>
        </div>
        
        <div class="step-actions">
          <button type="button" class="btn secondary" @click="prevStep">
            이전
          </button>
          <button 
            class="btn primary" 
            @click="nextStep"
            :disabled="!selectedGroupOption"
          >
            다음
          </button>
        </div>
      </div>

      <!-- 4단계: 그룹 참여/생성 -->
      <div v-if="currentStep === 4" class="step-content">
        <div class="step-icon">🎯</div>
        <h1 class="step-title">
          {{ selectedGroupOption === 'join' ? '그룹 참여하기' : '그룹 생성하기' }}
        </h1>
        <p class="step-description">
          {{ selectedGroupOption === 'join' 
            ? '동료로부터 받은 초대 정보를 입력하세요.' 
            : '새로운 그룹을 만들어보세요.' 
          }}
        </p>
        
        <!-- 그룹 참여 -->
        <div v-if="selectedGroupOption === 'join'">
          <GroupJoin @group-joined="handleGroupJoined" />
        </div>
        
        <!-- 그룹 생성 -->
        <div v-if="selectedGroupOption === 'create'">
          <GroupCreate @group-created="handleGroupCreated" />
        </div>
        
        <div class="step-actions">
          <button type="button" class="btn secondary" @click="prevStep">
            이전
          </button>
        </div>
      </div>

      <!-- 5단계: 완료 -->
      <div v-if="currentStep === 5" class="step-content">
        <div class="step-icon">🎉</div>
        <h1 class="step-title">설정이 완료되었습니다!</h1>
        <p class="step-description">
          이제 동료들과 함께 점심을 계획하고 즐겨보세요.
        </p>
        
        <div class="completion-info">
          <div class="info-item">
            <span class="info-label">이름:</span>
            <span class="info-value">{{ profile.name }}</span>
          </div>
          <div class="info-item" v-if="profile.department">
            <span class="info-label">부서:</span>
            <span class="info-value">{{ profile.department }}</span>
          </div>
          <div class="info-item" v-if="joinedGroup">
            <span class="info-label">참여 그룹:</span>
            <span class="info-value">{{ joinedGroup.name }}</span>
          </div>
        </div>
        
        <div class="step-actions">
          <button class="btn primary" @click="completeOnboarding">
            앱 시작하기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import GroupJoin from '@/components/Features/GroupJoin.vue';
import GroupCreate from '@/components/Features/GroupCreate.vue';
import { createUser } from '@/services/firebaseDBv2';

export default {
  name: 'Onboarding',
  components: {
    GroupJoin,
    GroupCreate
  },
  setup() {
    const router = useRouter();
    
    // 온보딩 상태
    const currentStep = ref(1);
    const totalSteps = 5;
    
    // 프로필 데이터
    const profile = ref({
      name: '',
      department: '',
      preferences: []
    });
    
    // 그룹 옵션
    const selectedGroupOption = ref('');
    const joinedGroup = ref(null);
    
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

    // 단계 이동
    const nextStep = () => {
      if (currentStep.value < totalSteps) {
        currentStep.value++;
      }
    };

    const prevStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--;
      }
    };

    // 그룹 옵션 선택
    const selectGroupOption = (option) => {
      selectedGroupOption.value = option;
    };

    // 프로필 저장
    const saveProfile = async () => {
      try {
        // 실제 구현에서는 사용자 프로필 저장
        console.log('프로필 저장:', profile.value);
        nextStep();
      } catch (error) {
        console.error('프로필 저장 실패:', error);
      }
    };

    // 그룹 참여 완료
    const handleGroupJoined = (group) => {
      joinedGroup.value = group;
      nextStep();
    };

    // 그룹 생성 완료
    const handleGroupCreated = (group) => {
      joinedGroup.value = group;
      nextStep();
    };

    // 온보딩 완료
    const completeOnboarding = () => {
      // 실제 구현에서는 온보딩 완료 상태 저장
      console.log('온보딩 완료');
      router.push('/home');
    };

    return {
      currentStep,
      totalSteps,
      profile,
      selectedGroupOption,
      joinedGroup,
      foodCategories,
      nextStep,
      prevStep,
      selectGroupOption,
      saveProfile,
      handleGroupJoined,
      handleGroupCreated,
      completeOnboarding
    };
  }
};
</script>

<style scoped>
.onboarding {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.onboarding-progress {
  width: 100%;
  max-width: 600px;
  margin-bottom: 3rem;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
}

.onboarding-content {
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.step-content {
  text-align: center;
}

.step-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.step-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.step-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.step-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.btn.primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
}

.btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 2px solid var(--border-light);
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 프로필 폼 */
.profile-form {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
}

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
  padding: 0.8rem;
  border: 2px solid var(--border-light);
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.category-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.8rem;
}

.category-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
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
}

/* 그룹 옵션 */
.group-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
}

.option-card {
  padding: 2rem;
  border: 2px solid var(--border-light);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-card:hover {
  border-color: var(--color-primary);
  background: rgba(14, 165, 233, 0.05);
  transform: translateY(-2px);
}

.option-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.option-card h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.option-card p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}

/* 완료 정보 */
.completion-info {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 2rem 0;
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 600;
  color: var(--text-secondary);
}

.info-value {
  color: var(--text-primary);
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .onboarding {
    padding: 1rem;
  }
  
  .onboarding-content {
    padding: 2rem;
  }
  
  .step-title {
    font-size: 1.5rem;
  }
  
  .step-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .group-options {
    grid-template-columns: 1fr;
  }
  
  .category-selector {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
}
</style>
