<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div :class="['modal-content', modalClass]" :style="modalStyle">
      <div v-if="showCloseButton" class="modal-close" @click="close">
        <span>✕</span>
      </div>
      
      <div v-if="$slots.header" class="modal-header">
        <slot name="header"></slot>
      </div>
      
      <div class="modal-body">
        <slot></slot>
      </div>
      
      <div v-if="$slots.footer" class="modal-footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg', 'xl', 'full'].includes(value)
    },
    showCloseButton: {
      type: Boolean,
      default: true
    },
    closeOnOverlay: {
      type: Boolean,
      default: true
    },
    modalClass: {
      type: String,
      default: ''
    }
  },
  emits: ['close'],
  computed: {
    modalStyle() {
      const sizeMap = {
        sm: 'var(--rem-400)',
        md: 'var(--rem-500)',
        lg: 'var(--rem-700)',
        xl: 'var(--rem-900)',
        full: '95vw'
      };
      
      return {
        '--modal-width': sizeMap[this.size]
      };
    }
  },
  methods: {
    close() {
      if (this.closeOnOverlay) {
        this.$emit('close');
      }
    }
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
  backdrop-filter: blur(var(--rem-4));
}

.modal-content {
  background: var(--bg-primary);
  width: var(--modal-width);
  max-height: 90vh;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  position: relative;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: var(--rem-12);
  right: var(--rem-12);
  width: var(--rem-32);
  height: var(--rem-32);
  border-radius: var(--radius-full);
  background: var(--color-danger);
  color: var(--text-light);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  z-index: 1;
}

.modal-close:hover {
  background: #e74c3c;
  transform: scale(1.1);
}

.modal-header {
  padding: var(--rem-20) var(--rem-20) var(--rem-12);
  border-bottom: 1px solid var(--bg-tertiary);
}

.modal-body {
  padding: var(--rem-20);
  max-height: 60vh;
  overflow-y: auto;
}

.modal-footer {
  padding: var(--rem-12) var(--rem-20) var(--rem-20);
  border-top: 1px solid var(--bg-tertiary);
  display: flex;
  justify-content: flex-end;
  gap: var(--rem-8);
}

/* Size variants */
.modal-content.size-full {
  height: 95vh;
  width: 95vw;
}

.modal-content.size-full .modal-body {
  max-height: none;
  flex: 1;
  overflow-y: auto;
}
</style>
