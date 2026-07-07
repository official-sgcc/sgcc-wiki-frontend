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