import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import DocsList from './DocsList';

const wikiData = {
  "subcategory1-1": [
    { id: 1, title: "string", date: "2026-01-01", user: "작성자" },
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

      <DocsList docsdata={filteredPostList}/>
    </div>
  );
}

export default SubCategory;