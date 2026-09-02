import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DocsList from "./DocsList";
import CategoryList from "./CategoryList";
import NotFound from "../ui/NotFound";
import {
  GetDocsFromCategory,
  GetCategory,
  GetListOfCategories,
} from "../util/TagCategoryAPI";
import { flattenCategories } from "../util/CategoryTree";

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
  const [categoryPath, setCategoryPath] = useState([]);
  const [childCategories, setChildCategories] = useState([]);

  // 카테고리 존재 여부 확인
  useEffect(() => {
    const checkCategory = async () => {
      setCategoryExists(null);
      setChildCategories([]);

      const [category, categories] = await Promise.all([
        GetCategory(subcategory),
        GetListOfCategories(),
      ]);

      setCategoryExists(category !== null);
      setChildCategories(
        Array.isArray(category?.children) ? category.children : [],
      );

      const matchedCategory = flattenCategories(categories ?? []).find(
        (item) => item.name === subcategory,
      );
      setCategoryPath(matchedCategory?.path ?? [subcategory]);
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

  if (childCategories.length > 0) {
    return (
      <CategoryList
        heading={subcategory}
        categories={childCategories}
        breadcrumbItems={categoryPath}
      />
    );
  }

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      <DocsList
        getDocsList={getDocsList}
        category={subcategory}
        heading={subcategory}
        breadcrumbItems={categoryPath}
        linkCategoryBreadcrumbs={true}
        showWriteButton={true}
      />
    </div>
  );
}

export default SubCategory;
