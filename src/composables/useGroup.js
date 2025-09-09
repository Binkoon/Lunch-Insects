import { ref, computed } from 'vue';
import { getGroup, updateGroup, getUserGroups } from '@/services/firebaseDBv2.js';

/**
 * 그룹 관련 비즈니스 로직을 관리하는 Composable
 * 단일책임: 그룹 데이터 관리, 멤버 상태, 제안 관리
 */
export const useGroup = () => {
  // 상태
  const loading = ref(false);
  const currentGroup = ref(null);
  const showGroupModal = ref(false);
  const groupMembers = ref([]);

  // 그룹 멤버 목록 (계산된 속성)
  const groupMembersList = computed(() => {
    if (!currentGroup.value?.members) return [];
    return currentGroup.value.members.map(member => {
      return {
        id: member,
        name: `사용자 ${member.slice(-4)}`, // 임시 이름
        status: 'unknown' // 기본 상태
      };
    });
  });

  // 그룹 관리자 여부 확인 (currentUser는 외부에서 전달받아야 함)
  const isGroupAdmin = (currentUser) => {
    if (!currentUser?.id || !currentGroup.value) return false;
    return currentGroup.value.admin === currentUser.id ||
           currentGroup.value.admins?.includes(currentUser.id);
  };

  // 그룹 데이터 로드
  const loadGroupData = async (userId) => {
    if (!userId) {
      console.log('사용자 ID 없음 - 그룹 데이터 로드 스킵');
      currentGroup.value = null;
      return;
    }

    try {
      loading.value = true;
      console.log('그룹 데이터 로드 시작...');
      
      // 사용자의 그룹 목록에서 첫 번째 그룹 가져오기
      const userGroups = await getUserGroups(userId);
      console.log('사용자 그룹 목록:', userGroups);
      
      if (userGroups && userGroups.length > 0) {
        const group = userGroups[0]; // 첫 번째 그룹 사용
        currentGroup.value = group;
        console.log('그룹 데이터 로드 완료:', group.name, '멤버 수:', group.members?.length || 0);
      } else {
        console.log('사용자가 속한 그룹이 없습니다.');
        currentGroup.value = null;
      }
    } catch (error) {
      console.error('그룹 데이터 로드 실패:', error);
      currentGroup.value = null;
    } finally {
      loading.value = false;
    }
  };

  // 그룹 관리 모달 열기
  const openGroupManagement = () => {
    showGroupModal.value = true;
  };

  // 그룹 관리 모달 닫기
  const closeGroupModal = () => {
    showGroupModal.value = false;
  };

  // 그룹 업데이트 처리
  const handleGroupUpdated = (group) => {
    currentGroup.value = group;
    console.log('그룹 업데이트됨:', group);
  };

  // 그룹 제안 추가
  const addProposal = async (proposal) => {
    if (!currentGroup.value) {
      console.error('그룹이 선택되지 않음');
      return;
    }

    try {
      // 제안을 그룹에 추가 (실제로는 Firebase에 저장)
      if (!currentGroup.value.proposals) {
        currentGroup.value.proposals = [];
      }
      currentGroup.value.proposals.push(proposal);
      
      // Firebase에 제안 저장 (실제 구현 필요)
      // await addGroupProposal(currentGroup.value.id, proposal);
      
      console.log('제안 생성됨:', proposal);
    } catch (error) {
      console.error('제안 생성 실패:', error);
      throw error;
    }
  };

  // 그룹 멤버 상태 업데이트
  const updateMemberStatus = async (memberId, status, details = {}) => {
    if (!currentGroup.value) {
      console.error('그룹이 선택되지 않음');
      return;
    }

    try {
      // 그룹 멤버 상태 업데이트 로직
      const memberStatus = {
        memberId,
        status,
        details,
        updatedAt: new Date()
      };

      // Firebase에 상태 업데이트
      await updateGroup(currentGroup.value.id, {
        memberStatuses: {
          ...currentGroup.value.memberStatuses,
          [memberId]: memberStatus
        }
      });

      console.log('멤버 상태 업데이트됨:', memberStatus);
    } catch (error) {
      console.error('멤버 상태 업데이트 실패:', error);
      throw error;
    }
  };

  // 그룹 통계 조회
  const getGroupStats = () => {
    if (!currentGroup.value) {
      return {
        totalMembers: 0,
        activeMembers: 0,
        totalProposals: 0
      };
    }

    return {
      totalMembers: currentGroup.value.members?.length || 0,
      activeMembers: Object.keys(currentGroup.value.memberStatuses || {}).length,
      totalProposals: currentGroup.value.proposals?.length || 0
    };
  };

  // 그룹 멤버별 현재 지출 상태 조회
  const checkCurrentGroupExpenses = async (groupId) => {
    if (!groupId) {
      console.log('그룹 ID 없음 - 지출 상태 조회 스킵');
      return {};
    }

    try {
      console.log('💰 그룹 멤버별 지출 현황 조회 중...');
      
      // 실제 구현에서는 Firebase에서 그룹 멤버들의 지출 데이터를 가져와야 함
      // 여기서는 임시 데이터로 구현
      const groupExpenses = {};
      
      if (currentGroup.value?.members) {
        for (const memberId of currentGroup.value.members) {
          groupExpenses[memberId] = {
            ticketPoints: Math.floor(Math.random() * 100000),
            cash: Math.floor(Math.random() * 50000),
            total: 0
          };
          groupExpenses[memberId].total = 
            groupExpenses[memberId].ticketPoints + groupExpenses[memberId].cash;
        }
      }
      
      console.log('그룹 지출 현황:', groupExpenses);
      return groupExpenses;
    } catch (error) {
      console.error('그룹 지출 현황 조회 실패:', error);
      return {};
    }
  };

  return {
    // 상태
    loading,
    currentGroup,
    showGroupModal,
    groupMembers,
    
    // 계산된 속성
    groupMembersList,
    
    // 메서드
    isGroupAdmin,
    loadGroupData,
    openGroupManagement,
    closeGroupModal,
    handleGroupUpdated,
    addProposal,
    updateMemberStatus,
    getGroupStats,
    checkCurrentGroupExpenses
  };
};
