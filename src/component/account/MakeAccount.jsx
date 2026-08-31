import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MakeAccount.css";
import { FiUser, FiLock, FiMail } from "react-icons/fi";
import {
  RequestRegisterEmailVerification,
  CheckRegisterVerifyStatus,
  RegisterUser,
} from "../util/AuthAPI";
import LoginModal from "./LoginModal";
import AlertModal from "../ui/Alert";

/* 문서화 버전(26.08.18.20:35)
 
목적:
- 이메일 인증을 기반으로 한 회원가입 페이지
- 아이디, 이메일, 비밀번호를 입력받아 최종 회원가입 진행
- 이메일 인증 메일을 발송하고 인증 완료 여부를 확인한 뒤 회원가입 처리
- 회원가입 완료 후 로그인 모달을 표시
- 이미 로그인된 사용자의 회원가입 페이지 접근을 방지
 
회원가입 흐름:
1. 아이디, 이메일, 비밀번호 입력
2. "인증 메일 보내기" 클릭
3. 이메일 인증 메일 발송
4. 사용자가 이메일의 인증 링크를 통해 이메일 인증
5. "인증 완료 확인" 클릭
6. 인증 상태 확인
7. 인증 완료 상태라면 최종 회원가입 요청
8. 회원가입 성공 시 로그인 모달 표시
9. 로그인 성공 시 페이지 새로고침
10. 새로고침 후 Header에서 로그인 상태 반영
 
이메일 인증:
- 이메일 인증 메일 발송:
  RequestRegisterEmailVerification(username, email)
- 인증 완료 여부 확인:
  CheckRegisterVerifyStatus(username, email)
- 이메일 입력값이 변경되면 기존 인증 상태를 초기화
- 이메일을 변경한 경우 다시 인증 메일을 발송해야 함
 
회원가입:
- 인증 완료 확인 결과가 verified: true인 경우에만 최종 회원가입 요청
- 최종 회원가입:
  RegisterUser(username, password, email)
- 회원가입 성공 후 LoginModal을 표시
- 로그인 성공 후 window.location.reload()를 통해 Header의 로그인 상태 갱신
 
로그인 상태:
- sessionStorage의 token을 기준으로 로그인 여부 확인
- 이미 로그인된 사용자가 접근하면 AlertModal을 표시
- Alert 확인 또는 닫기 후 메인 페이지("/")로 이동
 
오류 처리:
- 400:
  아이디 또는 회원가입 정보가 올바르지 않은 경우
- 409:
  이미 사용 중인 이메일
- 429:
  요청 횟수 제한 초과
- 그 외:
  알 수 없는 오류
 
상태:
- isEmailSent:
  이메일 인증 메일 발송 여부
- isVerified:
  이메일 인증 완료 여부
- showLoginModal:
  회원가입 완료 후 로그인 모달 표시 여부
- modal:
  이미 로그인한 사용자를 위한 AlertModal 상태
- errorMessage:
  회원가입 과정에서 발생한 오류 메시지
- isSubmitting:
  API 요청 처리 중 여부
 
개발 현황
 
MUST
- 완료 : 아이디 입력
- 완료 : 이메일 입력
- 완료 : 비밀번호 입력
- 완료 : 이메일 인증 메일 발송
- 완료 : 이메일 인증 상태 확인
- 완료 : 이메일 변경 시 인증 상태 초기화
- 완료 : 이메일 인증 완료 후 회원가입
- 완료 : 회원가입 완료 후 로그인 모달 표시
- 완료 : 로그인 성공 후 Header 로그인 상태 갱신
- 완료 : 로그인 상태에서 회원가입 페이지 접근 제한
- 완료 : AlertModal 사용
 
SHOULD
- 완료 : API 오류 상태별 메시지 처리
- 완료 : 이메일 인증 전 회원가입 방지
- 완료 : 인증 메일 재발송 지원
 
COULD
- 비밀번호 정책 실시간 안내
- 아이디 정책 실시간 안내
- 이메일 인증 재발송 대기시간 표시
- 회원가입 완료 후 메인 페이지로 자동 이동
- 입력값 유효성 검사 강화
 
*/
// 회원가입에서 이름과 학번도 입력하게 하고 싶다면
// 이 코드에서 {/* 와 */} 를 모두 없애고
// 이름과 학번도 api에 보내게 한 다음에
// 백엔드 api에서 이름과 학번도 받고
// 백엔드에서 중복 방지와 본인 확인 코드를 구현하면 된다.
// 허가제로 하고 싶으면 그것도 백엔드에서 만들고.

function MakeAccount() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showLoginModal, setShowLoginModal] = useState(false);

  /*
    const [name, setName] = useState('');
    const [hakbun, setHakbun] = useState('');
  */

  // 이메일 인증 관련 상태
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 이미 로그인한 사용자는 회원가입 페이지에 접근할 수 없음
  const [modal, setModal] = useState(() => {
    if (!sessionStorage.getItem("token")) {
      return null;
    }

    return {
      type: "alert",
      color: "yellow",
      title: "이미 로그인되어 있습니다.",
      content: "로그인된 상태에서는 회원가입을 할 수 없습니다.",
      confirmText: "확인",
    };
  });

  // 비밀번호 정책 검사
  const validatePassword = (password) => {
    if (password.length < 8) {
      return "비밀번호는 8자 이상이어야 합니다.";
    }

    if (!/[A-Za-z]/.test(password)) {
      return "비밀번호에는 영문자가 1자 이상 포함되어야 합니다.";
    }

    if (!/[0-9]/.test(password)) {
      return "비밀번호에는 숫자가 1자 이상 포함되어야 합니다.";
    }

    return null;
  };

  // 이메일 인증 메일 발송
  const handleSendVerification = async () => {
    const passwordError = validatePassword(password);//비밀번호 유효성 검사

    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await RequestRegisterEmailVerification(username, email);

      setIsEmailSent(true);
      setIsVerified(false);
    } catch (error) {
      if (error.response?.status === 400) {
        setErrorMessage("이 아이디는 사용할 수 없습니다.");
      } else if (error.response?.status === 409) {
        setErrorMessage("이미 사용 중인 이메일입니다.");
      } else if (error.response?.status === 429) {
        setErrorMessage("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setErrorMessage("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleAlreadyLoginClose = () => {
    setModal(null);
    navigate("/");
  };

  // 이메일이 변경되면 기존 인증은 무효화
  const handleEmailChange = (event) => {
    setEmail(event.target.value);

    setIsVerified(false);
    setIsEmailSent(false);
  };

  // 이메일 인증 완료 여부 확인
  const handleCheckVerification = async () => {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await CheckRegisterVerifyStatus(username, email);

      if (!response?.verified) {
        setIsVerified(false);
        setErrorMessage("아직 이메일 인증이 완료되지 않았습니다.");
        return;
      }

      // 이메일 인증 완료
      setIsVerified(true);

      // 인증 완료 즉시 최종 회원가입
      const registerResponse = await RegisterUser(username, password, email);

      if (registerResponse) {
        // 회원가입 성공 → 로그인 모달 표시
        setShowLoginModal(true);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setErrorMessage("회원가입 정보가 올바르지 않습니다.");
      } else if (error.response?.status === 429) {
        setErrorMessage("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setErrorMessage("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h2 className="signup-title">회원가입</h2>

      <form
        className="signup-form"
        onSubmit={(event) => event.preventDefault()}
      >
        {/*
            <input
                type="text"
                placeholder="이름"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
            />
            <input
                type="text"
                placeholder="학번"
                value={hakbun}
                onChange={(event) => setHakbun(event.target.value)}
                required
            />
        */}

        <div className="input-with-icon">
          <FiUser className="input-icon" />

          <input
            className="signup-id-input"
            type="text"
            autoComplete="username"
            placeholder="아이디"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </div>

        <div className="input-with-icon">
          <FiMail className="input-icon" />

          <input
            className="signup-email-input"
            type="email"
            autoComplete="email"
            placeholder="이메일"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </div>

        <div className="input-with-icon">
          <FiLock className="input-icon" />

          <input
            className="signup-pw-input"
            type="password"
            autoComplete="new-password"
            placeholder="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {!isVerified && (
          <>
            <button
              className="signup-submit-btn"
              type="button"
              onClick={handleSendVerification}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "처리 중..."
                : isEmailSent
                  ? "인증 메일 다시 보내기"
                  : "인증 메일 보내기"}
            </button>

            {isEmailSent && (
              <button
                className="signup-submit-btn"
                type="button"
                onClick={handleCheckVerification}
                disabled={isSubmitting}
              >
                {isSubmitting ? "확인 중..." : "인증 완료 확인"}
              </button>
            )}
          </>
        )}

        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </form>

      {modal && (
        <AlertModal
          type={modal.type}
          color={modal.color}
          title={modal.title}
          content={modal.content}
          confirmText={modal.confirmText}
          onConfirm={handleAlreadyLoginClose}
          onClose={handleAlreadyLoginClose}
        />
      )}

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
    </>
  );
}

export default MakeAccount;
