<template>
    <footer class="footer-container">
      <div class="footer-content">
        <p>© 2025 식충이 캘린더. All Rights Reserved by Crush on Study</p>
        <nav class="footer-links">
          <a href="#" @click.prevent="scrollToSection('home')">홈</a>
          <a href="#" @click.prevent="scrollToSection('about')">소개</a>
          <a href="#" @click.prevent="scrollToSection('contact')">문의</a>
        </nav>
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    methods: {
      scrollToSection(section) {
        console.log(`🔗 스크롤 이동: ${section}`);
        // 특정 섹션으로 스크롤하는 기능 (추후 구현 가능)
      },
    },
  };
  </script>
  
  <style scoped>
  .footer-container {
    width: 100%;
    background: #f8f9fa;
    padding: 15px 0;
    text-align: center;
    border-top: 1px solid #ddd;
    margin-top: 40px;
  }
  
  .footer-content {
    max-width: 1200px;
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  
  .footer-links {
    display: flex;
    gap: 15px;
  }
  
  .footer-links a {
    color: #007bff;
    text-decoration: none;
    font-size: 14px;
  }
  
  .footer-links a:hover {
    text-decoration: underline;
  }
  </style>
  