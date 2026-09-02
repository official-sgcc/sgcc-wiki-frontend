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
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("카테고리 불러오기 실패:", error);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  const mainCategories = Array.isArray(categories)
    ? categories.filter((category) => category.parent === null)
    : [];
  const categoryColumns = Math.max(1, Math.min(mainCategories.length, 3));

  return (
    <div className="body-container">
      <section className="home-hero">
        <p className="home-hero__eyebrow">SGCC OFFICIAL WIKI</p>
        <h1>무엇을 찾고 있나요?</h1>
        <p className="home-hero__description">
          카테고리에 마우스를 올려 세부 항목을 확인하세요
        </p>
      </section>
      <div className="home-hero-wave" aria-hidden="true">
        <svg
          className="home-hero-wave__shape"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0 48C210 108 420 8 680 50C930 92 1160 8 1440 24V0H0Z"
            fill="#1a1a2e"
          />
        </svg>
      </div>

      <div
        className="category-grid"
        style={{ "--category-columns": categoryColumns }}
      >
        {mainCategories.map((category) => {
          const subCategories = flattenCategories(
            Array.isArray(category.children) ? category.children : [],
            1,
            [category.name]
          );

          return (
            <div
              key={category.name}
              className="category-card"
              onMouseEnter={() => setHoveredCategory(category.name)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div className="character-wrapper">
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
                    <li className="sub-item-header">
                      <Link
                        to={`/wiki/${encodeURIComponent(category.name)}`}
                        className="sub-item-header__link"
                      >
                        {category.name}
                      </Link>
                    </li>
                    {subCategories.length > 0 ? (
                      subCategories.map((subCategory) => (
                        <li
                          key={subCategory.path.join("/")}
                          className="sub-item"
                        >
                          <Link
                            to={`/wiki/${encodeURIComponent(subCategory.name)}`}
                            className="sub-link"
                            style={{
                              "--sub-category-indent": `${Math.max(0, subCategory.depth - 1) * 0.8}rem`,
                            }}
                          >
                            <span className="sub-link__branch" aria-hidden="true">
                              └
                            </span>
                            <span>{subCategory.name}</span>
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
                <h3>
                  <Link
                    to={`/wiki/${encodeURIComponent(category.name)}`}
                    className="category-title__link"
                  >
                    {category.name}
                  </Link>
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Body;
