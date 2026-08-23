import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DocsList from "./DocsList";
import NotFound from "../ui/NotFound";
import {
  GetDocsFromCategory,
  GetCategory,
} from "../util/TagCategoryAPI";

/*
 * SubCategory
 *
 * 특정 카테고리의 문서 목록을 표시한다.
 *
 * URL의 subcategory가 실제 존재하는 카테고리인지
 * 먼저 확인한 뒤, 존재하지 않는 경우 NotFound를 표시한다.
 */

function SubCategory() {
  const { subcategory } = useParams();
  const [categoryExists, setCategoryExists] = useState(null);

  // 카테고리 존재 여부 확인
  useEffect(() => {
    const checkCategory = async () => {
      const category = await GetCategory(subcategory);

      setCategoryExists(category !== null);
    };

    checkCategory();
  }, [subcategory]);

  const getDocsList = useCallback(
    ({ limit, offset }) =>
      GetDocsFromCategory(subcategory, false, limit, offset),
    [subcategory]
  );

  // 카테고리 확인 중
  if (categoryExists === null) {
    return null;
  }

  // 존재하지 않는 카테고리
  if (!categoryExists) {
    return <NotFound />;
  }

  return (
    <div
      style={{
        width: "100%",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          textAlign: "left",
          fontSize: "1.5rem",
          marginBottom: "30px",
          color: "#333",
          fontWeight: "bold",
        }}
      >
        {subcategory?.toUpperCase()}
      </h2>

      <DocsList
        getDocsList={getDocsList}
        category={subcategory}
      />
    </div>
  );
}

export default SubCategory;