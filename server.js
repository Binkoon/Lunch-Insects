import dotenv from "dotenv";

dotenv.config(); // 환경변수 로드

import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 기본 헬스체크 엔드포인트
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "서버가 정상적으로 실행 중입니다.",
    timestamp: new Date().toISOString()
  });
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 백엔드 서버 실행 중: http://localhost:${PORT}`);
  console.log("📌 네이버 지도 API 관련 코드가 제거되었습니다.");
  console.log("📌 무료 지도 API로 교체할 준비가 완료되었습니다.");
  console.log("🔒 보안: 환경변수 노출 방지 완료");
});
