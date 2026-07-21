import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Body.css";
import sgccCharacter1 from "../../assets/sgccCharacter1.png";
import sgccCharacter2 from "../../assets/sgccCharacter2.png";

import { GetListOfCategories } from "../util/TagCategoryAPI";
import { flattenCategories } from "../util/CategoryTree";

function Body() {
  const [categories, setCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await GetListOfCategories();

        // console.log("카테고리 응답:", data);
        // console.log("배열 여부:", Array.isArray(data));

        // API 응답이 배열일 때만 state에 저장
        // 아닐 경우 빈 배열을 저장하여 렌더링 오류 방지
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("카테고리 불러오기 실패:", error);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  // 렌더링 시에도 한 번 더 배열 여부를 보장
  const mainCategories = Array.isArray(categories)
    ? categories.filter((category) => category.parent === null)
    : [];

  return (
    <div className="body-container">
      <div className="category-grid">
        {mainCategories.map((category) => {
          const subCategories = flattenCategories(
            Array.isArray(category.children) ? category.children : [],
            1,
            [category.name]
          );

          return (
            <div key={category.name} className="category-card">
              <div
                className="character-wrapper"
                onMouseEnter={() => setHoveredCategory(category.name)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <img
                  src={
                    hoveredCategory === category.name
                      ? sgccCharacter2
                      : sgccCharacter1
                  }
                  alt={category.name}
                  className="category-img"
                />

                {hoveredCategory === category.name && (
                  <ul className="sub-list">
                    {subCategories.length > 0 ? (
                      subCategories.map((subCategory) => (
                        <li
                          key={subCategory.path.join("/")}
                          className="sub-item"
                          style={{
                            paddingLeft: `${(subCategory.depth - 1) * 12}px`,
                          }}
                        >
                          <Link
                            to={`/wiki/${encodeURIComponent(subCategory.name)}`}
                            className="sub-link"
                          >
                            {subCategory.name}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="sub-item empty-category">
                        하위 카테고리가 없습니다.
                      </li>
                    )}
                  </ul>
                )}
              </div>

              <div className="category-title">
                <h3>{category.name}</h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Body;
