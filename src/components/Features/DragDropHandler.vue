<template>
  <div>
    <!-- 드래그앤드롭 이벤트는 부모 컴포넌트에서 처리 -->
  </div>
</template>

<script>
import { ref } from 'vue';
import { gsap } from 'gsap';
import { HolidayUtils } from '@/config/constants.js';

export default {
  name: 'DragDropHandler',
  props: {
    proposals: {
      type: Array,
      default: () => []
    },
    currentUser: {
      type: Object,
      default: null
    },
    actualMembers: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'proposal-moved',
    'drag-start',
    'drag-end'
  ],
  setup(props, { emit }) {
    // 드래그 상태
    const draggingProposal = ref(null);
    const dragOverDay = ref(null);
    
    // 드래그 시작
    const startDrag = (event, proposal) => {
      draggingProposal.value = proposal;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', proposal.id);
      
      // 드래그 중인 요소에 스타일 적용
      event.target.style.opacity = '0.5';
      
      emit('drag-start', proposal);
    };
    
    // 드래그 종료
    const endDrag = (event) => {
      draggingProposal.value = null;
      dragOverDay.value = null;
      event.target.style.opacity = '1';
      
      emit('drag-end');
    };
    
    // 드롭 처리
    const dropProposal = async (event, targetDate) => {
      event.preventDefault();
      
      if (!draggingProposal.value) return;
      
      // 주말이나 공휴일에는 드롭 불가
      const targetDay = new Date(targetDate);
      const dayOfWeek = targetDay.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        console.log('주말에는 드롭할 수 없습니다.');
        return;
      }
      
      // 드롭 애니메이션
      const proposalElement = event.target.closest('.proposal-item');
      const targetElement = document.querySelector(`[data-date="${targetDate}"]`);
      
      if (proposalElement && targetElement) {
        await animateProposalMove(proposalElement, targetElement);
      }
      
      // 제안 날짜 업데이트
      const proposalIndex = props.proposals.findIndex(p => p.id === draggingProposal.value.id);
      if (proposalIndex !== -1) {
        const updatedProposal = { ...props.proposals[proposalIndex], date: targetDate };
        emit('proposal-moved', { proposal: updatedProposal, oldDate: draggingProposal.value.date, newDate: targetDate });
        console.log(`제안이 ${targetDate}로 이동되었습니다.`);
      }
      
      draggingProposal.value = null;
      dragOverDay.value = null;
    };
    
    // 드롭 오버 처리
    const handleDragOver = (event, date) => {
      event.preventDefault();
      dragOverDay.value = date;
    };
    
    // 드롭 리브 처리
    const handleDragLeave = (event) => {
      // 자식 요소로 이동할 때는 리브 이벤트 무시
      if (!event.currentTarget.contains(event.relatedTarget)) {
        dragOverDay.value = null;
      }
    };
    
    // 제안 이동 애니메이션
    const animateProposalMove = (proposalElement, targetElement) => {
      if (!proposalElement || !targetElement) return;
      
      return new Promise((resolve) => {
        const tl = gsap.timeline({
          onComplete: resolve
        });
        
        // 제안 아이템을 타겟 위치로 이동
        tl.to(proposalElement, {
          x: targetElement.offsetLeft - proposalElement.offsetLeft,
          y: targetElement.offsetTop - proposalElement.offsetTop,
          duration: 0.5,
          ease: 'power2.inOut'
        });
        
        // 페이드 아웃 후 원래 위치로 복귀
        tl.to(proposalElement, {
          opacity: 0,
          scale: 0.8,
          duration: 0.2,
          ease: 'power2.inOut'
        });
        
        tl.set(proposalElement, {
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1
        });
      });
    };
    
    // 드래그 가능 여부 확인
    const canDrag = (proposal) => {
      if (!proposal) return false;
      
      // 현재 사용자가 제안자이거나 관리자인 경우만 드래그 가능
      const currentUserId = props.currentUser?.uid || props.currentUser?.id;
      return proposal.proposer.id === currentUserId;
    };
    
    // 드롭 가능 여부 확인
    const canDrop = (date) => {
      const targetDay = new Date(date);
      const dayOfWeek = targetDay.getDay();
      
      // 주말에는 드롭 불가
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return false;
      }
      
      // 공휴일 체크 (HolidayUtils 사용)
      const dateStr = date;
      const isHoliday = HolidayUtils.isHoliday(dateStr);
      if (isHoliday) {
        return false;
      }
      
      return true;
    };
    
    return {
      draggingProposal,
      dragOverDay,
      startDrag,
      endDrag,
      dropProposal,
      handleDragOver,
      handleDragLeave,
      animateProposalMove,
      canDrag,
      canDrop
    };
  }
};
</script>

<style scoped>
/* 드래그앤드롭 관련 스타일은 부모 컴포넌트에서 관리 */
</style>
