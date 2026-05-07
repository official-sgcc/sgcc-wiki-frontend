import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import NotFound from "./NotFound";

const api_url = import.meta.env.VITE_SERVER_URL;
async function getDocsData(title) {
  try {
    const response = await axios.get(`${api_url}/documents/${title}`);
    return convertToHTML(response.data);
  } catch (e) {
    if (e.response) {
      console.log(`status code : ${e.response.status}`);
    } else console.error(e);
    return <NotFound status={e.response.status} message="문서를 찾을 수 없습니다"/>;
  }
}
async function createDocs(Title, Content, Tags) {
  try {
    await axios.post(`${api_url}/documents`,{params: {
      title: Title,
      content : Content,
      tags : Tags
    }});
  } catch (e) {
    console.error(e);
  }
}
function convertToHTML(doc){
  return (
  <article>
    <h1>{doc.title}</h1>
    <h1>{doc.content}</h1>
    <div>
      {doc.tags.map((tag) => (
        <span key={tag}>
          #{tag}
        </span>
      ))}
    </div>
  </article>
  );
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
      {doc !== null ? doc : <NotFound status={0} message="검색 중 . . . "/>}
    </section>
  );
}

export default GetDocs;
