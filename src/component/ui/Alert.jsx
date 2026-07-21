import { useEffect } from "react";
import "./Alert.css";

/*

목적: 프로젝트 공용 모달 컴포넌트

사용법:
<AlertModal
  type="alert | confirm | loading"
  color="red | yellow | green"
  title="제목"
  content="내용"
  onConfirm={() => {}}
  onClose={() => {}}
  confirmText="확인"
  cancelText="취소"
/>

설명:
- alert
  - 일반 알림창
  - 확인 버튼 1개 표시
- confirm
  - 확인 / 취소 버튼 표시
  - 삭제, 로그아웃 등 사용자 확인이 필요한 상황에서 사용
- loading
  - 로딩 스피너만 표시
  - ESC, 배경 클릭, 닫기 버튼 비활성화

props:
- type         : 모달 종류(alert | confirm | loading)
- color        : 테마 색상(red | yellow | green)
- title        : 제목
- content      : 본문 내용
- onConfirm    : 확인 버튼 클릭 시 실행
- onClose      : 취소, ESC, 배경 클릭, X 버튼 클릭 시 실행
- confirmText  : 확인 버튼 텍스트
- cancelText   : 취소 버튼 텍스트

개발 현황
MUST
- 완료 : Alert 모달
- 완료 : Confirm 모달
- 완료 : Loading 모달
- 완료 : ESC 닫기
- 완료 : 배경 클릭 닫기(loading 제외)

SHOULD
- 완료 : 색상 테마 지원(red / yellow / green)

COULD
- success / warning / error 아이콘 추가
- 버튼 스타일 커스터마이징
- 애니메이션 옵션 추가

*/

export default function AlertModal({
  type = "alert",
  color = "red", // red | yellow | green, 기본값: red
  title = "알림",
  content = "",
  onConfirm = () => {},
  onClose = () => {},
  confirmText = "확인",
  cancelText = "취소",
}) {
  const isLoading = type === "loading";
  const isConfirm = type === "confirm";

  useEffect(() => {
    if (isLoading) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLoading, onClose]);

  if (!title && !content) return null;

  return (
    <div
      className="alert-overlay"
      role="presentation"
      onClick={isLoading ? undefined : onClose}
    >
      <section
        className={`alert-modal alert-modal--${color} ${
          isLoading ? "loading" : ""
        }`}
        role="alertdialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        {!isLoading && (
          <button
            type="button"
            className="alert-close"
            aria-label="모달 닫기"
            onClick={onClose}
          >
            ×
          </button>
        )}

        {isLoading && <div className="alert-spinner" />}

        <h2 className="alert-title">{title}</h2>

        {content && <p className="alert-message">{content}</p>}

        {!isLoading && (
          <div className="alert-buttons">
            {isConfirm && (
              <button
                type="button"
                className="alert-cancel"
                onClick={onClose}
              >
                {cancelText}
              </button>
            )}

            <button
              type="button"
              className="alert-confirm"
              onClick={onConfirm}
              autoFocus
            >
              {confirmText}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
