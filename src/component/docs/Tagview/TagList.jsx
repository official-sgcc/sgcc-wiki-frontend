import { useCallback } from "react";
import { useParams } from "react-router-dom";

import DocsList from "../../layout/DocsList";
import { GetDocsFromTag } from "../../util/TagCategoryAPI";

export default function TagList() {
  const { tag } = useParams();

  const getDocsList = useCallback(
    ({ limit, offset }) =>
      GetDocsFromTag(tag, limit, offset),
    [tag]
  );

  return (
    <div style={{ width: "100%" }}>
      <DocsList
        getDocsList={getDocsList}
        heading={`#${tag}`}
        breadcrumbItems={["태그", `#${tag}`]}
      />
    </div>
  );
}
