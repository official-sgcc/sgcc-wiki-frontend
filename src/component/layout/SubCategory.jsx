import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import DocsList from "./DocsList";
import { GetDocsFromCategory } from "../util/TagCategoryAPI";

function SubCategory() {
  const { subcategory } = useParams();

  const getDocsList = useCallback(
    ({ limit, offset }) =>
      GetDocsFromCategory(subcategory, false, limit, offset),
    [subcategory]
  );

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

      <DocsList getDocsList={getDocsList} />
    </div>
  );
}

export default SubCategory;