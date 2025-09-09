# 🍽️ 식충이 캘린더 v2.0 (Lunch-Insects)

Vue3 + Firebase 기반의 **스마트한 점심 관리 플랫폼**!  
팀원들과 함께하는 점심 식사 계획, 음식점 추천, 그리고 소비 분석까지 한 번에!

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-9+-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)

---

## ✨ 주요 기능

### 📅 **월별 캘린더 & 상태 관리**
- 멤버별 일정 상태 (가능/불가능/휴가/다른약속/혼밥/밥스킵) 실시간 관리
- 직관적인 UI로 팀원들의 상태를 한눈에 파악
- 날짜별 음식점 방문 기록 및 추천 시스템

### 🏢 **그룹 관리 시스템**
- 관리자 권한 기반 멤버 초대/제거 시스템
- 이메일 초대 및 그룹 설정 관리
- 실시간 멤버 상태 동기화

### 📊 **소비 분석 & 차트**
- Chart.js 기반 월별 소비 분석 (식권포인트/현금)
- 개인 vs 그룹 소비 비교 차트
- 음식점별 방문 횟수 통계

### 🍽️ **음식점 관리**
- Firebase 기반 음식점 데이터베이스
- 검색 가능한 드롭다운으로 음식점 선택
- 메뉴 및 방문 기록 관리

### 🎨 **모던 UI/UX**
- Glassmorphism 디자인
- 완전 반응형 레이아웃 (모바일/태블릿/데스크톱)
- 로딩 상태 및 에러 처리 최적화

---

## 🏗️ 기술 스택

### **Frontend**
- **Vue.js 3** (Composition API)
- **Vite** (번들러)
- **Vue Router 4** (라우팅)
- **Chart.js** (데이터 시각화)

### **Backend & Database**
- **Firebase Authentication** (사용자 인증)
- **Cloud Firestore** (실시간 데이터베이스)
- **Firebase Hosting** (배포)

### **Development Tools**
- **ESLint** (코드 품질)
- **Modern CSS** (Flexbox, Grid, CSS Variables)
- **컴포넌트 기반 아키텍처**
- **Composables** (재사용 가능한 로직)

---

## 🚀 빠른 시작

### 1. 프로젝트 설정
```bash
# 저장소 클론
git clone https://github.com/your-username/lunch-insects.git
cd lunch-insects

# 의존성 설치
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 Firebase 설정을 추가하세요:

```env
# Firebase 설정
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. 개발 서버 실행
```bash
# 개발 서버 시작
npm run dev
```

브라우저에서 `http://localhost:5173`에 접속하세요.

### 4. 프로덕션 빌드
```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

---

## 📁 프로젝트 구조

```
src/
├── 📄 pages/                    # 페이지 컴포넌트
│   ├── Intro.vue               # 랜딩 페이지
│   ├── Auth.vue                # 로그인/회원가입
│   ├── HomeNew.vue             # 메인 대시보드
│   └── About.vue               # 프로젝트 소개
├── 🧩 components/              # Vue 컴포넌트
│   ├── Common/                 # 공통 컴포넌트 (Modal, TopNav)
│   ├── Features/               # 기능별 컴포넌트
│   │   ├── GroupCalendar.vue   # 그룹 캘린더
│   │   ├── GroupManagement.vue # 그룹 관리
│   │   ├── StatusModal.vue     # 상태 편집 모달
│   │   └── ExpenseChart.vue    # 소비 분석 차트
│   └── ui/                     # 재사용 UI 컴포넌트
├── 🔧 composables/             # Composition API 로직
│   ├── useAuth.js              # 인증 상태 관리
│   ├── useFirebaseData.js      # Firebase 데이터 로직
│   └── useModal.js             # 모달 상태 관리
├── 🌐 services/                # 외부 서비스 연동
│   ├── firebase.js             # Firebase 설정
│   ├── firebaseAuth.js         # 인증 서비스
│   └── firebaseDBv2.js         # Firestore 데이터베이스 서비스
├── 🎯 router/                  # Vue Router 설정
├── ⚙️ config/                  # 설정 파일
├── 🎨 styles/                  # 전역 스타일
└── 📦 assets/                  # 정적 자산
```

---

## 🔧 개발 환경 요구사항

- **Node.js**: 18.x 이상
- **npm**: 9.x 이상
- **모던 브라우저**: Chrome, Firefox, Safari, Edge

---

## 🏆 주요 특징

### ⚡ **성능 최적화**
- **코드 스플리팅**: 컴포넌트별 지연 로딩
- **Firebase 최적화**: 실시간 데이터 동기화
- **이미지 최적화**: 반응형 이미지 및 지연 로딩

### 🛡️ **안정성 & 보안**
- **방어적 프로그래밍**: Null safety 및 에러 핸들링
- **Firebase Rules**: 데이터베이스 보안 규칙
- **환경변수**: 민감한 정보 분리

### 🎨 **사용자 경험**
- **직관적 UI**: 사용자 친화적인 인터페이스
- **반응형 디자인**: 모든 디바이스 지원
- **로딩 상태**: 사용자 피드백 최적화

---