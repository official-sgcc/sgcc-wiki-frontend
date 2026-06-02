import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Body.css';
import sgccCharacter1 from '../../assets/sgccCharacter1.png';
import sgccCharacter2 from '../../assets/sgccCharacter2.png';

function Body() {
  // 사이드바에 있던 카테고리 데이터를 그대로 가져옵니다.
  const categories = {
    "category1": ["subcategory1-1", "subcategory1-2"],
    "SGCC 소개": ["subcategory2-1", "subcategory2-2"],
    "category3": ["subcategory3-1", "subcategory3-2"],
  };

  const mainCategories = Object.keys(categories);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  return (
    <div className="body-container">
      
      <div className="category-grid">
        {mainCategories.map((category) => (
          <div 
            key={category} className="category-card"
          >

            <div 
              className="character-wrapper"
              onMouseEnter={() => setHoveredCategory(category)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <img 
                src={hoveredCategory === category ? sgccCharacter2 : sgccCharacter1} 
                alt={category} className="category-img"
                
              />

              {hoveredCategory === category && (
                <ul className="sub-list">
                {categories[category].map((sub, idx) => (
                  <li key={idx} className="sub-item">
                    <Link to={`/wiki/${sub}`} className="sub-link">
                      {sub}
                    </Link>
                  </li>
                ))}
              </ul>
              )}
              
            </div>

            <div className="category-title">
              <h3>{category}</h3>
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Body;