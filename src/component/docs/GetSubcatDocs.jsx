import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import NotFound from "./NotFound";

const api_url = import.meta.env.VITE_SERVER_URL;

async function getDocsListData(category) {
  try {
    const response = await axios.get(`${api_url}/documents?category=${category}`);
    return {
      ok: true,
      data: response.data, // 예상 데이터: [{title, date, author}, ...]
    };
  } catch (e) {
    return {
      ok: false,
      status: e.response?.status || 500,
    };
  }
}

function GetSubcatDocs() {
  const { subcategory } = useParams();
  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchList() {
      setLoading(true);
      const result = await getDocsListData(subcategory);
      setPosts(result);
      setLoading(false);
    }
    fetchList();
  }, [subcategory]);

  if (loading) {
    return <NotFound status={0} message="목록 불러오는 중 . . ." />;
  }

  if (!posts.ok) {
    return <NotFound status={posts.status} message="목록을 찾을 수 없습니다" />;
  }

  return (
    <div style={{ width: '100%', padding: '20px', boxSizing: 'border-box' }}>
      <h2 style={{ textAlign: 'left', marginBottom: '20px' }}>
        {subcategory.toUpperCase()}
      </h2>
      
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {posts.data.map((post, index) => (
          <li key={index} style={{ borderBottom: '1px solid #eee', padding: '15px 0' }}>
            <a href={`/docs/${post.title}`} style={{ textDecoration: 'none' }}>
              <h3 style={{ margin: '0 0 5px 0', color: '#007bff' }}>{post.title}</h3>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>
                {post.date} | {post.author}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GetSubcatDocs;