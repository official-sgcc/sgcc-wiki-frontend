import axios from "axios";

const api_url = import.meta.env.VITE_SERVER_URL;

//Get List of entire Tag
export async function GetTagList() {
    try {
        const response = await axios.get(`${api_url}/tags`);
        return response.data;
    } catch (e) {
        alert(e);
        return null;
    }
}

// Get List of Docs associated with specific Tag
export async function GetDocsFromTag(tag, limit = 20, offset = 0) {
  try {
    const response = await axios.get(
      `${api_url}/tags/${tag}/documents`,
      {
        params: {
          limit,
          offset,
        },
      }
    );
    
    return response.data;

  } catch (e) {
    console.error(e);
    return null;
  }
}

//Get List of Categories
export async function GetListOfCategories() {
    try {
        const response = await axios.get(`${api_url}/categories`);
        return response.data;
    } catch (e) {
        console.error(e);
        return null;
    }
}

// Get Category
export async function GetCategory(name) {
  try {
    const response = await axios.get(`${api_url}/categories/${name}`);
    return response.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}

// Create Category
export async function CreateCategory(name, parent = null) {
  try {
    const response = await axios.post(
      `${api_url}/categories`,
      {
        name,
        parent,
      },
      {
        headers: {
          "Content-Type": "application/json",
          auth: sessionStorage.getItem("token"),
        },
      }
    );

    return response.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

// Update Category (백엔드 구현 후 사용)
export async function UpdateCategory(oldName, newName, parent) {
  try {
    const response = await axios.put(
      `${api_url}/categories/${oldName}`,
      {
        name: newName,
        parent,
      },
      {
        headers: {
          "Content-Type": "application/json",
          auth: sessionStorage.getItem("token"),
        },
      }
    );

    return response.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

// Delete Category
export async function DeleteCategory(name) {
  try {
    const response = await axios.delete(`${api_url}/categories/${name}`, {
      headers: {
        auth: sessionStorage.getItem("token"),
      },
    });

    return response.data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}


// Get List of Docs associated with specific Category
export async function GetDocsFromCategory(
  name,
  recursive = false,
  limit = 20,
  offset = 0
) {
  try {
    const response = await axios.get(
      `${api_url}/categories/${name}/documents`,
      {
        params: {
          recursive,
          limit,
          offset,
        },
      }
    );

    return response.data;

  } catch (e) {
    console.error(e);
    return null;
  }
}