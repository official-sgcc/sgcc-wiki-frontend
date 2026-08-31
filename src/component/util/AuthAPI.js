import api from "../../backend/axios"

// Health Check
const HEALTH_CHECK_KEY = "health_checked_at";
const HEALTH_CHECK_INTERVAL = 2 * 60 * 1000; // 2분
// - 최근 2분 이내에 성공한 헬스체크가 있다면 요청하지 않는다.
// - 2분이 지났거나 기록이 없다면 /healthz를 호출한다.
// - 정상 응답을 받은 경우 마지막 확인 시각을 sessionStorage에 저장한다.
// - 서버가 죽었거나 DB 장애로 503이 발생한 경우 에러를 throw한다.
//
// sessionStorage를 사용하므로:
// - 같은 탭에서 새로고침해도 헬스체크 기록이 유지된다.
// - 탭을 종료하면 기록이 사라져 다음 접속 시 다시 확인한다.
export async function CheckHealth() {
  const lastChecked = sessionStorage.getItem(HEALTH_CHECK_KEY);
  const now = Date.now();

  if (lastChecked) {
    const elapsed = now - Number(lastChecked);

    if (elapsed < HEALTH_CHECK_INTERVAL) {
      return {
        status: "ok",
        cached: true,
      };
    }
  }

  try {
    const response = await api.get("/healthz");

    // 백엔드가 정상 응답한 경우에만 확인 시각 저장
    if (response.status === 200 && response.data?.status === "ok") {
      sessionStorage.setItem(
        HEALTH_CHECK_KEY,
        Date.now().toString()
      );

      return {
        status: "ok",
        cached: false,
      };
    }

    // 200이지만 예상한 응답이 아닌 경우도 실패 처리
    throw new Error("Invalid health check response");
  } catch (e) {
    // 실패한 경우에는 기존 health_checked_at을 갱신하지 않는다.
    // 따라서 다음 진입/새로고침에서 다시 확인할 수 있다.
    console.error("Health check failed:", e);
    throw e;
  }
}

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

    const response = await api.get(
      `/users/${targetUsername}`,
      config
    );

    return response.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}

// 관리자 전용 사용자 목록
export async function GetAdminUsers() {
  const response = await api.get("/admin/users", {
    headers: {
      auth: sessionStorage.getItem("token"),
    },
  });

  return response.data;
}

// 관리자 전용 사용자 권한 종류 목록
export async function GetAdminPermissions() {
  const response = await api.get("/admin/permissions", {
    headers: {
      auth: sessionStorage.getItem("token"),
    },
  });

  return response.data?.permissions ?? [];
}

// 관리자 전용 사용자 권한 변경
export async function UpdateUserPermission(username, permission) {
  const response = await api.put(
    `/admin/users/${encodeURIComponent(username)}/permission`,
    { permission },
    {
      headers: {
        "Content-Type": "application/json",
        auth: sessionStorage.getItem("token"),
      },
    },
  );

  return response.data;
}

//비밀번호 재설정 관련
// Password Reset Request
export async function RequestPasswordReset(username) {
  try {
    const response = await api.post(
      "/password-reset/request",
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
    const response = await api.post(
      "/password-reset/confirm",
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
    const response = await api.post(
      "/email/verify",
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
    const response = await api.post(
      "/register/verify-email",
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
    const response = await api.post(
      "/register/verify-status",
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

    const response = await api.post(
      "/register",
      data
    );

    return response.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
