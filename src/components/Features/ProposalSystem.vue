<template>
  <div>
    <!-- 제안 상세 모달 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content proposal-modal" @click.stop>
        <div class="modal-header">
          <h3>점심 제안</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedProposal" class="proposal-detail">
            <!-- 제안 정보 -->
            <div class="proposal-info-section">
              <div class="restaurant-card">
                <h4>{{ selectedProposal.restaurant.name }}</h4>
                <p class="restaurant-details">
                  {{ selectedProposal.restaurant.category }} • 
                  ⭐ {{ selectedProposal.restaurant.rating }} • 
                  🚶‍♂️ {{ selectedProposal.restaurant.distance }}분
                </p>
                <p class="price-range">{{ selectedProposal.restaurant.priceRange }}</p>
              </div>
              <div class="proposer-info">
                <span class="proposer-label">제안자:</span>
                <span class="proposer-name">{{ selectedProposal.proposer.name }}</span>
              </div>
            </div>
            
            <!-- 투표 현황 -->
            <div class="voting-section">
              <h4>투표 현황</h4>
              <div class="vote-results">
                <div class="vote-item accepted">
                  <span class="vote-label">수락</span>
                  <span class="vote-count">{{ selectedProposal.votes.accepted.length }}명</span>
                  <div class="vote-members">
                    <span 
                      v-for="userId in selectedProposal.votes.accepted" 
                      :key="userId"
                      class="member-badge"
                    >
                      {{ getMemberName(userId) }}
                    </span>
                  </div>
                </div>
                <div class="vote-item rejected">
                  <span class="vote-label">거부</span>
                  <span class="vote-count">{{ selectedProposal.votes.rejected.length }}명</span>
                  <div class="vote-members">
                    <span 
                      v-for="userId in selectedProposal.votes.rejected" 
                      :key="userId"
                      class="member-badge"
                    >
                      {{ getMemberName(userId) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 투표 결과 또는 투표 버튼 -->
            <div v-if="getProposalStatus(selectedProposal) === 'confirmed'" class="confirmation-banner">
              <div class="confirmation-icon">🎉</div>
              <div class="confirmation-text">
                <h4>확정되었습니다!</h4>
                <p>{{ selectedProposal.restaurant.name }}에서 점심을 먹어요.</p>
              </div>
            </div>
            
            <div v-else-if="getProposalStatus(selectedProposal) === 'rejected'" class="rejection-banner">
              <div class="rejection-icon">❌</div>
              <div class="rejection-text">
                <h4>거부되었습니다</h4>
                <p>다른 음식점을 제안해 보세요.</p>
              </div>
            </div>
            
            <div v-else class="voting-actions">
              <button 
                class="vote-btn accept" 
                @click="voteProposal(selectedProposal.id, 'accept')"
                :disabled="selectedProposal.votes.accepted.includes(currentUser?.uid || currentUser?.id)"
              >
                👍 수락
              </button>
              <button 
                class="vote-btn reject" 
                @click="voteProposal(selectedProposal.id, 'reject')"
                :disabled="selectedProposal.votes.rejected.includes(currentUser?.uid || currentUser?.id)"
              >
                👎 거부
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'ProposalSystem',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    selectedProposal: {
      type: Object,
      default: null
    },
    proposals: {
      type: Array,
      default: () => []
    },
    actualMembers: {
      type: Array,
      default: () => []
    },
    currentUser: {
      type: Object,
      default: null
    }
  },
  emits: [
    'close',
    'vote',
    'proposal-confirmed'
  ],
  setup(props, { emit }) {
    // 모달 상태
    const showModal = computed(() => props.show);
    
    // 멤버 이름 가져오기
    const getMemberName = (memberId) => {
      const member = props.actualMembers.find(m => m.id === memberId);
      return member ? member.name : '알 수 없음';
    };
    
    // 제안 상태 확인
    const getProposalStatus = (proposal) => {
      const totalMembers = props.actualMembers.length;
      const acceptedCount = proposal.votes.accepted.length;
      const rejectedCount = proposal.votes.rejected.length;
      
      if (rejectedCount > 0) {
        return 'rejected';
      } else if (acceptedCount >= Math.ceil(totalMembers / 2)) {
        return 'confirmed';
      } else {
        return 'pending';
      }
    };
    
    // 투표 처리
    const voteProposal = async (proposalId, vote) => {
      const proposal = props.proposals.find(p => p.id === proposalId);
      if (!proposal) return;
      
      const userId = props.currentUser?.uid || props.currentUser?.id;
      
      // 기존 투표 제거
      proposal.votes.accepted = proposal.votes.accepted.filter(id => id !== userId);
      proposal.votes.rejected = proposal.votes.rejected.filter(id => id !== userId);
      
      // 새 투표 추가
      if (vote === 'accept') {
        proposal.votes.accepted.push(userId);
      } else if (vote === 'reject') {
        proposal.votes.rejected.push(userId);
      }
      
      // 상태 업데이트
      proposal.status = getProposalStatus(proposal);
      
      // 확정되었으면 이벤트 발생
      if (proposal.status === 'confirmed') {
        emit('proposal-confirmed', proposal);
      }
      
      // 투표 이벤트 발생
      emit('vote', { proposalId, vote, proposal });
      
      console.log('투표 완료:', proposal);
    };
    
    // 모달 닫기
    const closeModal = () => {
      emit('close');
    };
    
    return {
      showModal,
      getMemberName,
      getProposalStatus,
      voteProposal,
      closeModal
    };
  }
};
</script>

<style scoped>
.modal-overlay {
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
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.proposal-modal {
  width: 500px;
  max-width: 90vw;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--text-xl);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.modal-body {
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
}

.proposal-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.proposal-info-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.restaurant-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  border: 1px solid var(--border-color);
}

.restaurant-card h4 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--text-primary);
  font-size: var(--text-lg);
}

.restaurant-details {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.price-range {
  margin: 0;
  color: var(--accent-primary);
  font-weight: 600;
  font-size: var(--text-sm);
}

.proposer-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.proposer-label {
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.proposer-name {
  color: var(--text-primary);
  font-weight: 600;
  font-size: var(--text-sm);
}

.voting-section h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--text-primary);
  font-size: var(--text-lg);
}

.vote-results {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.vote-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.vote-item.accepted {
  background: var(--success-light);
  border-color: var(--success-primary);
}

.vote-item.rejected {
  background: var(--error-light);
  border-color: var(--error-primary);
}

.vote-label {
  font-weight: 600;
  font-size: var(--text-sm);
}

.vote-item.accepted .vote-label {
  color: var(--success-primary);
}

.vote-item.rejected .vote-label {
  color: var(--error-primary);
}

.vote-count {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.vote-members {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.member-badge {
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  border: 1px solid var(--border-color);
}

.confirmation-banner,
.rejection-banner {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-align: center;
}

.confirmation-banner {
  background: var(--success-light);
  border: 1px solid var(--success-primary);
}

.rejection-banner {
  background: var(--error-light);
  border: 1px solid var(--error-primary);
}

.confirmation-icon,
.rejection-icon {
  font-size: 24px;
}

.confirmation-text h4,
.rejection-text h4 {
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--text-primary);
}

.confirmation-text p,
.rejection-text p {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.voting-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.vote-btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 600;
  transition: all 0.2s ease;
  min-width: 100px;
}

.vote-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vote-btn.accept {
  background: var(--success-primary);
  color: white;
}

.vote-btn.accept:hover:not(:disabled) {
  background: var(--success-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.vote-btn.reject {
  background: var(--error-primary);
  color: white;
}

.vote-btn.reject:hover:not(:disabled) {
  background: var(--error-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}
</style>
