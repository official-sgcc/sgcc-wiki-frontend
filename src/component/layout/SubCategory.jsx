import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import DocsList from './DocsList';


import axios from 'axios';
const api_url = import.meta.env.VITE_SERVER_URL;



async function TempConnect(setWikiData) {
  try {
    const response = await axios.get(
      `${api_url}/documents`
    );

    setWikiData(prev => ({
      ...prev,
      ["subcategory1-1"]: response.data
    }));
  } catch (e) {
    alert(e);
  }
}

function SubCategory() {
  //wikidata. 아직 카테고리 연결이 아니라 전체 문서 연결해둠
  const [wikiData, setWikiData] = useState({
    "subcategory1-1": [],
    "subcategory1-2": []
  });


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

  //임시로 서버 데이터 연결 ********************************************************************************
  useEffect(() => {
    TempConnect(setWikiData);
  }, []);
  //

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

      <DocsList docsdata={filteredPostList} />
    </div>
  );
}

export default SubCategory;