<template>
  <div class="input-wrapper">
    <label v-if="label" class="input-label">{{ label }}</label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="['input-field', inputClass]"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
    />
    <span v-if="error" class="input-error">{{ error }}</span>
  </div>
</template>

<script>
export default {
  name: 'Input',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    type: {
      type: String,
      default: 'text'
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    inputClass: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'focus', 'blur']
};
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--rem-4);
}

.input-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: var(--rem-14);
}

.input-field {
  padding: var(--rem-8) var(--rem-12);
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--radius);
  font-size: var(--rem-16);
  transition: border-color var(--transition-fast);
  background: var(--bg-primary);
  color: var(--text-primary);
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(77, 168, 218, 0.2);
}

.input-field:disabled {
  background: var(--bg-secondary);
  color: var(--text-muted);
  cursor: not-allowed;
}

.input-error {
  color: var(--color-danger);
  font-size: var(--rem-12);
  margin-top: var(--rem-4);
}
</style>
