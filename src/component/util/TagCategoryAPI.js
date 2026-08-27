import api from "../../backend/axios"; 
 
//Get List of entire Tag 
export async function GetTagList() { 
    try { 
        const response = await api.get(`/tags`); 
        return response.data; 
    } catch (e) { 
        alert(e); 
        return null; 
    } 
} 
 
// Get List of Docs associated with specific Tag 
export async function GetDocsFromTag(tag, limit = 20, offset = 0) { 
  try { 
    const response = await api.get( 
      `/tags/${tag}/documents`, 
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
        const response = await api.get(`/categories`); 
        return response.data; 
    } catch (e) { 
        console.error(e); 
        return null; 
    } 
} 
 
// Get Category 
export async function GetCategory(name) { 
  try { 
    const response = await api.get(`/categories/${name}`); 
    return response.data; 
  } catch (e) { 
    if (e.response?.status !== 404) { 
      console.error(e); 
    } 
 
    return null; 
  } 
} 
 
 
// Create Category 
export async function CreateCategory(name, parent = null) { 
  try { 
    const response = await api.post( 
      `/categories`, 
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
 
// Update Category 
export async function UpdateCategory( 
  originalName, 
  newName = "", 
  newParent = "" 
) { 
  if (!newName && !newParent) { 
    throw new Error("변경할 내용이 없습니다."); 
  } 
 
  const body = {}; 
 
  // 이름 변경 
  if (newName) { 
    body.name = newName; 
  } 
 
  // 부모 변경 
  if (newParent !== "") { 
    body.parent = newParent; 
  } 
 
  try { 
    const response = await api.put( 
      `/categories/${originalName}`, 
      body, 
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
    const response = await api.delete(`/categories/${name}`, { 
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
 
//GetDocsFromCategory 
export async function GetDocsFromCategory( 
  name, 
  recursive = false, 
  limit, 
  offset, 
) { 
  try { 
    const params = { 
      recursive, 
    }; 
 
    if (limit !== undefined && limit !== null) { 
      params.limit = limit; 
    } 
 
    if (offset !== undefined && offset !== null) { 
      params.offset = offset; 
    } 
 
    const response = await api.get( 
      `/categories/${name}/documents`, 
      { 
        params, 
      } 
    ); 
 
    return response.data; 
  } catch (e) { 
    console.error(e); 
    return null; 
  } 
} 
 
// Delete Tag 
export async function DeleteTag(name) { 
  try { 
    const response = await api.delete(`/tags/${name}`, { 
      headers: { 
        "Content-Type": "application/json", 
        auth: sessionStorage.getItem("token"), 
      }, 
    }); 
 
    return response.data; 
  } catch (e) { 
    console.error(e); 
    throw e; 
  } 
}