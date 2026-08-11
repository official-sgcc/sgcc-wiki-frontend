import React, { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DocsList from "./DocsList";
import { GetDocsFromCategory } from "../util/TagCategoryAPI";

function SubCategory() {
  const navigate=useNavigate();
  const { subcategory } = useParams();

  const getDocsList = useCallback(
    ({ limit, offset }) =>
      GetDocsFromCategory(subcategory, false, limit, offset),
    [subcategory]
  );
  const handleEditButton = () => {
    navigate(`/wiki/edit`,{
      state:{
        category: subcategory,
      },
    });
  };

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
      <button onClick={handleEditButton}>글쓰기</button>

      <DocsList getDocsList={getDocsList} />
    </div>
  );
}

export default SubCategory;