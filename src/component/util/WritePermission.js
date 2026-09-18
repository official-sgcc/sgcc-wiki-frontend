import { useEffect, useState } from "react";
import { GetUserInfo } from "./AuthAPI";

export function canWriteCategory(permission, category) {
  const levels = { login_user: 0, club_member: 1, admin: 2 };
  return Boolean(category) && (levels[permission] ?? -1) >=
    (levels[category.write_permission ?? "club_member"] ?? 3);
}

export function useWritePermission() {
  const [auth, setAuth] = useState({ permission: null, loading: true });
  useEffect(() => {
    let active = true;
    let version = 0;
    async function refresh() {
      const request = ++version;
      if (active) setAuth({ permission: null, loading: true });
      const token = sessionStorage.getItem("token");
      const user = token ? await GetUserInfo() : null;
      if (active && request === version) {
        setAuth({ permission: user?.permission ?? null, loading: false });
      }
    }
    refresh();
    window.addEventListener("auth-state-change", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.removeEventListener("auth-state-change", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return auth;
}
