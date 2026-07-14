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
        setWikiData(data);
      }

    }

    load();

  }, [subcategory]);




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

      <DocsList docsdata={wikiData} />
    </div>
  );
}

export default SubCategory;