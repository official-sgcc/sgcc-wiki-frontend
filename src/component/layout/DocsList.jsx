import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiChevronRight,
  FiClock,
  FiEdit3,
  FiEye,
  FiSearch,
  FiUser,
} from "react-icons/fi";
import { formatDate } from "../util/DocsAPI";
import "./DocsList.css";

/*
  목적: 공용 문서 목록 컴포넌트

  사용법:
  <DocsList
    getDocsList={({ limit, offset } = {}) =>
      GetDocsFromCategory("카테고리명", false, limit, offset)
    }
  />

  설명:
  - 문서 목록을 조회하고 화면에 렌더링하는 공용 컴포넌트
  - getDocsList 함수를 prop으로 받아 목록 조회 방식을 부모에서 결정
  - 좌측 상단에서 페이지당 표시할 문서 개수(limit) 선택 가능
  - 하단 페이지네이션으로 이전/다음 페이지 및 특정 페이지 이동 가능
  - 문서 제목 클릭 시 해당 문서 상세 페이지로 이동
  - 목록 조회 중에는 로딩 메시지 표시
  - 목록 조회 실패 시 에러 메시지 표시
  - 문서가 없으면 빈 목록 안내 메시지 표시

  페이지네이션 방식:
  - 현재 페이지 목록은 limit, offset 값을 이용해 조회
  - offset 계산식: (현재 페이지 - 1) * 페이지당 문서 수
  - 예시:
    - 1페이지, 20개씩 보기 → limit: 20, offset: 0
    - 2페이지, 20개씩 보기 → limit: 20, offset: 20
    - 3페이지, 20개씩 보기 → limit: 20, offset: 40

  총 문서 수 계산 방식:
  - 현재 API는 totalCount 또는 totalPages를 직접 반환하지 않음
  - 따라서 limit, offset 없이 전체 문서 목록을 한 번 요청
  - 응답 배열의 length를 totalCount로 사용
  - 총 페이지 수 계산식: Math.ceil(totalCount / limit)

  주의:
  - 문서 수가 많아질수록 전체 목록을 받아 length를 계산하는 방식은 비효율적일 수 있음
  - 추후 백엔드 API에서 totalCount를 함께 반환하도록 개선하는 것을 권장
  - totalPages가 매우 커질 경우 모든 페이지 번호를 렌더링하지 말고
    "1 ... 8 9 10 ... 30" 형태의 페이지 그룹 UI 적용 권장

  개발 현황:
  MUST: 완료 - limit, offset 기반 문서 목록 조회
  MUST: 완료 - 이전/다음 페이지 이동
  MUST: 완료 - 특정 페이지 번호 이동
  MUST: 완료 - 페이지당 문서 수 선택
  MUST: 완료 - 전체 목록 length 기반 총 문서 수 계산
  MUST: 완료 - 로딩/에러/빈 목록 상태 처리
  SHOULD: 완료 - 문서 제목 클릭 시 상세 페이지 이동
  COULD: 진행 예정 - API totalCount 응답 기반으로 조회 방식 개선
  COULD: 진행 예정 - 많은 페이지 대응용 페이지 그룹 UI 적용
  COULD: 진행 예정 - 페이지 내 검색 기능은 프론트 엔드 단에서 url 파라미터 이용해서 구현 예정
*/

export default function DocsList({
  getDocsList,
  initialLimit = 20,
  editFunc = null,
  category = null,
  heading = "전체 게시글",
  breadcrumbItems = [],
  linkCategoryBreadcrumbs = false,
  showSearch = true,
  showWriteButton = false,
}) {
  const navigate = useNavigate();

  const [allDocs, setAllDocs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [sortOrder, setSortOrder] = useState("newest");
  const [totalCount, setTotalCount] = useState(0);
  const [listSearch, setListSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [countLoading, setCountLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * limit;

  const sortedDocs = useMemo(() => {
    const direction = sortOrder === "newest" ? -1 : 1;

    return [...allDocs].sort((first, second) => {
      const firstUpdatedAt = Date.parse(first.updated_at);
      const secondUpdatedAt = Date.parse(second.updated_at);
      const firstTime = Number.isNaN(firstUpdatedAt) ? 0 : firstUpdatedAt;
      const secondTime = Number.isNaN(secondUpdatedAt) ? 0 : secondUpdatedAt;

      return (firstTime - secondTime) * direction;
    });
  }, [allDocs, sortOrder]);

  const docsdata = useMemo(
    () => sortedDocs.slice(offset, offset + limit),
    [limit, offset, sortedDocs],
  );

  useEffect(() => {
    async function fetchDocs() {
      if (!getDocsList) return;

      setLoading(true);
      setCountLoading(true);
      setError(null);

      try {
        // 전체 목록을 받은 뒤 정렬하고 현재 페이지에 해당하는 항목만 표시한다.
        const data = await getDocsList({});
        const docs = Array.isArray(data) ? data : [];
        setAllDocs(docs);
        setTotalCount(docs.length);
      } catch (e) {
        console.error(e);
        setError("문서 목록을 불러오지 못했습니다.");
        setAllDocs([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
        setCountLoading(false);
      }
    }

    fetchDocs();
  }, [getDocsList]);

  const handleChangeLimit = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handleChangeSortOrder = (e) => {
    setSortOrder(e.target.value);
    setPage(1);
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleEditButton = () => {
    if (typeof editFunc === "function") {
      editFunc();
      return;
    }

    navigate(`/wiki/edit`, {
      state: {
        category: category,
      },
    });
  };

  const handleSearchKeyDown = (e) => {
    if (e.key !== "Enter") return;

    const keyword = listSearch.trim();
    if (keyword) {
      navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
    }
  };


  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <section className="docs-list">
      <nav className="docs-list__breadcrumb" aria-label="현재 위치">
        <Link to="/">홈</Link>
        {(breadcrumbItems.length ? breadcrumbItems : [heading]).map((item, index) => {
          const isCurrent = index === (breadcrumbItems.length || 1) - 1;

          return (
            <Fragment key={`${item}-${index}`}>
              <FiChevronRight aria-hidden="true" />
              {linkCategoryBreadcrumbs ? (
                <Link
                  className={isCurrent ? "is-current" : ""}
                  to={`/wiki/${encodeURIComponent(item)}`}
                >
                  {item}
                </Link>
              ) : (
                <span className={isCurrent ? "is-current" : ""}>{item}</span>
              )}
            </Fragment>
          );
        })}
      </nav>

      <header className="docs-list__header">
        <div className="docs-list__heading">
          <h1 className="docs-list__heading-title">{heading}</h1>

          <p className="docs-list__heading-count">
            {countLoading ? "게시글 수를 불러오는 중..." : `${totalCount}개의 게시글`}
          </p>
        </div>

        <div
          className={`docs-list__actions ${
            showSearch && !showWriteButton
              ? "docs-list__actions--search-only"
              : ""
          }`}
        >
          {showSearch && (
            <label className="docs-list__search-wrap">
              <FiSearch aria-hidden="true" />
              <input
                className="docs-list__search"
                type="search"
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="검색"
                aria-label="게시글 검색"
              />
            </label>
          )}

          {showWriteButton && (
            <button
              type="button"
              className="docs-list__write-button"
              onClick={handleEditButton}
            >
              <FiEdit3 aria-hidden="true" />
              글쓰기
            </button>
          )}

        </div>
      </header>

      {/* ===== 페이지당 게시글 수 / 정렬 선택 ===== */}
      <div className="docs-list__controls">
        <div className="docs-list__control-group">
          <label htmlFor="docs-limit-select" className="docs-list__label">
            보기
          </label>

          <select
            id="docs-limit-select"
            value={limit}
            onChange={handleChangeLimit}
            className="docs-list__select"
          >
            <option value={20}>20개</option>
            <option value={50}>50개</option>
            <option value={100}>100개</option>
          </select>
        </div>

        <div className="docs-list__control-group">
          <label htmlFor="docs-sort-select" className="docs-list__label">
            정렬
          </label>

          <select
            id="docs-sort-select"
            value={sortOrder}
            onChange={handleChangeSortOrder}
            className="docs-list__select"
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
          </select>
        </div>
      </div>

      {/* ===== 로딩 / 에러 상태 ===== */}
      {loading ? (
        <p className="docs-list__status">게시글을 불러오는 중입니다...</p>
      ) : error ? (
        <p className="docs-list__status docs-list__status--error">{error}</p>
      ) : docsdata.length > 0 ? (
        <>
          <div className="docs-list__table">
            {/* 데스크톱 목록 헤더 */}
            <div className="docs-list__table-header">
              <span>제목</span>
              <span>작성자</span>
              <span>날짜</span>
              <span>조회</span>
            </div>

            <ul className="docs-list__items">
              {docsdata.map((post) => (
                <li
                  key={post.id ?? `${post.title}-${post.updated_at}`}
                  className={`docs-list__item ${post.is_pinned || post.pinned
                    ? "docs-list__item--pinned"
                    : ""
                    }`}
                  onClick={() =>
                    navigate(`/wiki/detail/${encodeURIComponent(post.title)}`)
                  }
                >
                  {/* 제목 / 태그 영역 */}
                  <div className="docs-list__main">
                    <div className="docs-list__title-row">
                      {/* is_pinned 또는 pinned 값이 있을 때 고정 표시 */}
                      {(post.is_pinned || post.pinned) && (
                        <span className="docs-list__notice-badge">고정</span>
                      )}

                      <h2 className="docs-list__title">{post.title}</h2>
                    </div>

                    {post.tags?.length > 0 && (
                      <div className="docs-list__tags">
                        {post.tags.map((tag) => (
                          <span key={tag.name} className="docs-list__tag">
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 작성자 */}
                  <div className="docs-list__writer">
                    <span className="docs-list__mobile-label">작성자</span>
                    <FiUser className="docs-list__meta-icon" aria-hidden="true" />
                    {post.created_by ?? "-"}
                  </div>

                  {/* 날짜 */}
                  <div className="docs-list__date">
                    <span className="docs-list__mobile-label">날짜</span>
                    <FiClock className="docs-list__meta-icon" aria-hidden="true" />
                    {formatDate(post.updated_at)}
                  </div>

                  {/* 조회수: API 필드명에 맞춰 view_count / views 중 하나 사용 */}
                  <div className="docs-list__views">
                    <span className="docs-list__mobile-label">조회</span>
                    <FiEye className="docs-list__meta-icon" aria-hidden="true" />
                    {post.view_count ?? post.views ?? 0}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== 페이지네이션 ===== */}
          <nav className="docs-list__pagination" aria-label="페이지 이동">
            <button
              type="button"
              className="docs-list__page-button"
              onClick={handlePrevPage}
              disabled={isFirstPage}
            >
              이전
            </button>

            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              const isCurrentPage = pageNumber === currentPage;

              return (
                <button
                  type="button"
                  key={pageNumber}
                  className={`docs-list__page-button ${isCurrentPage
                    ? "docs-list__page-button--active"
                    : ""
                    }`}
                  onClick={() => setPage(pageNumber)}
                  aria-current={isCurrentPage ? "page" : undefined}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              type="button"
              className="docs-list__page-button"
              onClick={handleNextPage}
              disabled={isLastPage}
            >
              다음
            </button>
          </nav>
        </>
      ) : (
        <p className="docs-list__status">등록된 게시글이 없습니다.</p>
      )}
    </section>
  );
}
