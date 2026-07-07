import axios from "axios";
const api_url = import.meta.env.VITE_SERVER_URL;

export function formatDate(dateString) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export async function SubmitDocs(Title, Content, Tags, Category) {
  await axios.post(`${api_url}/documents`, {
    title: Title,
    content: Content,
    tags: Tags.map(tag => ({
      name: tag,
    })),
    category: {
      name: Category,
    }
  }, {
    headers: {
      "Content-Type": "application/json",
      auth: sessionStorage.getItem("token"),
    },
  });
}
export async function ModifyDocs(Title, Content, Tags, Category) {
  await axios.put(`${api_url}/documents/${Title}`, {
    content: Content,
    tags: Tags.map(tag => ({
      name: tag,
    })),
    category: {
      name: Category,
    }
  }, {
    headers: {
      "Content-Type": "application/json",
      auth: sessionStorage.getItem("token"),
    },
  });
}

export async function GetDocsDetail(title) {
  try {
    const response = await axios.get(`${api_url}/documents/${title}`);
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
export async function DeleteDocs(title){
  try {
    const response = await axios.delete(`${api_url}/documents/${title}`,{headers:{
      "Content-Type":"application/json",
      auth: sessionStorage.getItem("token"),
    }});
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
