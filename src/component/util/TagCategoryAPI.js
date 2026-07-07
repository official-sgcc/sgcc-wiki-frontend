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

//Get List of Docs associated with specific Tag
export async function GetDocsFromTag(tag){
    try{
        const response = await axios.get(`${api_url}/tags/${tag}`);
        return response.data;
    }catch(e){
        alert(e);
        return null;
    }
}