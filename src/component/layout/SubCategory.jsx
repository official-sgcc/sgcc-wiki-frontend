import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DocsList from './DocsList';
import { GetDocsFromCategory } from '../util/TagCategoryAPI';

function SubCategory() {
  const [wikiData, setWikiData] = useState([]);


  // App.jsx의 :subcategory 위치에 들어온 값을 가져옴

  const { subcategory } = useParams();


  useEffect(() => {

    async function load() {

      const data = await GetDocsFromCategory(subcategory);

      if (data) {
        setWikiData(data.children);
      }

    }

    load();

  }, [subcategory]);



  // 원래 리스트에서 주소창 검색어가 포함된 것만 필터링
  const filteredPostList = wikiData.filter((post) =>
    post.title
      .toLowerCase()
      .includes(searchKeyword.toLowerCase())
  );
  console.log(filteredPostList);


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