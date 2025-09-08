import { ref } from 'vue';

/**
 * 모달 상태 관리 Composable
 * 다양한 모달의 열기/닫기 상태를 관리합니다
 */
export function useModal() {
  // 모달 상태들
  const modals = ref({});

  /**
   * 모달 열기
   */
  const openModal = (modalName, data = null) => {
    modals.value[modalName] = {
      isOpen: true,
      data: data
    };
    
    // body 스크롤 방지
    document.body.style.overflow = 'hidden';
    
  };

  /**
   * 모달 닫기
   */
  const closeModal = (modalName) => {
    if (modals.value[modalName]) {
      modals.value[modalName] = {
        isOpen: false,
        data: null
      };
    }
    
    // 열린 모달이 없으면 body 스크롤 복원
    const hasOpenModal = Object.values(modals.value).some(modal => modal.isOpen);
    if (!hasOpenModal) {
      document.body.style.overflow = '';
    }
    
  };

  /**
   * 모든 모달 닫기
   */
  const closeAllModals = () => {
    Object.keys(modals.value).forEach(modalName => {
      modals.value[modalName] = {
        isOpen: false,
        data: null
      };
    });
    
    // body 스크롤 복원
    document.body.style.overflow = '';
    
  };

  /**
   * 모달 상태 확인
   */
  const isModalOpen = (modalName) => {
    return modals.value[modalName]?.isOpen || false;
  };

  /**
   * 모달 데이터 가져오기
   */
  const getModalData = (modalName) => {
    return modals.value[modalName]?.data || null;
  };

  /**
   * 특정 모달 상태 가져오기
   */
  const getModal = (modalName) => {
    return modals.value[modalName] || { isOpen: false, data: null };
  };

  /**
   * ESC 키로 모달 닫기 (선택사항)
   */
  const handleEscapeKey = (event) => {
    if (event.key === 'Escape') {
      // 가장 최근에 열린 모달 찾기
      const openModalNames = Object.keys(modals.value).filter(name => 
        modals.value[name]?.isOpen
      );
      
      if (openModalNames.length > 0) {
        const lastOpenModal = openModalNames[openModalNames.length - 1];
        closeModal(lastOpenModal);
      }
    }
  };

  /**
   * 키보드 이벤트 리스너 등록/해제
   */
  const enableEscapeKey = () => {
    document.addEventListener('keydown', handleEscapeKey);
  };

  const disableEscapeKey = () => {
    document.removeEventListener('keydown', handleEscapeKey);
  };

  return {
    // 상태
    modals,
    
    // 메서드
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
    getModalData,
    getModal,
    enableEscapeKey,
    disableEscapeKey
  };
}

/**
 * 특정 모달을 위한 전용 Composable
 * 단일 모달의 상태와 데이터를 관리합니다
 */
export function useSingleModal(modalName) {
  const { 
    openModal: open, 
    closeModal: close, 
    isModalOpen, 
    getModalData,
    getModal 
  } = useModal();

  const openSingleModal = (data = null) => {
    open(modalName, data);
  };

  const closeSingleModal = () => {
    close(modalName);
  };

  const isOpen = () => {
    return isModalOpen(modalName);
  };

  const getData = () => {
    return getModalData(modalName);
  };

  const getState = () => {
    return getModal(modalName);
  };

  return {
    open: openSingleModal,
    close: closeSingleModal,
    isOpen,
    getData,
    getState
  };
}
