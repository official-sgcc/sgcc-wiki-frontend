import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Body.css';
import sgccCharacter1 from '../../assets/sgccCharacter1.png';
import sgccCharacter2 from '../../assets/sgccCharacter2.png';

function Body() {
  const [categories, setCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/categories`)
      .then((res) => res.json())
      .then((data) => {
        console.log('받아온 카테고리:', data);
        setCategories(data);
      })
      .catch((err) => console.error('카테고리 불러오기 실패: ', err));
  }, []);


  const mainCategories = categories.filter((cat) => cat.parent === null);
  

  return (
    <div className="body-container">
      
      <div className="category-grid">
        {mainCategories.map((category) => (
          <div 
            key={category.name} 
            className="category-card"
            onMouseEnter={() => setHoveredCategory(category.name)}
            onMouseLeave={() => setHoveredCategory(null)}
          >

            <div className="character-wrapper">
              <img 
                src={hoveredCategory === category.name ? sgccCharacter2 : sgccCharacter1} 
                alt={category.name} className="category-img"
              />

              {hoveredCategory === category.name && (
                <ul className="sub-list">
                {category.children.map((sub, idx) => (
                  <li key={idx} className="sub-item">
                    <Link to={`/wiki/${sub.name ?? sub}`} className="sub-link">
                      {sub.name ?? sub}
                    </Link>
                  </li>
                ))}
              </ul>
              )}
              
            </div>

            <div className="category-title">
              <h3>{category.name}</h3>
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Body;