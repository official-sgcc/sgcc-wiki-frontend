import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import NotFound from "./NotFound";
import ReactMarkdown from "react-markdown";
import "./DocsViewStyle.css";

//get from .env
const api_url = import.meta.env.VITE_SERVER_URL;

//get docs from api by axios
async function getDocsData(title) {
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

//temp
async function createDocs(Title, Content, Tags) {
  try {
    await axios.post(`${api_url}/documents`, {
      params: {
        title: Title,
        content: Content,
        tags: Tags,
      },
    });
  } catch (e) {
    console.error(e);
  }
}

//date 값 변환해주는 함수
function formatDate(dateString) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function GetDocs() {
  const { title } = useParams();
  const [doc, setDoc] = useState(null);
  const [loding, setLoding] = useState(true);

  //when page loaded -> getdocs with loding
  useEffect(() => {
    async function fetchDoc() {
      setLoding(true);
      const data = await getDocsData(title);
      setDoc(data);
      setLoding(false);
    }
    fetchDoc();
  }, [title]);

  if (loding) {
    return (
      //loding 창 들어갈곳
      //임시로 notfound로 땜빵
      <NotFound status={0} message="검색 중 . . ." />
    );
  }
  if (!doc.ok) {
    return <NotFound status={doc.status} message="문서를 찾을 수 없습니다" />;
  }
  console.log(doc.data);
  //doc.data에 title, content, 날짜 등이 있음
  return (
    <article className="docs-container">
      <header className="docs-header">
        <h1 className="docs-title">{doc.data.title}</h1>

        <div className="docs-meta">
          <span className="docs-author">
            작성자 : {doc.data.date ?? "익명"}
          </span>

          <span className="docs-date">
            작성일 : {doc.data.updated_at ? formatDate(doc.data.updated_at): "날짜미상"}
          </span>
        </div>
      </header>

      <section className="docs-content">
        <ReactMarkdown>{doc.data.content}</ReactMarkdown>
      </section>
    </article>
  );
}

export default GetDocs;
