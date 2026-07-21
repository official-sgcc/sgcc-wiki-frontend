import { useEffect, useState } from "react";
import "./AdminPage.css";
import CategoryTreeEditor from "./CategoryTreeEditor";
import { GetUserInfo } from "../../util/authapi";
import { useNavigate } from "react-router-dom";
import AlertModal from "../../ui/Alert";

//권한으로 접근 제한하는 것 필요

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

      } catch (e) {
        setAlert({
          open: true,
          type: "alert",
          color: "red",
          title: "로그인 필요",
          content: "먼저 로그인해주세요.",
          onConfirm: () => navigate("/login"),
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
              <>
                <h2>태그 관리</h2>
                <p>추후 구현 예정</p>
              </>
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