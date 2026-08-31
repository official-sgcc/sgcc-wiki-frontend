import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import NotFound from "../../ui/NotFound";
import ReactMarkdown from "react-markdown";//MD viewer
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { IoTrashOutline } from "react-icons/io5";//휴지통 icon
import { HiOutlinePencilSquare } from "react-icons/hi2";//수정(연필) icon
import { FiClock } from "react-icons/fi";
import { DeleteDocs, GetDocsDetail, formatDate } from "../../util/DocsAPI";// 문서 관련 api
import { GetListOfCategories } from "../../util/TagCategoryAPI";
import { flattenCategories } from "../../util/CategoryTree";
import "./GetDocs.css";
import "./DocumentHistory.css";

function normalizeMarkdown(content) {
  if (typeof content !== "string") return "";

  const fencedDocument = content.match(
    /^\s*```(?:markdown|md)?\s*\n([\s\S]*?)\n```\s*$/i,
  );

  return fencedDocument ? fencedDocument[1] : content;
}

/*

목적: 단일 문서 페이지

사용법: navigate with params.
URL: /wiki/detail/:title
파라미터: 문서 제목 string

설명: title 파라미터로 넘어온 제목의 문서를 서버에서 받아와서 보여주는 페이지

개발 현황
MUST: 완료 - 문서 제목 내용 태그 띄우기
SHOULD: 완료 - 문서 수정 삭제 버튼 연동
COULD: 하단에 해당하는 카테고리 문서 목록 띄우기

*/


function GetDocs() {
  const { title } = useParams();
  const [doc, setDoc] = useState(null);
  const [loding, setLoding] = useState(true);
  const [categoryPath, setCategoryPath] = useState([]);
  const [authState, setAuthState] = useState(() => ({
    token: sessionStorage.getItem("token"),
    username: sessionStorage.getItem("username"),
  }));
  const navigate = useNavigate();

  useEffect(() => {
    const syncAuthState = () => {
      setAuthState({
        token: sessionStorage.getItem("token"),
        username: sessionStorage.getItem("username"),
      });
    };

    window.addEventListener("auth-state-change", syncAuthState);
    return () => window.removeEventListener("auth-state-change", syncAuthState);
  }, []);

  //when page loaded -> getdocs with loding
  useEffect(() => {
    async function fetchDoc() {
      setLoding(true);
      const data = await GetDocsDetail(title);
      setDoc(data);

      const categoryName = data.data?.category?.name;
      if (data.ok && categoryName) {
        const categories = await GetListOfCategories();
        const matchedCategory = flattenCategories(categories ?? []).find(
          (category) => category.name === categoryName,
        );
        setCategoryPath(matchedCategory?.path ?? [categoryName]);
      } else {
        setCategoryPath([]);
      }

      setLoding(false);
    }
    fetchDoc();
  }, [title]);

  function handleEdit() {
    // 문서 수정 페이지로 이동
    // 필요 시 현재 카테고리도 state로 함께 전달

    navigate(`/wiki/detail/${title}/edit`);
  }

  async function handleDelete() {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const rtn=await DeleteDocs(title);
    if(rtn.ok){
      alert("삭제되었습니다.");
      //카테고리 페이지 구현되면 거기로 넘어가도록 수정해야함 ---------------------------------------------------------------------------
      navigate('/');
    }else{
      if(rtn?.status==403){
        alert("삭제 권한이 없습니다");
      }else{
        console.error(rtn.status);
      }
    }
  }

  function handleTagButton(tagName) {
    navigate(`/tag/${encodeURIComponent(tagName)}`);
  }

  if (loding) {
    return (
      //loding 창 들어갈곳
      //임시로 notfound로 땜빵
      <NotFound status={0} message="검색 중 . . ." />
    );
  }
  if (!doc.ok) {
    return <NotFound status={doc.status} message="문서를 찾을 수 없습니다" />;
  }

  const canManageDocument = Boolean(
    authState.token &&
      authState.username &&
      authState.username === doc.data.created_by,
  );

  // console.log(doc.data);
  //doc.data에 title, content, 날짜 등이 있음
  return (
    <article className="docs-container">
      <header className="docs-header">
        <div className="docs-context-row">
          {categoryPath.length > 0 && (
            <nav className="docs-category-breadcrumb" aria-label="문서 카테고리 경로">
            <button
              type="button"
              className="docs-category-breadcrumb__link"
              onClick={() => navigate("/")}
            >
              홈
            </button>

            {categoryPath.map((categoryName, index) => {
              const isCurrent = index === categoryPath.length - 1;

              return (
                <span
                  className={`docs-category-breadcrumb__item ${
                    isCurrent ? "is-current" : "is-intermediate"
                  }`}
                  key={`${categoryName}-${index}`}
                >
                  <span className="docs-category-breadcrumb__separator" aria-hidden="true">
                    &gt;
                  </span>
                  {isCurrent ? (
                    <button
                      type="button"
                      className="docs-category-breadcrumb__link"
                      onClick={() =>
                        navigate(`/wiki/${encodeURIComponent(categoryName)}`)
                      }
                    >
                      {categoryName}
                    </button>
                  ) : (
                    <span className="docs-category-breadcrumb__text">{categoryName}</span>
                  )}
                </span>
              );
            })}
            </nav>
          )}

          <button
            type="button"
            className="docs-history-btn"
            onClick={() =>
              navigate(`/wiki/detail/${encodeURIComponent(title)}/history`)
            }
          >
            <FiClock aria-hidden="true" />
            히스토리
          </button>
        </div>

        <div className="docs-header-top">
          <h1 className="docs-title">{doc.data.title}</h1>

          {canManageDocument && (
            <div className="docs-actions">
              <button
                className="docs-edit-btn"
                onClick={handleEdit}
              >
                <HiOutlinePencilSquare />
              </button>

              <button
                className="docs-delete-btn"
                onClick={handleDelete}
              >
                <IoTrashOutline />
              </button>
            </div>
          )}
        </div>

        <div className="docs-meta">
          <span className="docs-author">
            작성자 : {doc.data.created_by ?? "익명"}
          </span>

          <span className="docs-date">
            작성일 :
            {" "}
            {doc.data.updated_at
              ? formatDate(doc.data.updated_at)
              : "날짜미상"}
          </span>
        </div>

        {doc.data.tags?.length > 0 && (
          <div className="docs-tags" aria-label="문서 태그">
            {doc.data.tags.map((tag) => (
              <button
                key={tag.name}
                type="button"
                className="docs-tag"
                onClick={() => handleTagButton(tag.name)}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        )}
      </header>

      <section className="docs-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        >
          {normalizeMarkdown(doc.data.content)}
        </ReactMarkdown>
      </section>

    </article>
  );
}

export default GetDocs;
