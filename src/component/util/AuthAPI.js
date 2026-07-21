import axios from "axios";

const api_url = import.meta.env.VITE_SERVER_URL;

// username을 빈 채로 보내면 현재 로그인된 사용자로. 그것도 없으면 reject. 로그인 안 되어있으면 토큰은 빼고 호출
// Get User Info
export async function GetUserInfo(username = null) {
  const targetUsername =
    username || sessionStorage.getItem("username");

  // 조회할 username이 없으면 요청하지 않음
  if (!targetUsername) {
    console.error("username이 없습니다.");
    return null;
  }

  const token = sessionStorage.getItem("token");

  try {
    const config = {};

    // 로그인한 경우에만 auth 헤더 추가
    if (token) {
      config.headers = {
        auth: token,
      };
    }

    const response = await axios.get(
      `${api_url}/users/${targetUsername}`,
      config
    );

    return response.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}