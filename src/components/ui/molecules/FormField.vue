<template>
  <div class="form-field">
    <Input
      v-if="type === 'input'"
      :model-value="modelValue"
      :type="inputType"
      :label="label"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :error="error"
      :input-class="inputClass"
      @update:model-value="$emit('update:modelValue', $event)"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
    />
    
    <Select
      v-else-if="type === 'select'"
      :model-value="modelValue"
      :options="options"
      :label="label"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :error="error"
      :select-class="selectClass"
      @update:model-value="$emit('update:modelValue', $event)"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
    />
    
    <textarea
      v-else-if="type === 'textarea'"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="['textarea-field', textareaClass]"
      :rows="rows"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
    ></textarea>
    
    <span v-if="error" class="field-error">{{ error }}</span>
  </div>
</template>

<script>
import Input from '@/components/ui/atoms/Input.vue';
import Select from '@/components/ui/atoms/Select.vue';

export default {
  name: 'FormField',
  components: {
    Input,
    Select
  },
  props: {
    type: {
      type: String,
      default: 'input',
      validator: (value) => ['input', 'select', 'textarea'].includes(value)
    },
    modelValue: {
      type: [String, Number],
      default: ''
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
    // Input specific props
    inputType: {
      type: String,
      default: 'text'
    },
    inputClass: {
      type: String,
      default: ''
    },
    // Select specific props
    options: {
      type: Array,
      default: () => []
    },
    selectClass: {
      type: String,
      default: ''
    },
    // Textarea specific props
    rows: {
      type: Number,
      default: 3
    },
    textareaClass: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'focus', 'blur']
};
</script>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--rem-4);
}

.textarea-field {
  padding: var(--rem-8) var(--rem-12);
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--radius);
  font-size: var(--rem-16);
  font-family: inherit;
  transition: border-color var(--transition-fast);
  background: var(--bg-primary);
  color: var(--text-primary);
  resize: vertical;
  min-height: var(--rem-80);
}

.textarea-field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(77, 168, 218, 0.2);
}

.textarea-field:disabled {
  background: var(--bg-secondary);
  color: var(--text-muted);
  cursor: not-allowed;
}

.field-error {
  color: var(--color-danger);
  font-size: var(--rem-12);
  margin-top: var(--rem-4);
}
</style>
