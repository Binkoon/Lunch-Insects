<template>
  <div class="page-layout">
    <header v-if="$slots.header" class="page-header">
      <slot name="header"></slot>
    </header>
    
    <main class="page-main">
      <div class="page-container">
        <aside v-if="$slots.sidebar" class="page-sidebar">
          <slot name="sidebar"></slot>
        </aside>
        
        <section class="page-content">
          <slot></slot>
        </section>
      </div>
    </main>
    
    <footer v-if="$slots.footer" class="page-footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'PageLayout',
  props: {
    sidebarWidth: {
      type: String,
      default: '250px'
    }
  }
};
</script>

<style scoped>
.page-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--bg-tertiary);
  box-shadow: var(--shadow-sm);
  z-index: 100;
}

.page-main {
  flex: 1;
  background: var(--bg-secondary);
}

.page-container {
  max-width: var(--rem-1200);
  margin: 0 auto;
  padding: var(--rem-20);
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--rem-20);
}

.page-sidebar {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--rem-20);
  box-shadow: var(--shadow);
  height: fit-content;
}

.page-content {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--rem-24);
  box-shadow: var(--shadow);
  min-height: var(--rem-400);
}

.page-footer {
  background: var(--bg-primary);
  border-top: 1px solid var(--bg-tertiary);
  padding: var(--rem-20);
  margin-top: auto;
}

/* Sidebar layout */
.page-container:has(.page-sidebar) {
  grid-template-columns: var(--sidebar-width) 1fr;
}

@media (max-width: 48rem) { /* 768px */
  .page-container {
    grid-template-columns: 1fr;
    padding: var(--rem-12);
  }
  
  .page-sidebar {
    order: 2;
  }
  
  .page-content {
    order: 1;
    padding: var(--rem-16);
  }
}
</style>
