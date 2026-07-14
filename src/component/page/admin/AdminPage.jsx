import { useState } from "react";
import "./AdminPage.css";
import CategoryTreeEditor from "./CategoryTreeEditor";

//권한으로 접근 제한하는 것 필요

export default function AdminPage() {
  const [selectedTab, setSelectedTab] = useState("category");

  return (
    <div className="admin-page">
      <h1 className="admin-title">관리자 페이지</h1>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${
            selectedTab === "category" ? "active" : ""
          }`}
          onClick={() => setSelectedTab("category")}
        >
          카테고리 관리
        </button>

        <button
          className={`admin-tab ${
            selectedTab === "tag" ? "active" : ""
          }`}
          onClick={() => setSelectedTab("tag")}
        >
          태그 관리
        </button>

        <button
          className={`admin-tab ${
            selectedTab === "user" ? "active" : ""
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
  );
}