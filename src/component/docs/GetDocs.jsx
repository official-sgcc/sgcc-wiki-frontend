import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

const api_url = import.meta.env.VITE_SERVER_URL;
async function getDocsData(title) {
  try {
    const response = await axios.get(`${api_url}/documents/${title}`);
    return response.data;
  } catch (e) {
    if (e.response) {
      //404 등 status code 처리
      console.error(e);
    } else console.error(e);
  }
}
async function createDocs(title, content, tags) {
  try {
    await axios.post(`${api_url}/documents`);
  } catch (e) {
    console.error(e);
  }
}

function GetDocs() {
  const { title } = useParams();
  const [intitle, setIntitle] = useState("");
  const [doc, setDoc] = useState(null);
  useEffect(() => {
    async function fetchDoc() {
      const data = await getDocsData(title);
      setDoc(data);
    }
    fetchDoc();
  }, [title]);
  return (
    <section>
      <input
        id="titleinput"
        type="text"
        onChange={(e) => setIntitle(e.target.value)}
        placeholder="title을 입력하세요"
      />
      <button
        onClick={async () => {
          const data = await getDocsData(intitle);
          console.log(data);
        }}
      >
        Load
      </button>
      {doc !== null && (
        <article>
          <h1>{doc.title}</h1>
          <h1>{doc.content}</h1>
        </article>
      )}
    </section>
  );
}

export default GetDocs;
