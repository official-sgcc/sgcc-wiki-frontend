import api from "../../backend/axios"

export function getDocumentPath(title) {
  return `/wiki/detail?title=${encodeURIComponent(title)}`;
}
 
export function formatDate(dateString) { 
  if (!dateString) return "-";

  const value = String(dateString).trim();
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value);
  const normalizedValue = hasTimezone
    ? value
    : `${value.replace(" ", "T")}Z`;
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) return "-";

  // 백엔드의 시간대 없는 문서 시간은 UTC로 간주하고 한국 시간으로 표시한다.
  const koreaTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);
 
  const year = koreaTime.getUTCFullYear();
  const month = String(koreaTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(koreaTime.getUTCDate()).padStart(2, "0");
 
  const hours = String(koreaTime.getUTCHours()).padStart(2, "0");
  const minutes = String(koreaTime.getUTCMinutes()).padStart(2, "0");
  const seconds = String(koreaTime.getUTCSeconds()).padStart(2, "0");
 
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`; 
} 
 
export async function SubmitDocs( 
  Title, 
  Content, 
  Tags, 
  Category 
) { 
  await api.post("/documents", { 
    title: Title, 
    content: Content, 
 
    tags: Tags.map(tag => ({ 
      name: tag, 
    })), 
 
    category: { 
      name: Category.name, 
      parent: Category.parent, 
    } 
 
  }, { 
    headers: { 
      "Content-Type": "application/json", 
      auth: sessionStorage.getItem("token"), 
    }, 
  }); 
} 
export async function ModifyDocs( 
  Title, 
  Content, 
  Tags, 
  Category 
) { 
  await api.put("/documents/by-title", {
    content: Content, 
 
    tags: Tags.map(tag => ({ 
      name: tag, 
    })), 
 
    category: { 
      name: Category.name, 
      parent: Category.parent, 
    } 
 
  }, {
    params: { title: Title },
    headers: { 
      "Content-Type": "application/json", 
      auth: sessionStorage.getItem("token"), 
    }, 
  }); 
} 
 
export async function GetDocsDetail(title) { 
  try { 
    const response = await api.get("/documents/by-title", {
      params: { title },
    });
    return { 
      ok: true, 
      data: response.data, 
    }; 
  } catch (e) { 
    return { 
      ok: false, 
      status: e.response.status, 
    }; 
  }
}

export async function GetDocsVersions(title) {
  const response = await api.get("/documents/by-title/versions", {
    params: { title },
  });
  return response.data;
}

export async function GetDocsVersion(title, versionNumber) {
  const response = await api.get("/documents/by-title/version", {
    params: { title, version_number: versionNumber },
  });
  return response.data;
}

export async function SearchDocs(keyword, searchType = "title_content", limit, offset) {
  const params = {
    keyword: keyword.trim(),
    search_type: searchType,
  };

  if (limit !== undefined && limit !== null) params.limit = limit;
  if (offset !== undefined && offset !== null) params.offset = offset;

  const response = await api.get("/search", { params });
  return response.data;
}

export async function DeleteDocs(title){ 
  try { 
    const response = await api.delete(
      "/documents/by-title",
      {
        params: { title },
        headers:{ 
          "Content-Type":"application/json", 
          auth: sessionStorage.getItem("token"), 
        } 
      } 
    ); 
 
    return { 
      ok: true, 
      data: response.data, 
    }; 
 
  } catch (e) { 
    return { 
      ok: false, 
      status: e.response?.status ?? 500, 
      message: e.response?.data?.detail ?? "삭제 실패", 
    }; 
  } 
}
