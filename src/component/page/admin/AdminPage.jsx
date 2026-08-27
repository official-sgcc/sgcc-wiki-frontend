import { useEffect, useState } from "react";
import "./AdminPage.css";
import CategoryTreeEditor from "./CategoryTreeEditor";
import { GetUserInfo } from "../../util/authapi";
import { useNavigate } from "react-router-dom";
import AlertModal from "../../ui/Alert";
import TagManager from "./TagManager";

/*

목적: 관리자 페이지

사용법:
URL:
/admin

설명:
- 관리자 전용 기능을 제공하는 페이지
- 진입 시 현재 로그인한 사용자의 권한을 확인
- admin 권한인 경우에만 관리자 UI를 렌더링
- 권한 확인 중에는 로딩 모달을 표시
- 권한이 없거나 로그인되지 않은 경우 경고 모달을 띄운 뒤
  확인 시 각각 홈("/")으로 이동

탭 구성:
- 카테고리 관리
- 태그 관리 (추후 구현)
- 사용자 관리 (추후 구현)

개발 현황
MUST: 완료 - 관리자 권한 확인
MUST: 완료 - 비로그인/권한 없음 접근 차단
MUST: 완료 - 로딩/경고 모달 처리
SHOULD: 완료 - 카테고리 관리 탭
SHOULD: 완료 - 태그 관리
SHOULD: 진행 예정 - 사용자 관리
COULD: 관리자 대시보드(통계/로그) 추가

*/

export default function AdminPage() {
  const [selectedTab, setSelectedTab] = useState("category");
  const navigate = useNavigate();
  const [alert, setAlert] = useState({
    open: false,
    type: "alert",
    color: "red",
    title: "",
    content: "",
    onConfirm: null,
  });

  const [checkingPermission, setCheckingPermission] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  useEffect(() => {
    async function loadUserInfo() {
      try {
        const userInfo = await GetUserInfo();

        if (userInfo?.permission !== "admin") {
          setAlert({
            open: true,
            type: "alert",
            color: "red",
            title: "접근 불가",
            content: "관리자만 접근할 수 있습니다.",
            onConfirm: () => navigate("/"),
          });

          setCheckingPermission(false);
          return;
        }


        setHasPermission(true);
        setCheckingPermission(false);

      } catch {
        setAlert({
          open: true,
          type: "alert",
          color: "red",
          title: "로그인 필요",
          content: "먼저 로그인해주세요.",
          onConfirm: () => navigate("/"),
        });

        setCheckingPermission(false);
      }

    }

    loadUserInfo();
  }, [navigate]);
  return (
    <>
      {alert.open && (
        <AlertModal
          type={alert.type}
          color={alert.color}
          title={alert.title}
          content={alert.content}
          onConfirm={alert.onConfirm}
          onClose={() =>
            setAlert((prev) => ({
              ...prev,
              open: false,
            }))
          }
        />
      )}


      {checkingPermission ? (
        <AlertModal
          type="loading"
          title="권한 확인 중"
          content="잠시만 기다려주세요."
        />
      ) : hasPermission ? (
        <div className="admin-page">
          <h1 className="admin-title">관리자 페이지</h1>

          <div className="admin-tabs">
            <button
              className={`admin-tab ${selectedTab === "category" ? "active" : ""
                }`}
              onClick={() => setSelectedTab("category")}
            >
              카테고리 관리
            </button>

            <button
              className={`admin-tab ${selectedTab === "tag" ? "active" : ""
                }`}
              onClick={() => setSelectedTab("tag")}
            >
              태그 관리
            </button>

            <button
              className={`admin-tab ${selectedTab === "user" ? "active" : ""
                }`}
              onClick={() => setSelectedTab("user")}
            >
              사용자 관리
            </button>
          </div>

          <div className="admin-content">
            {selectedTab === "category" && (
              <CategoryTreeEditor />
            )}

            {selectedTab === "tag" && (
              <TagManager />
            )}

            {selectedTab === "user" && (
              <>
                <h2>사용자 관리</h2>
                <p>추후 구현 예정</p>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}