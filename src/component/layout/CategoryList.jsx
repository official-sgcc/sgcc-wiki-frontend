import { Fragment } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight, FiFolder } from "react-icons/fi";
import "./CategoryList.css";

export default function CategoryList({
  heading,
  categories = [],
  breadcrumbItems = [],
}) {
  return (
    <section className="category-list">
      <nav className="category-list__breadcrumb" aria-label="현재 위치">
        <Link to="/">홈</Link>
        {breadcrumbItems.map((item, index) => {
          const isCurrent = index === breadcrumbItems.length - 1;

          return (
            <Fragment key={`${item}-${index}`}>
              <FiChevronRight aria-hidden="true" />
              <Link
                className={isCurrent ? "is-current" : ""}
                to={`/wiki/${encodeURIComponent(item)}`}
              >
                {item}
              </Link>
            </Fragment>
          );
        })}
      </nav>

      <header className="category-list__header">
        <h1>{heading}</h1>
        <p>{categories.length}개의 하위 카테고리</p>
      </header>

      <ul className="category-list__items">
        {categories.map((category) => {
          const childCount = Array.isArray(category.children)
            ? category.children.length
            : 0;

          return (
            <li key={category.name}>
              <Link
                className="category-list__item"
                to={`/wiki/${encodeURIComponent(category.name)}`}
              >
                <span className="category-list__icon" aria-hidden="true">
                  <FiFolder />
                </span>
                <span className="category-list__content">
                  <strong>{category.name}</strong>
                  <small>
                    {childCount > 0
                      ? `${childCount}개의 하위 카테고리`
                      : "문서 목록 보기"}
                  </small>
                </span>
                <FiChevronRight
                  className="category-list__arrow"
                  aria-hidden="true"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
