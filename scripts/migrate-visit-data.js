import { migrateVisitData } from '../src/services/firebaseDBv2.js';

// 기존 집계 데이터
const existingVisitData = {
  "리원": 15,
  "맘스터치": 6,
  "왕비집": 6,
  "돈우가": 15,
  "KFC": 2,
  "맥도날드": 2,
  "오리마당": 1,
  "칙바이칙": 4,
  "청진동 해장국": 4,
  "태진옥": 6,
  "신의주 부대찌개": 3,
  "금성관": 4
};

// 마이그레이션 실행
async function runMigration() {
  try {
    console.log('방문 데이터 마이그레이션 시작...');
    console.log('마이그레이션할 데이터:', existingVisitData);
    
    // 그룹 ID는 실제 그룹 ID로 변경해야 함
    const groupId = 'your-group-id'; // 실제 그룹 ID로 변경
    
    const result = await migrateVisitData(groupId, existingVisitData);
    
    if (result.success) {
      console.log('✅ 마이그레이션 완료!');
      console.log('총', Object.values(existingVisitData).reduce((a, b) => a + b, 0), '건의 방문 기록이 추가되었습니다.');
    } else {
      console.error('❌ 마이그레이션 실패:', result.error);
    }
  } catch (error) {
    console.error('❌ 마이그레이션 중 오류:', error);
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { runMigration };
