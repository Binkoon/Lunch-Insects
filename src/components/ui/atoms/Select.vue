<template>
  <div class="select-wrapper">
    <label v-if="label" class="select-label">{{ label }}</label>
    <select
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :class="['select-field', selectClass]"
      @change="$emit('update:modelValue', $event.target.value)"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
    <span v-if="error" class="select-error">{{ error }}</span>
  </div>
</template>

<script>
export default {
  name: 'Select',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    options: {
      type: Array,
      required: true,
      validator: (options) => {
        return options.every(option => 
          typeof option === 'object' && 
          'value' in option && 
          'label' in option
        );
      }
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
    selectClass: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'focus', 'blur']
};
</script>

<style scoped>
.select-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--rem-4);
}

.select-label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: var(--rem-14);
}

.select-field {
  padding: var(--rem-8) var(--rem-12);
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--radius);
  font-size: var(--rem-16);
  transition: border-color var(--transition-fast);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
}

.select-field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(77, 168, 218, 0.2);
}

.select-field:disabled {
  background: var(--bg-secondary);
  color: var(--text-muted);
  cursor: not-allowed;
}

.select-error {
  color: var(--color-danger);
  font-size: var(--rem-12);
  margin-top: var(--rem-4);
}
</style>
