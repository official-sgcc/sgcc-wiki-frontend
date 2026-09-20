import { useEffect, useState } from "react";
import { GetDocumentPermissions } from "./AuthAPI";

export function canWriteCategory(category) {
  return category?.can_write === true;
}

export function useDocumentActions(title) {
  const [documentActions, setDocumentActions] = useState(null);
  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const actions = await GetDocumentPermissions(title);
        if (active) setDocumentActions(actions);
      } catch {
        if (active) setDocumentActions(null);
      }
    }
    refresh();
    window.addEventListener('auth-state-change', refresh);
    return () => {
      active = false;
      window.removeEventListener('auth-state-change', refresh);
    };
  }, [title]);
  return documentActions;
}

export function useWritePermission(title = null) {
  const [auth, setAuth] = useState({ documentActions: null, loading: true });
  useEffect(() => {
    let active = true;
    let version = 0;
    async function refresh() {
      const request = ++version;
      if (active) setAuth({ documentActions: null, loading: true });
      try {
        const documentActions = title ? await GetDocumentPermissions(title) : null;
        if (active && request === version) setAuth({ documentActions, loading: false });
      } catch {
        if (active && request === version) setAuth({ documentActions: null, loading: false });
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
