<template>
  <div class="group-create">
    <form @submit.prevent="createGroup" class="create-form">
      <div class="form-group">
        <label>그룹 이름</label>
        <input 
          v-model="groupData.name"
          type="text" 
          placeholder="예: 개발팀 점심모임"
          required
        />
      </div>
      
      <div class="form-group">
        <label>그룹 설명 (선택사항)</label>
        <textarea 
          v-model="groupData.description"
          placeholder="그룹에 대한 간단한 설명을 입력하세요"
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label>기본 점심 시간</label>
        <input 
          v-model="groupData.settings.defaultMeetingTime"
          type="time" 
          required
        />
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input 
            v-model="groupData.settings.notificationEnabled"
            type="checkbox"
          />
          알림 활성화
        </label>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input 
            v-model="groupData.settings.autoRecommend"
            type="checkbox"
          />
          자동 추천 활성화
        </label>
      </div>
      
      <div class="form-actions">
        <button 
          type="submit" 
          class="btn primary"
          :disabled="!groupData.name || creating"
        >
          <span v-if="creating" class="loading-spinner"></span>
          {{ creating ? '생성 중...' : '그룹 생성하기' }}
        </button>
      </div>
    </form>
    
    <!-- 생성 완료 후 초대 정보 표시 -->
    <div v-if="createdGroup" class="group-created">
      <div class="success-icon">✅</div>
      <h3>그룹이 성공적으로 생성되었습니다!</h3>
      
      <div class="invite-info">
        <div class="invite-item">
          <label>그룹 코드:</label>
          <div class="code-display">
            <span class="code">{{ createdGroup.code }}</span>
            <button class="copy-btn" @click="copyCode">복사</button>
          </div>
        </div>
        
        <div class="invite-item">
          <label>초대 링크:</label>
          <div class="link-display">
            <input 
              :value="createdGroup.inviteLink" 
              readonly 
              class="link-input"
            />
            <button class="copy-btn" @click="copyLink">복사</button>
          </div>
        </div>
      </div>
      
      <p class="share-tip">
        위의 코드나 링크를 동료들에게 공유하여 그룹에 초대하세요.
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { createGroup } from '@/services/firebaseDBv2';

export default {
  name: 'GroupCreate',
  emits: ['group-created'],
  setup(props, { emit }) {
    const creating = ref(false);
    const createdGroup = ref(null);
    
    const groupData = ref({
      name: '',
      description: '',
      settings: {
        defaultMeetingTime: '12:00',
        notificationEnabled: true,
        autoRecommend: true
      }
    });

    const createGroup = async () => {
      if (!groupData.value.name) return;
      
      creating.value = true;
      
      try {
        // 실제 구현에서는 현재 사용자 ID를 가져와야 함
        const currentUserId = 'temp-user-id'; // 임시 사용자 ID
        
        const groupDataWithUser = {
          ...groupData.value,
          createdBy: currentUserId,
          members: [currentUserId],
          admins: [currentUserId],
          isActive: true
        };
        
        const result = await createGroup(groupDataWithUser);
        
        createdGroup.value = result;
        
        // 부모 컴포넌트에 그룹 생성 완료 알림
        emit('group-created', {
          id: result.id,
          name: groupData.value.name,
          code: result.code,
          inviteLink: result.inviteLink
        });
        
      } catch (error) {
        console.error('그룹 생성 실패:', error);
        alert('그룹 생성에 실패했습니다. 다시 시도해주세요.');
      } finally {
        creating.value = false;
      }
    };

    const copyCode = async () => {
      try {
        await navigator.clipboard.writeText(createdGroup.value.code);
        alert('그룹 코드가 복사되었습니다!');
      } catch (error) {
        console.error('복사 실패:', error);
        // 폴백: 텍스트 선택
        const codeElement = document.querySelector('.code');
        if (codeElement) {
          codeElement.select();
          document.execCommand('copy');
          alert('그룹 코드가 복사되었습니다!');
        }
      }
    };

    const copyLink = async () => {
      try {
        await navigator.clipboard.writeText(createdGroup.value.inviteLink);
        alert('초대 링크가 복사되었습니다!');
      } catch (error) {
        console.error('복사 실패:', error);
        // 폴백: 텍스트 선택
        const linkInput = document.querySelector('.link-input');
        if (linkInput) {
          linkInput.select();
          document.execCommand('copy');
          alert('초대 링크가 복사되었습니다!');
        }
      }
    };

    return {
      creating,
      createdGroup,
      groupData,
      createGroup,
      copyCode,
      copyLink
    };
  }
};
</script>

<style scoped>
.group-create {
  max-width: 500px;
  margin: 0 auto;
}

.create-form {
  text-align: left;
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

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid var(--border-light);
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--bg-secondary);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.form-actions {
  text-align: center;
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
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn.primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
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

/* 그룹 생성 완료 */
.group-created {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 2rem;
  margin-top: 2rem;
  text-align: center;
}

.success-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.group-created h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
}

.invite-info {
  text-align: left;
  margin-bottom: 1.5rem;
}

.invite-item {
  margin-bottom: 1rem;
}

.invite-item:last-child {
  margin-bottom: 0;
}

.invite-item label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.code-display,
.link-display {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.code {
  background: var(--color-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-family: monospace;
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: 0.1em;
}

.link-input {
  flex: 1;
  padding: 0.5rem;
  border: 2px solid var(--border-light);
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
}

.copy-btn {
  padding: 0.5rem 1rem;
  background: var(--color-secondary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-btn:hover {
  background: var(--color-primary);
  transform: translateY(-1px);
}

.share-tip {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
  font-style: italic;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .code-display,
  .link-display {
    flex-direction: column;
    align-items: stretch;
  }
  
  .copy-btn {
    width: 100%;
  }
}
</style>
