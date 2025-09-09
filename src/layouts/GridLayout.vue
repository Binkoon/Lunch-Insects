<template>
  <div 
    :class="['grid-layout', `grid--${variant}`, `grid--${gap}`]"
    :style="gridStyle"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'GridLayout',
  props: {
    columns: {
      type: [Number, String],
      default: 1
    },
    gap: {
      type: String,
      default: 'md',
      validator: (value) => ['none', 'sm', 'md', 'lg', 'xl'].includes(value)
    },
    variant: {
      type: String,
      default: 'auto',
      validator: (value) => ['auto', 'fit', 'fill'].includes(value)
    },
    minWidth: {
      type: String,
      default: '250px'
    }
  },
  computed: {
    gridStyle() {
      const gapMap = {
        none: '0',
        sm: 'var(--rem-8)',
        md: 'var(--rem-16)',
        lg: 'var(--rem-24)',
        xl: 'var(--rem-32)'
      };
      
      const gridGap = gapMap[this.gap];
      
      if (this.variant === 'auto') {
        return {
          '--grid-gap': gridGap,
          '--grid-min-width': this.minWidth
        };
      }
      
      return {
        '--grid-gap': gridGap,
        '--grid-columns': this.columns
      };
    }
  }
};
</script>

<style scoped>
.grid-layout {
  display: grid;
  gap: var(--grid-gap);
}

/* Auto-fit columns */
.grid--auto {
  grid-template-columns: repeat(auto-fit, minmax(var(--grid-min-width), 1fr));
}

/* Fixed columns */
.grid--fit {
  grid-template-columns: repeat(var(--grid-columns), 1fr);
}

/* Fill available space */
.grid--fill {
  grid-template-columns: repeat(var(--grid-columns), minmax(0, 1fr));
}

/* Responsive adjustments */
@media (max-width: 48rem) { /* 768px */
  .grid--auto {
    grid-template-columns: 1fr;
  }
  
  .grid--fit,
  .grid--fill {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 37.5rem) { /* 600px */
  .grid--fit,
  .grid--fill {
    grid-template-columns: 1fr;
  }
}
</style>
