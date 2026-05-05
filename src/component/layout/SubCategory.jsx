import React from 'react';
import { useParams } from 'react-router-dom';

const wikiData = {
  "subcategory1-1" : {
    title: "Subcategory 1-1",
    content: "This is the content for Subcategory 1-1."
  },
  "subcategory1-2" : {
    title: "Subcategory 1-2",
    content: "This is the content for Subcategory 1-2."
  },
  "subcategory2-1" : {
    title: "Subcategory 2-1",
    content: "This is the content for Subcategory 2-1."
  },
  "subcategory2-2" : {
    title: "Subcategory 2-2",
    content: "This is the content for Subcategory 2-2."
  },
  "subcategory3-1" : {
    title: "Subcategory 3-1",
    content: "This is the content for Subcategory 3-1."  
  }
};

function SubCategory() {
  // App.jsx의 :subcategory 위치에 들어온 값을 가져옴
  const { subcategory } = useParams();

  const data = wikiData[subcategory] || { title: "Not Found", content: "해당 서브카테고리에 대한 데이터가 없습니다." };
  return (
    <div className="body-container">
      <h1>{data.title}</h1>
      <p>{data.content}</p>
      {}
    </div>
  );
}

export default SubCategory;