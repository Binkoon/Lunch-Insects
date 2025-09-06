<template>
  <div class="group-join">
    <!-- 그룹 참여 방식 선택 -->
    <div class="join-methods">
      <h2 class="join-title">그룹에 참여하기</h2>
      <p class="join-description">다음 중 하나의 방법으로 그룹에 참여할 수 있습니다.</p>
      
      <div class="method-cards">
        <!-- 그룹 코드로 참여 -->
        <div class="method-card" :class="{ active: selectedMethod === 'code' }" @click="selectMethod('code')">
          <div class="method-icon">🔑</div>
          <h3 class="method-title">그룹 코드</h3>
          <p class="method-description">6자리 코드를 입력하여 참여</p>
        </div>
        
        <!-- 초대 링크로 참여 -->
        <div class="method-card" :class="{ active: selectedMethod === 'link' }" @click="selectMethod('link')">
          <div class="method-icon">🔗</div>
          <h3 class="method-title">초대 링크</h3>
          <p class="method-description">초대 링크를 입력하여 참여</p>
        </div>
        
        <!-- 이메일 초대 -->
        <div class="method-card" :class="{ active: selectedMethod === 'email' }" @click="selectMethod('email')">
          <div class="method-icon">📧</div>
          <h3 class="method-title">이메일 초대</h3>
          <p class="method-description">이메일로 받은 초대 확인</p>
        </div>
      </div>
    </div>

    <!-- 그룹 코드 입력 폼 -->
    <div v-if="selectedMethod === 'code'" class="join-form">
      <div class="form-header">
        <h3>그룹 코드 입력</h3>
        <p>그룹 관리자로부터 받은 6자리 코드를 입력하세요.</p>
      </div>
      
      <form @submit.prevent="joinByCode" class="code-form">
        <div class="input-group">
          <input
            v-model="groupCode"
            type="text"
            placeholder="ABC123"
            maxlength="6"
            class="code-input"
            :class="{ error: codeError }"
            @input="formatCodeInput"
            @keyup="validateCode"
          />
          <div class="input-decoration">
            <span v-for="i in 6" :key="i" class="code-char" :class="{ filled: groupCode.length >= i }">
              {{ groupCode[i-1] || '' }}
            </span>
          </div>
        </div>
        
        <div v-if="codeError" class="error-message">
          {{ codeError }}
        </div>
        
        <button 
          type="submit" 
          class="join-btn primary"
          :disabled="!isCodeValid || loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '참여 중...' : '그룹 참여하기' }}
        </button>
      </form>
    </div>

    <!-- 초대 링크 입력 폼 -->
    <div v-if="selectedMethod === 'link'" class="join-form">
      <div class="form-header">
        <h3>초대 링크 입력</h3>
        <p>그룹 관리자로부터 받은 초대 링크를 입력하세요.</p>
      </div>
      
      <form @submit.prevent="joinByLink" class="link-form">
        <div class="input-group">
          <input
            v-model="inviteLink"
            type="url"
            placeholder="https://app.com/join/group-id"
            class="link-input"
            :class="{ error: linkError }"
          />
        </div>
        
        <div v-if="linkError" class="error-message">
          {{ linkError }}
        </div>
        
        <button 
          type="submit" 
          class="join-btn primary"
          :disabled="!inviteLink || loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '참여 중...' : '그룹 참여하기' }}
        </button>
      </form>
    </div>

    <!-- 이메일 초대 확인 폼 -->
    <div v-if="selectedMethod === 'email'" class="join-form">
      <div class="form-header">
        <h3>이메일 초대 확인</h3>
        <p>이메일로 받은 초대를 확인하고 참여하세요.</p>
      </div>
      
      <form @submit.prevent="joinByEmail" class="email-form">
        <div class="input-group">
          <input
            v-model="inviteEmail"
            type="email"
            placeholder="your-email@example.com"
            class="email-input"
            :class="{ error: emailError }"
          />
        </div>
        
        <div v-if="emailError" class="error-message">
          {{ emailError }}
        </div>
        
        <button 
          type="submit" 
          class="join-btn primary"
          :disabled="!inviteEmail || loading"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? '확인 중...' : '초대 확인하기' }}
        </button>
      </form>
    </div>

    <!-- 그룹 정보 미리보기 -->
    <div v-if="groupPreview" class="group-preview">
      <div class="preview-header">
        <h3>참여할 그룹</h3>
        <button class="close-preview" @click="closePreview">×</button>
      </div>
      
      <div class="preview-content">
        <div class="group-info">
          <h4 class="group-name">{{ groupPreview.name }}</h4>
          <p class="group-description">{{ groupPreview.description }}</p>
          <div class="group-stats">
            <span class="member-count">
              <i class="icon-users"></i>
              {{ groupPreview.members?.length || 0 }}명
            </span>
            <span class="group-created">
              <i class="icon-calendar"></i>
              {{ formatDate(groupPreview.createdAt) }} 생성
            </span>
          </div>
        </div>
        
        <div class="preview-actions">
          <button class="join-btn secondary" @click="closePreview">
            취소
          </button>
          <button class="join-btn primary" @click="confirmJoin">
            <span v-if="joining" class="loading-spinner"></span>
            {{ joining ? '참여 중...' : '참여하기' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { 
  getGroupByCode, 
  getGroupByInviteLink,
  getEmailInvite,
  addGroupMember,
  acceptEmailInvite,
  getUserGroups 
} from '@/services/firebaseDBv2';

export default {
  name: 'GroupJoin',
  emits: ['group-joined', 'join-cancelled'],
  setup(props, { emit }) {
    // 상태 관리
    const selectedMethod = ref('code');
    const groupCode = ref('');
    const inviteLink = ref('');
    const inviteEmail = ref('');
    const loading = ref(false);
    const joining = ref(false);
    const groupPreview = ref(null);
    
    // 에러 메시지
    const codeError = ref('');
    const linkError = ref('');
    const emailError = ref('');

    // 코드 유효성 검사
    const isCodeValid = computed(() => {
      return groupCode.value.length === 6 && /^[A-Z0-9]+$/.test(groupCode.value);
    });

    // 메서드 선택
    const selectMethod = (method) => {
      selectedMethod.value = method;
      clearErrors();
      clearInputs();
    };

    // 입력값 초기화
    const clearInputs = () => {
      groupCode.value = '';
      inviteLink.value = '';
      inviteEmail.value = '';
    };

    // 에러 초기화
    const clearErrors = () => {
      codeError.value = '';
      linkError.value = '';
      emailError.value = '';
    };

    // 코드 입력 포맷팅
    const formatCodeInput = (event) => {
      let value = event.target.value.toUpperCase();
      value = value.replace(/[^A-Z0-9]/g, '');
      groupCode.value = value;
    };

    // 코드 유효성 검사
    const validateCode = () => {
      if (groupCode.value.length === 6) {
        if (!/^[A-Z0-9]+$/.test(groupCode.value)) {
          codeError.value = '영문자와 숫자만 입력 가능합니다.';
        } else {
          codeError.value = '';
        }
      } else {
        codeError.value = '';
      }
    };

    // 그룹 코드로 참여
    const joinByCode = async () => {
      if (!isCodeValid.value) return;
      
      loading.value = true;
      codeError.value = '';
      
      try {
        const group = await getGroupByCode(groupCode.value);
        
        if (!group) {
          codeError.value = '유효하지 않은 그룹 코드입니다.';
          return;
        }
        
        groupPreview.value = group;
      } catch (error) {
        console.error('그룹 조회 실패:', error);
        codeError.value = '그룹을 찾을 수 없습니다.';
      } finally {
        loading.value = false;
      }
    };

    // 초대 링크로 참여
    const joinByLink = async () => {
      if (!inviteLink.value) return;
      
      loading.value = true;
      linkError.value = '';
      
      try {
        // URL에서 그룹 ID 추출
        const url = new URL(inviteLink.value);
        const groupId = url.pathname.split('/').pop();
        
        if (!groupId) {
          linkError.value = '유효하지 않은 초대 링크입니다.';
          return;
        }
        
        // 그룹 정보 조회
        const group = await getGroupByInviteLink(groupId);
        
        if (!group) {
          linkError.value = '유효하지 않은 초대 링크입니다.';
          return;
        }
        
        groupPreview.value = group;
        
      } catch (error) {
        console.error('링크 처리 실패:', error);
        linkError.value = '유효하지 않은 초대 링크입니다.';
      } finally {
        loading.value = false;
      }
    };

    // 이메일 초대 확인
    const joinByEmail = async () => {
      if (!inviteEmail.value) return;
      
      loading.value = true;
      emailError.value = '';
      
      try {
        const group = await getEmailInvite(inviteEmail.value);
        
        if (!group) {
          emailError.value = '해당 이메일로 받은 초대를 찾을 수 없습니다.';
          return;
        }
        
        groupPreview.value = group;
        
      } catch (error) {
        console.error('이메일 초대 확인 실패:', error);
        emailError.value = '초대를 찾을 수 없습니다.';
      } finally {
        loading.value = false;
      }
    };

    // 그룹 참여 확인
    const confirmJoin = async () => {
      if (!groupPreview.value) return;
      
      joining.value = true;
      
      try {
        // 이메일 초대인 경우 특별 처리
        if (groupPreview.value.inviteId) {
          // 실제 구현에서는 현재 사용자 ID와 데이터를 가져와야 함
          const currentUserId = 'temp-user-id';
          const currentUserData = { groups: [] };
          
          await acceptEmailInvite(groupPreview.value.inviteId, currentUserId, currentUserData);
        } else {
          // 일반 그룹 참여
          // 실제 구현에서는 그룹 참여 API 호출
          console.log('그룹 참여:', groupPreview.value);
        }
        
        // 성공 시 이벤트 발생
        emit('group-joined', groupPreview.value);
        
      } catch (error) {
        console.error('그룹 참여 실패:', error);
        alert('그룹 참여에 실패했습니다. 다시 시도해주세요.');
      } finally {
        joining.value = false;
      }
    };

    // 미리보기 닫기
    const closePreview = () => {
      groupPreview.value = null;
      clearInputs();
      clearErrors();
    };

    // 날짜 포맷팅
    const formatDate = (date) => {
      if (!date) return '알 수 없음';
      return new Date(date).toLocaleDateString('ko-KR');
    };

    return {
      selectedMethod,
      groupCode,
      inviteLink,
      inviteEmail,
      loading,
      joining,
      groupPreview,
      codeError,
      linkError,
      emailError,
      isCodeValid,
      selectMethod,
      formatCodeInput,
      validateCode,
      joinByCode,
      joinByLink,
      joinByEmail,
      confirmJoin,
      closePreview,
      formatDate
    };
  }
};
</script>

<style scoped>
.group-join {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.join-methods {
  margin-bottom: 3rem;
}

.join-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  text-align: center;
}

.join-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
  text-align: center;
}

.method-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.method-card {
  background: var(--bg-secondary);
  border: 2px solid var(--border-light);
  border-radius: 12px;
  padding: 1.5rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.method-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.method-card.active {
  border-color: var(--color-primary);
  background: rgba(14, 165, 233, 0.05);
}

.method-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.method-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.method-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}

.join-form {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.form-header {
  margin-bottom: 2rem;
  text-align: center;
}

.form-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.form-header p {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.input-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.code-input {
  width: 100%;
  padding: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  letter-spacing: 0.5rem;
  border: 2px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-secondary);
  transition: all 0.3s ease;
}

.code-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.code-input.error {
  border-color: var(--color-danger);
}

.input-decoration {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.code-char {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--border-light);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 600;
  background: var(--bg-secondary);
  transition: all 0.3s ease;
}

.code-char.filled {
  border-color: var(--color-primary);
  background: rgba(14, 165, 233, 0.1);
  color: var(--color-primary);
}

.link-input,
.email-input {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  border: 2px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-secondary);
  transition: all 0.3s ease;
}

.link-input:focus,
.email-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.link-input.error,
.email-input.error {
  border-color: var(--color-danger);
}

.error-message {
  color: var(--color-danger);
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.join-btn {
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

.join-btn.primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
}

.join-btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 2px solid var(--border-light);
}

.join-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.join-btn:disabled {
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

.group-preview {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.preview-header h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-preview {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-preview:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.group-info {
  margin-bottom: 2rem;
}

.group-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.group-description {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
}

.group-stats {
  display: flex;
  gap: 1.5rem;
}

.group-stats span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.group-stats i {
  color: var(--color-primary);
}

.preview-actions {
  display: flex;
  gap: 1rem;
}

.preview-actions .join-btn {
  flex: 1;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .group-join {
    padding: 1rem;
  }
  
  .method-cards {
    grid-template-columns: 1fr;
  }
  
  .preview-actions {
    flex-direction: column;
  }
  
  .code-input {
    font-size: 1.2rem;
    letter-spacing: 0.3rem;
  }
  
  .code-char {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 1rem;
  }
}
</style>
