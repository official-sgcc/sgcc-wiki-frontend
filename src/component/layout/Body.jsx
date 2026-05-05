import React from 'react';
import { Link } from 'react-router-dom';
import './Body.css';

function Body() {
  // 사이드바에 있던 카테고리 데이터를 그대로 가져옵니다.
  const categories = {
    "category1": ["subcategory1-1", "subcategory1-2"],
    "SGCC 소개": ["subcategory2-1", "subcategory2-2"],
    "category3": ["subcategory3-1", "subcategory3-2"],
  };

  const mainCategories = Object.keys(categories);

  return (
    <div className="body-container">
      
      <div className="category-grid">
        {mainCategories.map((category) => (
          <div key={category} className="category-card">
            <h3>{category}</h3>
            <ul className="sub-list">
              {categories[category].map((sub, idx) => (
                <li key={idx} className="sub-item">
                  <Link to={`/wiki/${sub}`} className="sub-link">
                    {sub}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Body;