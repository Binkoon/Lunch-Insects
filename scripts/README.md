# Scripts 폴더

이 폴더에는 Firebase 관리 및 유지보수용 스크립트들이 포함되어 있습니다.

## 🛠️ 관리용 스크립트

### `add-user-to-group.js`
- **목적**: 특정 사용자를 그룹에 추가
- **사용법**: `node scripts/add-user-to-group.js`
- **기능**: 사용자 ID와 그룹 ID를 통해 사용자를 그룹에 추가

### `check-auth-users.js`
- **목적**: Firebase Authentication 사용자 계정 상태 확인
- **사용법**: `node scripts/check-auth-users.js`
- **기능**: 등록된 사용자들의 인증 상태와 이메일 주소 확인

### `check-current-users.js`
- **목적**: Firestore의 현재 사용자 데이터 확인
- **사용법**: `node scripts/check-current-users.js`
- **기능**: users 컬렉션의 모든 사용자 정보 조회

### `check-user-groups.js`
- **목적**: 사용자별 그룹 소속 정보 확인
- **사용법**: `node scripts/check-user-groups.js`
- **기능**: 각 사용자가 속한 그룹 정보 조회

## 🚫 삭제된 스크립트들

다음 스크립트들은 초기 설정 및 데이터 마이그레이션 완료 후 삭제되었습니다:

- `setup-firestore.js` - 초기 Firestore 설정 및 샘플 데이터 생성
- `update-real-data.js` - 실제 팀원 데이터로 업데이트
- `create-user-accounts.js` - 초기 사용자 계정 생성
- `update-restaurant-visit-counts.js` - 음식점 방문 횟수 업데이트
- `consolidate-restaurants.js` - 중복 음식점 통합
- `migrate-visit-data.js` - 방문 데이터 마이그레이션
- `test-get-user-groups.js` - 사용자 그룹 조회 테스트
- `setup-statistics-collections.js` - 통계 컬렉션 설정

## 📋 사용 주의사항

1. **환경변수 설정**: 모든 스크립트는 프로젝트 루트의 `.env` 파일을 참조합니다.
2. **권한 확인**: Firebase 프로젝트에 대한 적절한 권한이 있는지 확인하세요.
3. **백업**: 중요한 데이터 변경 전에는 반드시 백업을 수행하세요.

## 🔧 새 스크립트 추가 시

새로운 관리 스크립트를 추가할 때는 다음 구조를 따라주세요:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import dotenv from 'dotenv';

// 환경변수 로드
dotenv.config();

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 스크립트 로직...
```

이렇게 일관된 구조를 유지해주세요.
