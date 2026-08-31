import { useEffect, useState } from "react";
import { FiRefreshCw, FiUsers } from "react-icons/fi";
import { GetAdminUsers } from "../../util/AuthAPI";
import "./UserManager.css";

function getPermissionLabel(permission) {
  if (permission === "admin") return "관리자";
  if (permission === "club_member") return "동아리 회원";
  if (permission === "login_user") return "일반 회원";
  return permission || "알 수 없음";
}

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers() {
    setIsLoading(true);
    setError("");

    try {
      const data = await GetAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (requestError) {
      console.error(requestError);
      setUsers([]);
      setError("사용자 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <section className="user-manager" aria-labelledby="user-manager-title">
      <header className="user-manager__header">
        <div>
          <p className="user-manager__eyebrow">
            <FiUsers aria-hidden="true" /> 관리자 도구
          </p>
          <h2 id="user-manager-title">사용자 관리</h2>
          <p className="user-manager__description">
            가입한 사용자의 권한과 계정 상태를 확인합니다.
          </p>
        </div>

        <button
          type="button"
          className="user-manager__refresh"
          onClick={loadUsers}
          disabled={isLoading}
        >
          <FiRefreshCw aria-hidden="true" />
          새로고침
        </button>
      </header>

      {isLoading ? (
        <p className="user-manager__status">사용자 목록을 불러오는 중입니다...</p>
      ) : error ? (
        <div className="user-manager__status user-manager__status--error">
          <p>{error}</p>
          <button type="button" onClick={loadUsers}>다시 시도</button>
        </div>
      ) : users.length === 0 ? (
        <p className="user-manager__status">등록된 사용자가 없습니다.</p>
      ) : (
        <div className="user-manager__table-wrap">
          <table className="user-manager__table">
            <caption className="sr-only">사용자 목록</caption>
            <thead>
              <tr>
                <th scope="col">사용자</th>
                <th scope="col">권한</th>
                <th scope="col">이메일</th>
                <th scope="col">이메일 인증</th>
                <th scope="col">소개</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.username}>
                  <th scope="row" data-label="사용자">
                    {user.username || "-"}
                  </th>
                  <td data-label="권한">
                    <span className={`user-manager__permission user-manager__permission--${user.permission}`}>
                      {getPermissionLabel(user.permission)}
                    </span>
                  </td>
                  <td data-label="이메일">{user.email || "-"}</td>
                  <td data-label="이메일 인증">
                    <span className={user.email_verified ? "is-verified" : "is-unverified"}>
                      {user.email_verified ? "인증됨" : "미인증"}
                    </span>
                  </td>
                  <td data-label="소개" className="user-manager__bio">
                    {user.bio || "소개 없음"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
