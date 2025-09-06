<template>
  <div :class="['card', cardClass]" :style="cardStyle">
    <div v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </div>
    
    <div class="card-body">
      <slot></slot>
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'outlined', 'elevated', 'flat'].includes(value)
    },
    padding: {
      type: String,
      default: 'md',
      validator: (value) => ['none', 'sm', 'md', 'lg', 'xl'].includes(value)
    },
    cardClass: {
      type: String,
      default: ''
    }
  },
  computed: {
    cardStyle() {
      const paddingMap = {
        none: '0',
        sm: 'var(--rem-8)',
        md: 'var(--rem-16)',
        lg: 'var(--rem-24)',
        xl: 'var(--rem-32)'
      };
      
      return {
        '--card-padding': paddingMap[this.padding]
      };
    }
  }
};
</script>

<style scoped>
.card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition);
  padding: var(--card-padding);
}

.card-header {
  padding-bottom: var(--rem-12);
  border-bottom: 1px solid var(--bg-tertiary);
  margin-bottom: var(--rem-12);
}

.card-body {
  flex: 1;
}

.card-footer {
  padding-top: var(--rem-12);
  border-top: 1px solid var(--bg-tertiary);
  margin-top: var(--rem-12);
}

/* Variants */
.card.variant-default {
  border: 1px solid var(--bg-tertiary);
}

.card.variant-outlined {
  border: 2px solid var(--color-primary);
  background: transparent;
}

.card.variant-elevated {
  box-shadow: var(--shadow-lg);
  border: none;
}

.card.variant-flat {
  background: var(--bg-secondary);
  border: none;
}

/* Hover effects */
.card:hover {
  transform: translateY(calc(-1 * var(--rem-2)));
  box-shadow: var(--shadow-xl);
}
</style>
