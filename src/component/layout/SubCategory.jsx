import React from 'react';
import { useParams } from 'react-router-dom';

const wikiData = {
  "subcategory1-1": [
    { id: 1, title: "제목", date: "2026-01-01", user: "작성자" },
    { id: 2, title: "제목", date: "2026-01-01", user: "작성자" }
  ],
  "subcategory1-2": [
    { id: 3, title: "제목", date: "2026-01-01", user: "작성자" },
    { id: 4, title: "제목", date: "2026-01-01", user: "작성자" }
  ]
};

function SubCategory() {
  // App.jsx의 :subcategory 위치에 들어온 값을 가져옴
  const { subcategory } = useParams();

  const postList = wikiData[subcategory] || [];

  return (
    <div style={{ width: '100%', padding: '20px', boxSizing: 'border-box' }}>
      {/* 1. 왼쪽 상단 카테고리 이름 */}
      <h2 style={{ 
        textAlign: 'left', 
        fontSize: '1.5rem', 
        marginBottom: '30px',
        color: '#333',
        fontWeight: 'bold'
      }}>
        {subcategory.toUpperCase()}
      </h2>

      {/* 2. 게시글 목록 */}
      {postList.length > 0 ? (
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          margin: 0, 
          width: '100%' 
        }}>
          {postList.map((post) => (
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
            // 마우스 올렸을 때 살짝 강조되는 효과
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
          등록된 게시글이 없습니다.
        </p>
      )}
    </div>
  );
}

export default SubCategory;