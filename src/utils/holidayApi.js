const API_KEY = import.meta.env.VITE_HOLIDAY_API_KEY;

export async function getHolidays(year, month) {
  try {
    const response = await fetch(
      `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?solYear=${year}&solMonth=${String(month).padStart(2, "0")}&_type=json&ServiceKey=${API_KEY}`
    );
    const data = await response.json();

    if (data.response.body.items?.item) {
      const holidays = {};
      const items = Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item]; // 공휴일이 하나만 있을 경우 처리

      items.forEach((item) => {
        const date = `${year}-${String(month).padStart(2, "0")}-${String(item.locdate).slice(-2)}`;
        holidays[date] = item.dateName;
      });

      return holidays;
    }
    return {};
  } catch (error) {
    console.error("공휴일 API 호출 오류:", error);
    return {};
  }
}
