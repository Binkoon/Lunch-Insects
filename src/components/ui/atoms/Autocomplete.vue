<template>
  <div class="ac-wrapper" @keydown.stop>
    <label v-if="label" class="ac-label">{{ label }}</label>
    <div class="ac-field">
      <input
        :value="modelValue"
        :placeholder="placeholder"
        class="ac-input"
        @input="onInput"
        @focus="open = true"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.enter.prevent="choose(activeIndex)"
        @keydown.esc.prevent="open = false"
      />
      <div v-if="open && filtered.length" class="ac-dropdown">
        <div
          v-for="(opt, i) in filtered"
          :key="opt"
          :class="['ac-option', { active: i === activeIndex }]"
          @mousedown.prevent="choose(i)"
          @mousemove="activeIndex = i"
        >
          {{ opt }}
        </div>
      </div>
    </div>
    <span v-if="error" class="ac-error">{{ error }}</span>
  </div>
  
</template>

<script>
export default {
  name: 'Autocomplete',
  props: {
    modelValue: { type: String, default: '' },
    options: { type: Array, default: () => [] },
    placeholder: { type: String, default: '' },
    label: { type: String, default: '' },
    error: { type: String, default: '' }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      query: this.modelValue || '',
      open: false,
      activeIndex: 0
    };
  },
  computed: {
    filtered() {
      const q = (this.query || '').toLowerCase();
      if (!q) return this.options.slice(0, 20);
      return this.options.filter(o => String(o).toLowerCase().includes(q)).slice(0, 20);
    }
  },
  watch: {
    modelValue(v) {
      if (v !== this.query) this.query = v || '';
    }
  },
  methods: {
    onInput(e) {
      this.query = e.target.value;
      this.$emit('update:modelValue', this.query);
      this.open = true;
      this.activeIndex = 0;
    },
    move(dir) {
      if (!this.filtered.length) return;
      const next = this.activeIndex + dir;
      if (next < 0) this.activeIndex = this.filtered.length - 1;
      else if (next >= this.filtered.length) this.activeIndex = 0;
      else this.activeIndex = next;
    },
    choose(i) {
      if (!this.filtered[i]) return;
      const v = this.filtered[i];
      this.query = v;
      this.$emit('update:modelValue', v);
      this.open = false;
    }
  }
};
</script>

<style scoped>
.ac-wrapper { display: flex; flex-direction: column; gap: 0.25rem; position: relative; }
.ac-label { font-weight: 600; color: #1f2937; font-size: 0.9rem; }
.ac-field { position: relative; }
.ac-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.95rem; }
.ac-input:focus { outline: none; border-color: #60a5fa; box-shadow: 0 0 0 2px rgba(96,165,250,.2); }
.ac-dropdown { position: absolute; z-index: 20; left: 0; right: 0; margin-top: 0.25rem; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; max-height: 220px; overflow: auto; box-shadow: 0 10px 20px rgba(0,0,0,.08); }
.ac-option { padding: 0.5rem 0.75rem; cursor: pointer; }
.ac-option:hover, .ac-option.active { background: #f3f4f6; }
.ac-error { color: #ef4444; font-size: 0.8rem; }
</style>


