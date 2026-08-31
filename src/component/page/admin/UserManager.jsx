import { useEffect, useState } from "react";
import { FiRefreshCw, FiUsers } from "react-icons/fi";
import {
  GetAdminPermissions,
  GetAdminUsers,
  UpdateUserPermission,
} from "../../util/AuthAPI";
import "./UserManager.css";

function getPermissionLabel(permission) {
  if (permission === "admin") return "관리자";
  if (permission === "club_member") return "동아리 회원";
  if (permission === "login_user") return "일반 회원";
  return permission || "알 수 없음";
}

async function requestUserData() {
  const [userData, permissionData] = await Promise.all([
    GetAdminUsers(),
    GetAdminPermissions(),
  ]);

  return {
    users: Array.isArray(userData) ? userData : [],
    permissions: Array.isArray(permissionData) ? permissionData : [],
  };
}

export default function UserManager() {
  const currentUsername = sessionStorage.getItem("username");
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUsername, setUpdatingUsername] = useState("");
  const [updateError, setUpdateError] = useState("");

  async function loadUsers() {
    setIsLoading(true);
    setError("");

    try {
      const data = await requestUserData();
      setUsers(data.users);
      setPermissions(data.permissions);
    } catch (requestError) {
      console.error(requestError);
      setUsers([]);
      setError("사용자 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePermissionChange(username, permission) {
    if (username === currentUsername) return;

    const previousUser = users.find((user) => user.username === username);
    if (!previousUser || previousUser.permission === permission) return;

    setUpdatingUsername(username);
    setUpdateError("");

    try {
      const updatedUser = await UpdateUserPermission(username, permission);
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.username === username
            ? { ...user, permission: updatedUser.permission }
            : user,
        ),
      );
    } catch (requestError) {
      console.error(requestError);
      setUpdateError(`${username} 사용자의 권한을 변경하지 못했습니다.`);
    } finally {
      setUpdatingUsername("");
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialUsers() {
      try {
        const data = await requestUserData();
        if (!isMounted) return;

        setUsers(data.users);
        setPermissions(data.permissions);
      } catch (requestError) {
        if (!isMounted) return;

        console.error(requestError);
        setUsers([]);
        setError("사용자 목록을 불러오지 못했습니다.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadInitialUsers();

    return () => {
      isMounted = false;
    };
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

      {updateError && (
        <p className="user-manager__update-error" role="alert">
          {updateError}
        </p>
      )}

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
                    <select
                      className="user-manager__permission-select"
                      value={user.permission || ""}
                      onChange={(event) =>
                        handlePermissionChange(user.username, event.target.value)
                      }
                      disabled={
                        user.username === currentUsername ||
                        updatingUsername === user.username ||
                        permissions.length === 0
                      }
                      aria-label={`${user.username} 권한`}
                      title={
                        user.username === currentUsername
                          ? "현재 로그인한 계정의 권한은 변경할 수 없습니다."
                          : undefined
                      }
                    >
                      {permissions.map((permission) => (
                        <option key={permission} value={permission}>
                          {getPermissionLabel(permission)}
                        </option>
                      ))}
                    </select>
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
