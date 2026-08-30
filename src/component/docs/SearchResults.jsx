import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import DocsList from "../layout/DocsList";
import NotFound from "../ui/NotFound";
import { SearchDocs } from "../util/DocsAPI";

/*
  목적: 통합 검색 결과 페이지

  사용법:
  /search?keyword=검색어

  설명:
  - URL의 keyword를 백엔드 검색 API로 전달한다.
  - 제목과 본문을 함께 검색하고 결과는 공용 문서 목록으로 표시한다.
*/
export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword")?.trim() ?? "";

  const getSearchResults = useCallback(
    ({ limit, offset }) => SearchDocs(keyword, "title_content", limit, offset),
    [keyword],
  );

  if (!keyword) {
    return <NotFound status={400} message="검색어를 입력해주세요." />;
  }

  return (
    <DocsList
      getDocsList={getSearchResults}
      heading={`검색 결과: ${keyword}`}
      showSearch={false}
      showWriteButton={false}
    />
  );
}
