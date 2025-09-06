<template>
  <button 
    :class="['button', `button--${variant}`, `button--${size}`, { 'button--disabled': disabled }]" 
    :disabled="disabled"
    @click="handleClick"
  >
    <span v-if="loading" class="button-spinner">⏳</span>
    <slot v-else></slot>
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'danger', 'success', 'warning', 'info', 'ghost'].includes(value)
    },
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  methods: {
    handleClick(event) {
      if (!this.disabled && !this.loading) {
        this.$emit('click', event);
      }
    }
  }
};
</script>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--rem-8);
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  user-select: none;
}

/* Sizes */
.button--sm {
  padding: var(--rem-8) var(--rem-16);
  font-size: var(--rem-12);
  min-height: var(--rem-32);
  border-radius: var(--radius);
}

.button--md {
  padding: var(--rem-12) var(--rem-24);
  font-size: var(--rem-14);
  min-height: var(--rem-40);
}

.button--lg {
  padding: var(--rem-16) var(--rem-32);
  font-size: var(--rem-16);
  min-height: var(--rem-48);
}

.button--xl {
  padding: var(--rem-20) var(--rem-40);
  font-size: var(--rem-18);
  min-height: var(--rem-56);
}

/* Variants - Modern Design */
.button--primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: var(--text-light);
  box-shadow: 0 4px 14px 0 rgba(77, 168, 218, 0.25);
  border: 1px solid transparent;
}

.button--primary:hover {
  background: linear-gradient(135deg, #3a8bc2 0%, #4bc4a0 100%);
  transform: translateY(calc(-1 * var(--rem-2)));
  box-shadow: 0 8px 25px 0 rgba(77, 168, 218, 0.4);
}

.button--primary:active {
  transform: translateY(0);
  box-shadow: 0 4px 14px 0 rgba(77, 168, 218, 0.25);
}

.button--secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 2px solid var(--bg-tertiary);
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
}

.button--secondary:hover {
  background: var(--bg-secondary);
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(calc(-1 * var(--rem-1)));
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
}

.button--danger {
  background: linear-gradient(135deg, var(--color-danger) 0%, #e74c3c 100%);
  color: var(--text-light);
  box-shadow: 0 4px 14px 0 rgba(255, 68, 68, 0.25);
  border: 1px solid transparent;
}

.button--danger:hover {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  transform: translateY(calc(-1 * var(--rem-2)));
  box-shadow: 0 8px 25px 0 rgba(255, 68, 68, 0.4);
}

.button--success {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: var(--text-light);
  box-shadow: 0 4px 14px 0 rgba(39, 174, 96, 0.25);
  border: 1px solid transparent;
}

.button--success:hover {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  transform: translateY(calc(-1 * var(--rem-2)));
  box-shadow: 0 8px 25px 0 rgba(39, 174, 96, 0.4);
}

.button--warning {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
  color: var(--text-light);
  box-shadow: 0 4px 14px 0 rgba(243, 156, 18, 0.25);
  border: 1px solid transparent;
}

.button--warning:hover {
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
  transform: translateY(calc(-1 * var(--rem-2)));
  box-shadow: 0 8px 25px 0 rgba(243, 156, 18, 0.4);
}

.button--info {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: var(--text-light);
  box-shadow: 0 4px 14px 0 rgba(52, 152, 219, 0.25);
  border: 1px solid transparent;
}

.button--info:hover {
  background: linear-gradient(135deg, #2980b9 0%, #1f618d 100%);
  transform: translateY(calc(-1 * var(--rem-2)));
  box-shadow: 0 8px 25px 0 rgba(52, 152, 219, 0.4);
}

.button--ghost {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  box-shadow: none;
}

.button--ghost:hover {
  background: var(--color-primary);
  color: var(--text-light);
  transform: translateY(calc(-1 * var(--rem-1)));
  box-shadow: 0 4px 12px 0 rgba(77, 168, 218, 0.3);
}

/* States */
.button--disabled {
  background: var(--bg-tertiary);
  color: var(--text-muted);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
  border-color: var(--bg-tertiary);
}

.button--disabled:hover {
  transform: none;
  box-shadow: none;
  background: var(--bg-tertiary);
}

.button-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Ripple effect */
.button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.button:active::before {
  width: 300px;
  height: 300px;
}

/* Focus styles */
.button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(77, 168, 218, 0.3);
}

.button--ghost:focus {
  box-shadow: 0 0 0 3px rgba(77, 168, 218, 0.3);
}
</style>
