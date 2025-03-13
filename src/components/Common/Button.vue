<template>
    <button 
      :class="['gradient-button', buttonStyle]" 
      :disabled="disabled"
      @click="handleClick"
    >
      <slot>Button</slot>
    </button>
  </template>
  
  <script>
  export default {
    props: {
      buttonStyle: {
        type: String,
        default: "primary", // 기본 스타일 (파랑-민트-연두 그라데이션)
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      handleClick(event) {
        if (!this.disabled) {
          this.$emit("click", event);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* 기본 버튼 스타일 */
  .gradient-button {
    padding: 14px 28px;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
    box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.2);
    color: white;
    background: linear-gradient(45deg, #4da8da, #5adbb5, #b4e33d); /* 파랑-민트-연두 그라데이션 */
    background-size: 200% 200%;
    text-transform: uppercase;
  }
  
  /* Hover 시 애니메이션 효과 */
  .gradient-button:hover {
    background-position: right center;
    transform: translateY(-3px);
    box-shadow: 6px 6px 12px rgba(0, 0, 0, 0.3);
  }
  
  /* 클릭 시 눌리는 효과 */
  .gradient-button:active {
    transform: translateY(2px);
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.3);
  }
  
  /* 비활성화 버튼 스타일 */
  .gradient-button:disabled {
    background: #ccc;
    color: #888;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
  </style>
  