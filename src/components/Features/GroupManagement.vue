<template>
  <div class="group-management">
    <!-- 그룹 헤더 -->
    <div class="group-header">
      <div class="group-info">
        <h2 class="group-name">{{ group.name }}</h2>
        <p class="group-description">{{ group.description }}</p>
        <div class="group-stats">
          <span class="member-count">
            <i class="icon-users"></i>
            {{ group.members?.length || 0 }}명
          </span>
          <span class="group-created">
            <i class="icon-calendar"></i>
            {{ formatDate(group.createdAt) }} 생성
          </span>
        </div>
      </div>
      
      <div class="group-actions" v-if="isAdmin">
        <button class="action-btn primary" @click="openEditGroupModal">
          <i class="icon-edit"></i>
          그룹 설정
        </button>
        <button class="action-btn secondary" @click="openInviteModal">
          <i class="icon-user-plus"></i>
          멤버 초대
        </button>
      </div>
    </div>

    <!-- 멤버 목록 -->
    <div class="members-section">
      <div class="section-header">
        <h3>그룹 멤버</h3>
        <span class="member-count">{{ group.members?.length || 0 }}명</span>
      </div>
      
      <div class="members-list" v-if="!loading">
        <div 
          v-for="member in members" 
          :key="member.id"
          class="member-item"
        >
          <div class="member-avatar">
            <img 
              :src="member.avatar || '/api/placeholder/40/40'" 
              :alt="member.name"
              @error="handleAvatarError"
            />
            <div class="member-status" :class="getMemberStatus(member)"></div>
          </div>
          
          <div class="member-info">
            <div class="member-name">
              {{ member.name }}
              <span v-if="isGroupAdmin(member.id)" class="admin-badge">관리자</span>
            </div>
            <div class="member-email">{{ member.email }}</div>
            <div class="member-last-active">
              마지막 활동: {{ formatLastActive(member.lastActiveAt) }}
            </div>
          </div>
          
          <div class="member-actions" v-if="isAdmin && !isGroupAdmin(member.id)">
            <button 
              class="action-btn small danger"
              @click="removeMember(member)"
            >
              <i class="icon-user-minus"></i>
              제거
            </button>
          </div>
        </div>
      </div>
      
      <!-- 로딩 상태 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>멤버 정보를 불러오는 중...</p>
      </div>
      
      <!-- 빈 상태 -->
      <div v-if="!loading && members.length === 0" class="empty-state">
        <i class="icon-users"></i>
        <p>아직 멤버가 없습니다.</p>
        <button class="action-btn primary" @click="openInviteModal">
          <i class="icon-user-plus"></i>
          멤버 초대하기
        </button>
      </div>
    </div>

    <!-- 초대 대기 목록 -->
    <div class="invites-section" v-if="pendingInvites.length > 0">
      <div class="section-header">
        <h3>초대 대기 중</h3>
        <span class="invite-count">{{ pendingInvites.length }}건</span>
      </div>
      
      <div class="invites-list">
        <div 
          v-for="invite in pendingInvites" 
          :key="invite.id"
          class="invite-item"
        >
          <div class="invite-info">
            <div class="invite-email">{{ invite.inviteeEmail }}</div>
            <div class="invite-date">
              {{ formatDate(invite.createdAt) }} 초대
            </div>
          </div>
          
          <div class="invite-actions">
            <button 
              class="action-btn small secondary"
              @click="resendInvite(invite)"
            >
              <i class="icon-refresh"></i>
              재전송
            </button>
            <button 
              class="action-btn small danger"
              @click="cancelInvite(invite)"
            >
              <i class="icon-close"></i>
              취소
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 그룹 설정 모달 -->
    <div v-if="showEditGroupModal" class="modal-overlay" @click="closeEditGroupModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>그룹 설정</h3>
          <button class="close-btn" @click="closeEditGroupModal">
            <i class="icon-close"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>그룹 이름</label>
            <input 
              v-model="editGroupData.name"
              type="text"
              placeholder="그룹 이름을 입력하세요"
            />
          </div>
          
          <div class="form-group">
            <label>그룹 설명</label>
            <textarea 
              v-model="editGroupData.description"
              placeholder="그룹에 대한 설명을 입력하세요"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>기본 점심 시간</label>
            <input 
              v-model="editGroupData.settings.defaultMeetingTime"
              type="time"
            />
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                v-model="editGroupData.settings.notificationEnabled"
                type="checkbox"
              />
              알림 활성화
            </label>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                v-model="editGroupData.settings.autoRecommend"
                type="checkbox"
              />
              자동 추천 활성화
            </label>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="action-btn secondary" @click="closeEditGroupModal">
            취소
          </button>
          <button 
            class="action-btn primary"
            @click="saveGroupSettings"
            :disabled="saving"
          >
            {{ saving ? '저장 중...' : '저장' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 멤버 초대 모달 -->
    <div v-if="showInviteModal" class="modal-overlay" @click="closeInviteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>멤버 초대</h3>
          <button class="close-btn" @click="closeInviteModal">
            <i class="icon-close"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>이메일 주소</label>
            <div class="email-input-group">
              <input 
                v-model="inviteEmail"
                type="email"
                placeholder="초대할 멤버의 이메일을 입력하세요"
                @keyup.enter="sendInvite"
              />
              <button 
                class="add-email-btn"
                @click="addEmailToList"
                :disabled="!inviteEmail"
              >
                <i class="icon-plus"></i>
              </button>
            </div>
          </div>
          
          <div v-if="emailList.length > 0" class="email-list">
            <div 
              v-for="(email, index) in emailList" 
              :key="index"
              class="email-item"
            >
              <span>{{ email }}</span>
              <button 
                class="remove-email-btn"
                @click="removeEmailFromList(index)"
              >
                <i class="icon-close"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="action-btn secondary" @click="closeInviteModal">
            취소
          </button>
          <button 
            class="action-btn primary"
            @click="sendInvite"
            :disabled="emailList.length === 0 || sending"
          >
            {{ sending ? '전송 중...' : `${emailList.length}명 초대` }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { 
  getGroup, 
  updateGroup, 
  addGroupMember,
  getUserGroups 
} from '@/services/firebaseDBv2';

export default {
  props: {
    groupId: {
      type: String,
      required: true
    },
    currentUser: {
      type: Object,
      required: true
    }
  },
  emits: ['group-updated', 'member-removed', 'invite-sent'],
  setup(props, { emit }) {
    const group = ref({});
    const members = ref([]);
    const pendingInvites = ref([]);
    const loading = ref(false);
    const saving = ref(false);
    const sending = ref(false);
    
    // 모달 상태
    const showEditGroupModal = ref(false);
    const showInviteModal = ref(false);
    
    // 편집 데이터
    const editGroupData = ref({
      name: '',
      description: '',
      settings: {
        defaultMeetingTime: '12:00',
        notificationEnabled: true,
        autoRecommend: true
      }
    });
    
    // 초대 데이터
    const inviteEmail = ref('');
    const emailList = ref([]);

    // 계산된 속성들
    const isAdmin = computed(() => {
      return group.value.admins?.includes(props.currentUser.id) || false;
    });

    // 메서드들
    const loadGroupData = async () => {
      loading.value = true;
      try {
        group.value = await getGroup(props.groupId);
        if (group.value) {
          await loadMembers();
          loadPendingInvites();
          initializeEditData();
        }
      } catch (error) {
        console.error('그룹 데이터 로드 실패:', error);
      } finally {
        loading.value = false;
      }
    };

    const loadMembers = async () => {
      try {
        // 실제 구현에서는 멤버 정보를 가져와야 함
        members.value = group.value.members?.map(memberId => ({
          id: memberId,
          name: `사용자 ${memberId}`,
          email: `user${memberId}@example.com`,
          avatar: null,
          lastActiveAt: new Date()
        })) || [];
      } catch (error) {
        console.error('멤버 데이터 로드 실패:', error);
      }
    };

    const loadPendingInvites = () => {
      // 실제 구현에서는 대기 중인 초대를 가져와야 함
      pendingInvites.value = [];
    };

    const initializeEditData = () => {
      editGroupData.value = {
        name: group.value.name || '',
        description: group.value.description || '',
        settings: {
          defaultMeetingTime: group.value.settings?.defaultMeetingTime || '12:00',
          notificationEnabled: group.value.settings?.notificationEnabled ?? true,
          autoRecommend: group.value.settings?.autoRecommend ?? true
        }
      };
    };

    const formatDate = (date) => {
      if (!date) return '알 수 없음';
      return new Date(date).toLocaleDateString('ko-KR');
    };

    const formatLastActive = (date) => {
      if (!date) return '알 수 없음';
      const now = new Date();
      const lastActive = new Date(date);
      const diffMs = now - lastActive;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return '오늘';
      if (diffDays === 1) return '어제';
      if (diffDays < 7) return `${diffDays}일 전`;
      return formatDate(date);
    };

    const getMemberStatus = (member) => {
      const now = new Date();
      const lastActive = new Date(member.lastActiveAt);
      const diffMs = now - lastActive;
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours < 1) return 'online';
      if (diffHours < 24) return 'away';
      return 'offline';
    };

    const isGroupAdmin = (memberId) => {
      return group.value.admins?.includes(memberId) || false;
    };

    const removeMember = async (member) => {
      if (!confirm(`${member.name}님을 그룹에서 제거하시겠습니까?`)) return;
      
      try {
        // 실제 구현에서는 멤버 제거 API 호출
        console.log('멤버 제거:', member.id);
        emit('member-removed', member);
      } catch (error) {
        console.error('멤버 제거 실패:', error);
      }
    };

    const openEditGroupModal = () => {
      showEditGroupModal.value = true;
    };

    const closeEditGroupModal = () => {
      showEditGroupModal.value = false;
    };

    const saveGroupSettings = async () => {
      saving.value = true;
      try {
        await updateGroup(props.groupId, editGroupData.value);
        group.value = { ...group.value, ...editGroupData.value };
        closeEditGroupModal();
        emit('group-updated', group.value);
      } catch (error) {
        console.error('그룹 설정 저장 실패:', error);
      } finally {
        saving.value = false;
      }
    };

    const openInviteModal = () => {
      showInviteModal.value = true;
      emailList.value = [];
      inviteEmail.value = '';
    };

    const closeInviteModal = () => {
      showInviteModal.value = false;
    };

    const addEmailToList = () => {
      if (inviteEmail.value && !emailList.value.includes(inviteEmail.value)) {
        emailList.value.push(inviteEmail.value);
        inviteEmail.value = '';
      }
    };

    const removeEmailFromList = (index) => {
      emailList.value.splice(index, 1);
    };

    const sendInvite = async () => {
      if (emailList.value.length === 0) return;
      
      sending.value = true;
      try {
        // 실제 구현에서는 초대 API 호출
        for (const email of emailList.value) {
          console.log('초대 전송:', email);
        }
        closeInviteModal();
        emit('invite-sent', emailList.value);
      } catch (error) {
        console.error('초대 전송 실패:', error);
      } finally {
        sending.value = false;
      }
    };

    const resendInvite = (invite) => {
      console.log('초대 재전송:', invite);
    };

    const cancelInvite = (invite) => {
      if (confirm('초대를 취소하시겠습니까?')) {
        console.log('초대 취소:', invite);
      }
    };

    const handleAvatarError = (event) => {
      event.target.src = '/api/placeholder/40/40';
    };

    onMounted(() => {
      loadGroupData();
    });

    return {
      group,
      members,
      pendingInvites,
      loading,
      saving,
      sending,
      showEditGroupModal,
      showInviteModal,
      editGroupData,
      inviteEmail,
      emailList,
      isAdmin,
      formatDate,
      formatLastActive,
      getMemberStatus,
      isGroupAdmin,
      removeMember,
      openEditGroupModal,
      closeEditGroupModal,
      saveGroupSettings,
      openInviteModal,
      closeInviteModal,
      addEmailToList,
      removeEmailFromList,
      sendInvite,
      resendInvite,
      cancelInvite,
      handleAvatarError
    };
  }
};
</script>

<style scoped>
.group-management {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--rem-24);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--rem-32);
  padding-bottom: var(--rem-24);
  border-bottom: 2px solid var(--border-light);
}

.group-info {
  flex: 1;
}

.group-name {
  font-size: var(--rem-28);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--rem-8) 0;
}

.group-description {
  font-size: var(--rem-16);
  color: var(--text-secondary);
  margin: 0 0 var(--rem-16) 0;
  line-height: 1.5;
}

.group-stats {
  display: flex;
  gap: var(--rem-24);
}

.group-stats span {
  display: flex;
  align-items: center;
  gap: var(--rem-6);
  font-size: var(--rem-14);
  color: var(--text-secondary);
}

.group-stats i {
  color: var(--color-primary);
}

.group-actions {
  display: flex;
  gap: var(--rem-12);
}

.action-btn {
  padding: var(--rem-10) var(--rem-16);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--rem-14);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--rem-6);
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: var(--text-light);
}

.action-btn.secondary {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
}

.action-btn.danger {
  background: var(--color-danger);
  color: var(--text-light);
}

.action-btn.small {
  padding: var(--rem-6) var(--rem-12);
  font-size: var(--rem-12);
}

.action-btn:hover:not(:disabled) {
  transform: translateY(calc(-1 * var(--rem-1)));
  box-shadow: var(--shadow-md);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.members-section,
.invites-section {
  margin-bottom: var(--rem-32);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--rem-16);
}

.section-header h3 {
  font-size: var(--rem-20);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.member-count,
.invite-count {
  background: var(--color-primary);
  color: var(--text-light);
  padding: var(--rem-4) var(--rem-12);
  border-radius: var(--radius-lg);
  font-size: var(--rem-12);
  font-weight: 600;
}

.members-list,
.invites-list {
  display: flex;
  flex-direction: column;
  gap: var(--rem-12);
}

.member-item,
.invite-item {
  display: flex;
  align-items: center;
  padding: var(--rem-16);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  transition: all var(--transition-fast);
}

.member-item:hover,
.invite-item:hover {
  transform: translateY(calc(-1 * var(--rem-2)));
  box-shadow: var(--shadow-md);
}

.member-avatar {
  position: relative;
  margin-right: var(--rem-16);
}

.member-avatar img {
  width: var(--rem-48);
  height: var(--rem-48);
  border-radius: 50%;
  object-fit: cover;
}

.member-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: var(--rem-12);
  height: var(--rem-12);
  border-radius: 50%;
  border: 2px solid var(--bg-primary);
}

.member-status.online {
  background: var(--color-success);
}

.member-status.away {
  background: var(--color-warning);
}

.member-status.offline {
  background: var(--text-secondary);
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: var(--rem-16);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--rem-4);
  display: flex;
  align-items: center;
  gap: var(--rem-8);
}

.admin-badge {
  background: var(--color-primary);
  color: var(--text-light);
  padding: var(--rem-2) var(--rem-8);
  border-radius: var(--radius-sm);
  font-size: var(--rem-10);
  font-weight: 600;
  text-transform: uppercase;
}

.member-email {
  font-size: var(--rem-14);
  color: var(--text-secondary);
  margin-bottom: var(--rem-4);
}

.member-last-active {
  font-size: var(--rem-12);
  color: var(--text-secondary);
}

.member-actions {
  display: flex;
  gap: var(--rem-8);
}

.invite-info {
  flex: 1;
}

.invite-email {
  font-size: var(--rem-16);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--rem-4);
}

.invite-date {
  font-size: var(--rem-14);
  color: var(--text-secondary);
}

.invite-actions {
  display: flex;
  gap: var(--rem-8);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--rem-40);
  color: var(--text-secondary);
}

.loading-spinner {
  width: var(--rem-32);
  height: var(--rem-32);
  border: 3px solid var(--border-light);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--rem-16);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state i {
  font-size: var(--rem-48);
  margin-bottom: var(--rem-16);
  color: var(--text-secondary);
}

/* 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--rem-20);
}

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: var(--rem-500);
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--rem-20);
  border-bottom: 1px solid var(--border-light);
}

.modal-header h3 {
  font-size: var(--rem-20);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--rem-8);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.modal-body {
  padding: var(--rem-20);
}

.form-group {
  margin-bottom: var(--rem-20);
}

.form-group label {
  display: block;
  font-size: var(--rem-14);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--rem-8);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--rem-12);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: var(--rem-14);
  background: var(--bg-secondary);
  transition: all var(--transition-fast);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(77, 168, 218, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--rem-8);
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.email-input-group {
  display: flex;
  gap: var(--rem-8);
}

.email-input-group input {
  flex: 1;
}

.add-email-btn {
  background: var(--color-primary);
  color: var(--text-light);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--rem-12);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.add-email-btn:hover:not(:disabled) {
  background: var(--color-secondary);
}

.add-email-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.email-list {
  margin-top: var(--rem-16);
  display: flex;
  flex-direction: column;
  gap: var(--rem-8);
}

.email-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--rem-8) var(--rem-12);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
}

.remove-email-btn {
  background: var(--color-danger);
  color: var(--text-light);
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--rem-4);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.remove-email-btn:hover {
  background: #c0392b;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--rem-12);
  padding: var(--rem-20);
  border-top: 1px solid var(--border-light);
}

/* 반응형 디자인 */
@media (max-width: 48rem) {
  .group-header {
    flex-direction: column;
    gap: var(--rem-16);
  }
  
  .group-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }
  
  .member-item,
  .invite-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--rem-12);
  }
  
  .member-avatar {
    margin-right: 0;
  }
  
  .member-actions,
  .invite-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
