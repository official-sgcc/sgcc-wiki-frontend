import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ConfirmPasswordReset } from "../../util/AuthAPI";
import "./ResetPassword.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [response, setResponse] = useState(undefined);

  const token = searchParams.get("token");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      setResponse(null);
      return;
    }

    if (password !== passwordConfirm) {
      setResponse(null);
      return;
    }

    const result = await ConfirmPasswordReset(token, password);
    setResponse(result);
  };

  if (response !== undefined) {
    return (
      <div className="reset-password">
        {response ? (
          <h1 className="reset-password__result">
            비밀번호가 성공적으로 변경되었습니다.
          </h1>
        ) : (
          <h1 className="reset-password__result">
            비밀번호 변경에 실패했습니다.
          </h1>
        )}
      </div>
    );
  }

  return (
    <div className="reset-password">
      <h1 className="reset-password__title">비밀번호 재설정</h1>

      <form className="reset-password__form" onSubmit={handleSubmit}>
        <div className="reset-password__field">
          <label htmlFor="password">새 비밀번호</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="reset-password__field">
          <label htmlFor="passwordConfirm">새 비밀번호 확인</label>

          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            required
          />
        </div>

        <button type="submit">비밀번호 변경</button>
      </form>
    </div>
  );
}