import { useEffect, useState } from "react";
import { GetPermissionContext, GetDocumentPermissions } from "./AuthAPI";

export function canWriteCategory(permission, category) {
  return permission?.actions?.document_create === true && Boolean(category) &&
    permission?.category_permissions?.[category.name] === true;
}

export function useWritePermission(title = null) {
  const [auth, setAuth] = useState({ permission: null, documentActions: null, loading: true });
  useEffect(() => {
    let active = true;
    let version = 0;
    async function refresh() {
      const request = ++version;
      if (active) setAuth({ permission: null, documentActions: null, loading: true });
      try {
        const [permission, documentActions] = await Promise.all([
          GetPermissionContext(), title ? GetDocumentPermissions(title) : null,
        ]);
        if (active && request === version) setAuth({ permission, documentActions, loading: false });
      } catch {
        if (active && request === version) setAuth({ permission: null, documentActions: null, loading: false });
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
  }, [title]);
  return auth;
}
