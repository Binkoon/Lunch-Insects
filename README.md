# 식충이 캘린더 (Lunch-Insects)

Vue.js와 Firebase를 활용한 **스마트한 점심 관리 플랫폼**!  
팀원들과 함께하는 점심 식사 계획 및 추천 시스템입니다.

---

## 프로젝트 개요

이 프로젝트는 팀원들이 점심을 어디서 먹을지 계획하고,  
**Firebase**를 활용해 그룹 관리, 멤버 상태 추적, 음식점 추천을 제공합니다.  
또한, **월별 소비 분석**을 통해 개인 및 그룹의 식비 관리를 도와줍니다.

---

## 주요 기능

- **그룹 캘린더**: 멤버별 일정 상태 (식사, 휴가, 약속) 관리
- **음식점 추천**: 근처 맛집 검색 및 거리/평점 기반 추천
- **점심 제안 시스템**: 멤버들이 음식점을 제안하고 투표하는 기능
- **소비 분석**: 식권포인트/현금 사용 내역 및 월별 그래프
- **그룹 관리**: 초대 코드, 이메일 초대, 멤버 관리
- **반응형 디자인**: 모바일/데스크톱 최적화

---

## 기술 스택

- **Frontend**: Vue.js 3, Vite, Vue Router
- **Backend**: Firebase (Authentication, Firestore)
- **UI/UX**: CSS3, Glassmorphism, 반응형 디자인
- **애니메이션**: @vueuse/motion, GSAP
- **개발 도구**: ESLint, Prettier

---

## 실행 방법

### 1. 프로젝트 클론 및 설치
```bash
git clone https://github.com/your-repo/lunch-insects.git
cd lunch-insects
npm install
```

### 2. 환경 변수 설정 (.env)
```bash
# Firebase 설정
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# 개발용 계정 (선택사항)
DEV_USER_EMAIL=test1@example.com
DEV_USER_PASSWORD=test1
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 빌드
```bash
npm run build
```

---

## 프로젝트 구조

```
src/
├── pages/              # 페이지 컴포넌트
│   ├── Intro.vue      # 랜딩 페이지
│   ├── Auth.vue       # 로그인/회원가입
│   ├── HomeNew.vue    # 메인 페이지
│   ├── About.vue      # 소개 페이지
│   └── Onboarding.vue # 온보딩 페이지
├── components/         # Vue 컴포넌트
│   ├── Common/        # 공통 컴포넌트
│   ├── Features/      # 기능별 컴포넌트
│   └── ui/           # UI 컴포넌트 (atoms, molecules)
├── layouts/           # 레이아웃 컴포넌트
├── services/          # 서비스 레이어 (Firebase 등)
├── composables/       # Vue 3 Composition API 로직
├── stores/           # 상태 관리 (Pinia 등)
├── router/           # Vue Router 설정
├── types/            # TypeScript 타입 정의
├── utils/            # 유틸리티 함수
├── styles/           # 전역 스타일
└── assets/           # 정적 자산
```

---

## 개발 환경

- **Node.js**: 18.x 이상
- **npm**: 9.x 이상
- **Firebase**: v9+ (Modular SDK)

---

## 라이선스

MIT License

---