import { useState } from "react";
import { RequestPasswordReset } from "../../util/AuthAPI";
import AlertModal from "../../ui/Alert";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [modal, setModal] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const username = event.target.username.value;

    setModal({
      type: "loading",
      color: "green",
      title: "처리 중",
      content: "비밀번호 재설정 요청을 처리하고 있습니다.",
    });

    const response = await RequestPasswordReset(username);

    if (response) {
      setModal({
        type: "alert",
        color: "green",
        title: "이메일을 확인해주세요",
        content:
          "비밀번호 재설정 링크를 등록된 이메일로 발송했습니다.",
        confirmText: "확인",
      });
    } else {
      setModal({
        type: "alert",
        color: "red",
        title: "요청 실패",
        content:
          "비밀번호 재설정 요청에 실패했습니다. 잠시 후 다시 시도해주세요.",
        confirmText: "확인",
      });
    }
  };

  const closeModal = () => {
    setModal(null);
  };

  return (
    <div className="forgot-password">
      <h1 className="forgot-password__title">비밀번호 찾기</h1>

      <form
        className="forgot-password__form"
        onSubmit={handleSubmit}
      >
        <div className="forgot-password__field">
          <label
            className="forgot-password__label"
            htmlFor="username"
          >
            아이디
          </label>

          <input
            className="forgot-password__input"
            id="username"
            name="username"
            type="text"
            placeholder="아이디를 입력하세요"
            required
          />
        </div>

        <button
          className="forgot-password__button"
          type="submit"
        >
          비밀번호 재설정 이메일 받기
        </button>
      </form>

      {modal && (
        <AlertModal
          type={modal.type}
          color={modal.color}
          title={modal.title}
          content={modal.content}
          confirmText={modal.confirmText}
          onConfirm={closeModal}
          onClose={closeModal}
        />
      )}
    </div>
  );
}