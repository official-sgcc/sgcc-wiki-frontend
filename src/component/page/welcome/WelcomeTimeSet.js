// 신입 부원 모집 버튼과 페이지 보이기를 위한 날짜 계산
// 매번 모집 기간 때마다 숫자를 변경해줘야 보임
// 신기하게 '월'만 index를 0부터 시작해서 7월을 6으로 써야 됨
// 순서는 년, 월, 일
const WELCOME_START = new Date(2026, 6, 13); // 2026-07-13 00:00 local
const WELCOME_END = new Date(2026, 8, 11);   // 2026-09-11 00:00 local, exclusive

export function isWelcomePeriod(now = new Date()) {
  return WELCOME_START <= now && now < WELCOME_END;
}