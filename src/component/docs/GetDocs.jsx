import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import NotFound from "./NotFound";
import ReactMarkdown from "react-markdown";

const api_url = import.meta.env.VITE_SERVER_URL;
async function getDocsData(title) {
  try {
    const response = await axios.get(`${api_url}/documents/${title}`);
    return {
      ok : true,
      data : (response).data,
    };
  } catch (e) {
    return {
      ok: false,
      status : e.response.status,
    }
  }
}
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

function GetDocs() {
  const { title } = useParams();
  const [doc, setDoc] = useState(null);
  const [loding,setLoding] = useState(true);
  useEffect(() => {
    async function fetchDoc() {
      setLoding(true);
      const data = await getDocsData(title);
      setDoc(data);
      setLoding(false);
    }
    fetchDoc();
  }, [title]);

  if(loding){
    return (
      //loding 창 들어갈곳
      //임시로 notfound로 땜빵
      <NotFound status={0} message="검색 중 . . ."/>
    );
  }
  if(!doc.ok){
    return (
      <NotFound status={doc.status} message="문서를 찾을 수 없습니다"/>
    );
  }

  //doc.data에 title, content, 날짜 등이 있음
  return (
    <article>
      <h1>{doc.data.title}</h1>
      <ReactMarkdown>
        {doc.data.content}
      </ReactMarkdown>
    </article>
  );
}

export default GetDocs;
