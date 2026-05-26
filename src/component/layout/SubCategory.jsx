import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const wikiData = {
  "subcategory1-1": [
    { id: 1, title: "제목1", date: "2026-01-01", user: "작성자" },
    { id: 2, title: "제목2", date: "2026-01-01", user: "작성자" }
  ],
  "subcategory1-2": [
    { id: 3, title: "제목3", date: "2026-01-01", user: "작성자" },
    { id: 4, title: "제목4", date: "2026-01-01", user: "작성자" }
  ]
};

function SubCategory() {
  // App.jsx의 :subcategory 위치에 들어온 값을 가져옴
  const { subcategory } = useParams();
  
  // 주소창의 ?search=검색어 값을 실시간으로 읽어옴
  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get('search') || ""; 

  const originalPostList = wikiData[subcategory] || [];

  // 원래 리스트에서 주소창 검색어가 포함된 것만 필터링
  const filteredPostList = originalPostList.filter((post) =>
    post.title.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div style={{ width: '100%', padding: '20px', boxSizing: 'border-box' }}>
      {/* 왼쪽 상단 카테고리 이름 */}
      <h2 style={{ 
        textAlign: 'left', 
        fontSize: '1.5rem', 
        marginBottom: '30px',
        color: '#333',
        fontWeight: 'bold'
      }}>
        {subcategory ? subcategory.toUpperCase() : ""}
        
      </h2>

      {/* 게시글 목록 (filteredPostList를 기반으로 렌더링) */}
      {filteredPostList.length > 0 ? (
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          margin: 0, 
          width: '100%' 
        }}>
          {filteredPostList.map((post) => (
            <li key={post.id} style={{
              textAlign: 'left',
              borderBottom: '1px solid #eee',
              padding: '20px 10px', 
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <h3 style={{ 
                margin: '0 0 8px 0', 
                color: '#007bff',
                fontSize: '1.2rem' 
              }}>
                {post.title}
              </h3>
              <div style={{ fontSize: '0.9rem', color: '#888' }}>
                <span>{post.date}</span>
                <span style={{ margin: '0 10px' }}>|</span>
                <span>{post.user}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: '#666', textAlign: 'center', marginTop: '50px' }}>
          {searchKeyword ? "검색 결과와 일치하는 게시글이 없습니다." : "등록된 게시글이 없습니다."}
        </p>
      )}
    </div>
  );
}

export default SubCategory;