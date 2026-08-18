import axios from "axios";

const api_url = import.meta.env.VITE_SERVER_URL;

// username을 빈 채로 보내면 현재 로그인된 사용자로. 그것도 없으면 reject. 로그인 안 되어있으면 토큰은 빼고 호출
// Get User Info
export async function GetUserInfo(username = null) {
  const targetUsername =
    username || sessionStorage.getItem("username");

  // 조회할 username이 없으면 요청하지 않음
  if (!targetUsername) {
    // console.error("username이 없습니다.");
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

//비밀번호 재설정 관련
// Password Reset Request
export async function RequestPasswordReset(username) {
  try {
    const response = await axios.post(
      `${api_url}/password-reset/request`,
      {
        username: username,
      }
    );

    return response.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}

// Password Reset Confirm
export async function ConfirmPasswordReset(token, newPassword) {
  try {
    const response = await axios.post(
      `${api_url}/password-reset/confirm`,
      {
        token: token,
        new_password: newPassword,
      }
    );

    return response.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}


//email 설정 관련
//email verify func
// 이메일 인증
export async function VerifyEmail(token) {
  try {
    const response = await axios.post(
      `${api_url}/email/verify`,
      {
        token: token,
      }
    );

    return response.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}

//회원가입 관련

// 회원가입 이메일 인증 요청
export async function RequestRegisterEmailVerification(username, email) {
  try {
    const response = await axios.post(
      `${api_url}/register/verify-email`,
      {
        username: username,
        email: email,
      }
    );

    return response.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

// 회원가입 이메일 인증 상태 확인
export async function CheckRegisterVerifyStatus(username, email) {
  try {
    const response = await axios.post(
      `${api_url}/register/verify-status`,
      {
        username: username,
        email: email,
      }
    );

    return response.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

// 최종 회원가입
export async function RegisterUser(
  username,
  password,
  email,
  verificationToken = null
) {
  try {
    const data = {
      username: username,
      password: password,
      email: email,
    };

    if (verificationToken) {
      data.verification_token = verificationToken;
    }

    const response = await axios.post(
      `${api_url}/register`,
      data
    );

    return response.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}