import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  base: "/", // 🔥 기본 경로 설정 추가
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // 네이버 Maps API 프록시 (기존 API)
      '/api/naver-maps': {
        target: 'https://naveropenapi.apigw.ntruss.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/naver-maps/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // 기존 API 인증 헤더
            proxyReq.setHeader('X-NCP-APIGW-API-KEY-ID', process.env.VITE_NAVER_MAP_CLIENT_ID || '');
            proxyReq.setHeader('X-NCP-APIGW-API-KEY', process.env.VITE_NAVER_MAP_CLIENT_SECRET || '');
          });
        }
      }
    }
  },
  build: {
    // 코드 스플리팅 최적화
    rollupOptions: {
      output: {
        manualChunks: {
          // 라이브러리 청크 분리
          'vendor': ['vue', 'vue-router'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'chart': ['chart.js'],
          // 페이지별 청크 분리
          'pages': [
            './src/pages/Intro.vue',
            './src/pages/Auth.vue', 
            './src/pages/HomeNew.vue',
            './src/pages/About.vue'
          ],
          // 컴포넌트 청크 분리
          'components': [
            './src/components/Features/GroupCalendar.vue',
            './src/components/Features/GroupManagement.vue'
          ]
        }
      }
    },
    // 청크 크기 경고 제한 증가
    chunkSizeWarningLimit: 1000
  }
});
