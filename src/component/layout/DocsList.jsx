import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../util/DocsAPI";

//해야하는 과업: 페이지 번호로 호출할 수 있도록

/*
목적: 공용 리스트 컴포넌트

사용법:
<DocsList
  getDocsList={({ limit, offset }) =>
    GetDocsFromCategory("카테고리명", false, limit, offset)
  }
/>

설명:
- getDocsList 함수를 prop으로 받아 내부에서 문서 리스트를 조회함
- 좌상단에서 limit(몇 개씩 볼지) 선택 가능
- 하단에서 이전/다음 페이지 이동 가능

주의:
- 현재 API에는 총 문서 수 / 총 페이지 수를 반환하는 기능이 없음
- 따라서 정확한 마지막 페이지 계산은 불가능
- 임시로 "이번 페이지 데이터 개수가 limit보다 적으면 마지막 페이지일 가능성 높음" 정도만 처리
*/

export default function DocsList({
  getDocsList,
  initialLimit = 20,
}) {
  const navigate = useNavigate();

  const [docsdata, setDocsData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // TODO:
  // 총 문서 개수(total count)를 반환하는 API가 생기면
  // totalCount, totalPages 상태를 추가해서
  // 정확한 페이지 번호 목록(1,2,3,4...) 렌더링 가능
  //
  // 예시:
  // const [totalCount, setTotalCount] = useState(0);
  // const totalPages = Math.ceil(totalCount / limit);

  const offset = (page - 1) * limit;

  useEffect(() => {
    async function fetchDocs() {
      if (!getDocsList) return;

      setLoading(true);
      setError(null);

      try {
        const data = await getDocsList({ limit, offset });
        setDocsData(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setError("문서 목록을 불러오지 못했습니다.");
        setDocsData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDocs();
  }, [getDocsList, limit, offset]);

  const handleChangeLimit = (e) => {
    const newLimit = Number(e.target.value);
    setLimit(newLimit);
    setPage(1); // limit 바뀌면 첫 페이지로 이동
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    // TODO:
    // 총 페이지 수를 알 수 있는 API가 생기면
    // if (page < totalPages) setPage((prev) => prev + 1);
    //
    // 현재는 docsdata.length < limit 이면 마지막 페이지일 가능성이 높다고 보고 막음
    if (docsdata.length === limit) {
      setPage((prev) => prev + 1);
    }
  };

  const isFirstPage = page === 1;
  const isLastPage = docsdata.length < limit;

  return (
    <div style={{ width: "100%" }}>
      {/* 상단 컨트롤 영역 */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          marginBottom: "16px",
          gap: "8px",
        }}
      >
        <label
          htmlFor="docs-limit-select"
          style={{ fontSize: "0.95rem", color: "#444" }}
        >
          보기 옵션
        </label>
        <select
          id="docs-limit-select"
          value={limit}
          onChange={handleChangeLimit}
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "0.95rem",
          }}
        >
          <option value={20}>20개</option>
          <option value={50}>50개</option>
          <option value={100}>100개</option>
        </select>
      </div>

      {/* 로딩 / 에러 */}
      {loading ? (
        <p
          style={{
            color: "#666",
            textAlign: "center",
            marginTop: "50px",
          }}
        >
          문서 목록을 불러오는 중입니다...
        </p>
      ) : error ? (
        <p
          style={{
            color: "red",
            textAlign: "center",
            marginTop: "50px",
          }}
        >
          {error}
        </p>
      ) : docsdata.length > 0 ? (
        <>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              width: "100%",
            }}
          >
            {docsdata.map((post) => (
              <li
                key={post.id ?? `${post.title}-${post.updated_at}`}
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #eee",
                  padding: "20px 10px",
                  cursor: "pointer",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box",
                }}
                onClick={() => navigate(`/wiki/detail/${post.title}`)}
              >
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    color: "#007bff",
                    fontSize: "1.2rem",
                  }}
                >
                  {post.title}
                </h3>

                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#888",
                  }}
                >
                  <span>{formatDate(post.updated_at)}</span>
                  <span style={{ margin: "0 10px" }}>|</span>
                  <span>{post.created_by}</span>
                  <span style={{ margin: "0 10px" }}>|</span>
                  <span>{post.category?.name ?? "카테고리 없음"}</span>
                </div>

                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {post.tags?.map((tag) => (
                    <span
                      key={tag.name}
                      style={{
                        background: "#f3f3f3",
                        padding: "4px 8px",
                        borderRadius: "999px",
                        fontSize: "0.8rem",
                      }}
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>

          {/* 하단 페이지네이션 */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <button
              onClick={handlePrevPage}
              disabled={isFirstPage}
              style={{
                padding: "8px 14px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                background: isFirstPage ? "#f5f5f5" : "#fff",
                color: isFirstPage ? "#aaa" : "#333",
                cursor: isFirstPage ? "not-allowed" : "pointer",
              }}
            >
              이전
            </button>

            <span
              style={{
                fontSize: "0.95rem",
                color: "#444",
                minWidth: "80px",
                textAlign: "center",
              }}
            >
              {page} 페이지
            </span>

            <button
              onClick={handleNextPage}
              disabled={isLastPage}
              style={{
                padding: "8px 14px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                background: isLastPage ? "#f5f5f5" : "#fff",
                color: isLastPage ? "#aaa" : "#333",
                cursor: isLastPage ? "not-allowed" : "pointer",
              }}
            >
              다음
            </button>
          </div>

          {/* TODO:
              총 페이지 수 API가 생기면 아래처럼 교체 가능

              <div>
                [이전] 1 2 3 4 5 [다음]
              </div>

              필요한 값:
              - totalCount 또는 totalPages
          */}
        </>
      ) : (
        <p
          style={{
            color: "#666",
            textAlign: "center",
            marginTop: "50px",
          }}
        >
          등록된 게시글이 없습니다.
        </p>
      )}
    </div>
  );
}
