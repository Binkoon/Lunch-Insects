import dotenv from "dotenv";

dotenv.config(); // 환경변수 로드

import express from "express";
import cors from "cors";
import axios from "axios";


const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const NAVER_CLIENT_ID = process.env.VITE_NAVER_MAP_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.VITE_NAVER_MAP_CLIENT_SECRET;

if (!NAVER_CLIENT_ID) {
  console.error("❌ 환경변수 로드 실패: VITE_NAVER_MAP_CLIENT_ID가 설정되지 않았습니다.");
  process.exit(1); // 서버 종료
}

console.log("✅ 네이버 API Key 로드 완료:", NAVER_CLIENT_ID); // API Key 출력

app.get("/api/geocode", async (req, res) => {
  const { address } = req.query;

  if (!NAVER_CLIENT_ID) {
    return res.status(400).json({ error: "네이버 Geocoding API 키가 설정되지 않았습니다." });
  }

  const url = `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;

  try {
    console.log(`🔍 API 요청: ${url}`); // 요청 URL 디버깅
    const response = await axios.get(url, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID, // ✅ 통합된 Key 사용
        "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET,
      },
    });

    console.log("✅ API 응답:", response.data); // 응답 확인
    res.json(response.data);
  } catch (error) {
    console.error("❌ Geocoding API 요청 실패:", error.response?.data || error.message);
    res.status(500).json({ error: "네이버 API 요청 실패", details: error.response?.data });
  }
});

// 📍 네이버 Directions API 프록시 (도보 이동 시간 요청)
app.get("/api/directions", async (req, res) => {
  const { startLat, startLng, destLat, destLng } = req.query;

  if (!startLat || !startLng || !destLat || !destLng) {
    return res.status(400).json({ error: "잘못된 요청: 좌표 값이 필요합니다." });
  }

  const url = `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start=${startLng},${startLat}&goal=${destLng},${destLat}&option=pedestrian`;

  try {
    console.log(`🔍 Directions API 요청: ${url}`);
    const response = await axios.get(url, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
        "X-NCP-APIGW-API-KEY": NAVER_CLIENT_SECRET,
      },
    });

    console.log("✅ Directions API 응답:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("❌ Directions API 요청 실패:", error.response?.data || error.message);
    res.status(500).json({ error: "네이버 API 요청 실패", details: error.response?.data });
  }
});


// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 백엔드 서버 실행 중: http://localhost:${PORT}`);
  console.log("✅ 네이버 CLIENT_ID:", process.env.VITE_NAVER_MAP_CLIENT_ID);
  console.log("✅ 네이버 CLIENT_SECRET:", process.env.VITE_NAVER_MAP_CLIENT_SECRET);
});
