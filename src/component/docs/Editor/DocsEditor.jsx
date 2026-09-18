import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
import SimpleMDE from "react-simplemde-editor";
import ReactMarkdown from "react-markdown";
import { markdownRehypePlugins } from "../../util/MarkdownSecurity";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import NotFound from "../../ui/NotFound";
import { GetListOfCategories } from "../../util/TagCategoryAPI";
import { SubmitDocs, ModifyDocs, GetDocsDetail, getDocumentPath } from "../../util/DocsAPI";
import { flattenCategories } from "../../util/CategoryTree";
import "./DocsEditor.css";
import "easymde/dist/easymde.min.css";
import { canWriteCategory, useWritePermission } from "../../util/WritePermission";

/*
목적: 문서 편집기

작성 모드
- /wiki/edit

수정 모드
- /wiki/edit?title=문서제목

SubCategory에서 전달하는 기존 state 구조:
navigate("/wiki/edit", {
  state: {
    category: { subcategory },
  },
});
*/

function insertAlignedBlock(editor, alignment) {
  const selectedText = editor.codemirror.getSelection() || "내용을 입력하세요";
  const block = `<div align="${alignment}">\n${selectedText}\n</div>`;

  editor.codemirror.replaceSelection(block);
}

function normalizeMarkdown(content) {
  if (typeof content !== "string") return "";

  const fencedDocument = content.match(
    /^\s*```(?:markdown|md)?\s*\n([\s\S]*?)\n```\s*$/i,
  );

  return fencedDocument ? fencedDocument[1] : content;
}

function DocsEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { prevtitle: pathTitle } = useParams();
  const [searchParams] = useSearchParams();
  const previousTitle = searchParams.get("title") ?? pathTitle;

  const isEditMode = Boolean(previousTitle);
  const { permission, documentActions, loading: checkingPermission } = useWritePermission(previousTitle);
  const [originalCategory, setOriginalCategory] = useState(null);

  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const initialCategory = location.state?.category ?? "";
  const [category, setCategory] = useState(initialCategory);

  const categoryOptions = useMemo(() => {
    return flattenCategories(categories);
  }, [categories]);

  useEffect(() => {
    if (isEditMode || checkingPermission || categoriesLoading) return;
    if (!canWriteCategory(permission, categoryOptions.find((item) => item.name === category))) {
      const firstAllowed = categoryOptions.find((item) => item.isLeaf && canWriteCategory(permission, item));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategory(firstAllowed?.name ?? "");
    }
  }, [isEditMode, checkingPermission, categoriesLoading, permission, categoryOptions, category]);

  const mdeOptions = useMemo(
    () => ({
      spellChecker: false,
      forceSync: true,
      toolbar: [
        "bold",
        "italic",
        "heading",
        "|",
        "quote",
        "unordered-list",
        "ordered-list",
        "link",
        "|",
        {
          name: "align-left",
          action: (editor) => insertAlignedBlock(editor, "left"),
          text: "좌",
          title: "왼쪽 정렬",
        },
        {
          name: "align-center",
          action: (editor) => insertAlignedBlock(editor, "center"),
          text: "중",
          title: "가운데 정렬",
        },
        {
          name: "align-right",
          action: (editor) => insertAlignedBlock(editor, "right"),
          text: "우",
          title: "오른쪽 정렬",
        },
      ],
    }),
    [],
  );

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await GetListOfCategories();

        // 기존 카테고리 목록 로딩 방식 유지
        setCategories(response ?? []);

        const options = flattenCategories(response ?? []);
        if (isEditMode) return;

        // SubCategory에서 전달받은 하위 카테고리가 실제 목록에 존재하면 선택
        if (
          initialCategory &&
          options.some((item) => item.name === initialCategory)
        ) {
          setCategory(initialCategory);
        } else {
          // 전달된 카테고리가 없거나 유효하지 않다면 첫 leaf 카테고리 선택
          const firstLeaf = options.find((item) => item.isLeaf);
          setCategory(firstLeaf?.name ?? "");
        }
      } catch (e) {
        console.error("카테고리 목록 조회 실패:", e);
        setCategories([]);
        setCategory("");
      } finally {
        setCategoriesLoading(false);
      }
    }

    async function init() {
      if (!isEditMode) return;

      try {
        const rtn = await GetDocsDetail(previousTitle);

        if (!rtn.ok) {
          if (
            window.confirm(
              "이전 문서를 불러오는데 실패했습니다. 다시 시도할까요?",
            )
          ) {
            init();
          } else {
            navigate(-1);
          }

          return;
        }

        setTitle(rtn.data.title ?? "");
        setValue(normalizeMarkdown(rtn.data.content ?? ""));
        setTags(rtn.data.tags?.map((tag) => tag.name) ?? []);
        setCategory(rtn.data.category?.name ?? "");
        setOriginalCategory(rtn.data.category?.name ?? "");
      } catch (e) {
        console.error("기존 문서 조회 실패:", e);
        alert("이전 문서를 불러오는 중 오류가 발생했습니다.");
        navigate(-1);
      }
    }

    loadCategories();
    init();

    // 기존 코드 흐름처럼 최초 진입 시 1회만 로드
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addTag() {
    const trimmed = tagInput.trim();

    if (!trimmed) return;

    if (tags.includes(trimmed)) {
      setTagInput("");
      return;
    }

    setTags((prevTags) => [...prevTags, trimmed]);
    setTagInput("");
  }

  function removeTag(target) {
    setTags((prevTags) => prevTags.filter((tag) => tag !== target));
  }

  async function handleSubmit() {
    if (isEditMode && (documentActions?.document_update !== true ||
        (category !== originalCategory && documentActions?.document_move !== true))) {
      alert("문서를 수정하거나 카테고리를 이동할 권한이 없습니다.");
      return;
    }
    if (!canWriteCategory(permission, categoryOptions.find((item) => item.name === category))) {
      alert("이 카테고리에 문서를 작성할 권한이 없습니다.");
      return;
    }
    try {
      setSaving(true);

      if (!title.trim()) {
        alert("문서 제목을 입력해주세요.");
        return;
      }

      // 태그 입력창에 남아 있는 값도 저장할 태그 목록에 포함
      const finalTags = [...tags];
      const trimmedTag = tagInput.trim();

      if (trimmedTag && !finalTags.includes(trimmedTag)) {
        finalTags.push(trimmedTag);
      }

      const leafCategories = categoryOptions.filter((item) =>
        item.isLeaf || (isEditMode && item.name === originalCategory));

      if (
        leafCategories.length === 0 ||
        !leafCategories.some((item) => item.name === category)
      ) {
        alert(`존재하지 않는 카테고리: ${category}`);
        return;
      }

      const selectedCategory = categoryOptions.find(
        (item) => item.name === category,
      );

      const categoryData = {
        name: selectedCategory.name,
        parent:
          selectedCategory.path.length > 1
            ? selectedCategory.path[selectedCategory.path.length - 2]
            : null,
      };

      if (isEditMode) {
        await ModifyDocs(title.trim(), value, finalTags, categoryData);
      } else {
        await SubmitDocs(title.trim(), value, finalTags, categoryData);
      }

      navigate(getDocumentPath(title.trim()));
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) {
        alert("문서 작성 권한이 없습니다.");
      } else {
        alert("문서 저장 중 오류가 발생했습니다.");
        console.error(e);
      }
    } finally {
      setSaving(false);
    }
  }

  if (sessionStorage.getItem("token") == null) {
    return <NotFound status={0} message="먼저 로그인을 해주세요" />;
  }

  if (checkingPermission || categoriesLoading || (isEditMode && originalCategory === null)) {
    return <NotFound status={0} message="권한 확인 중 . . ." />;
  }
  if (isEditMode && documentActions?.document_update !== true) {
    return <NotFound status={403} message="문서 수정 권한이 없습니다" />;
  }
  if (!isEditMode && !categoryOptions.some((item) => item.isLeaf && canWriteCategory(permission, item))) {
    return <NotFound status={403} message="문서 작성 권한이 없습니다" />;
  }

  if (saving) {
    return <NotFound status={0} message="저장 중 . . ." />;
  }

  return (
    <div className="editor-container">
      <div className="editor-category">
        <label htmlFor="category-select" className="category-label">카테고리</label>

        <select
          id="category-select"
          value={category}
          disabled={isEditMode && documentActions?.document_move !== true}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categoryOptions.length === 0 ? (
            <option value="">카테고리 없음</option>
          ) : (
            categoryOptions
              .filter((item) => (item.isLeaf || (isEditMode && item.name === originalCategory)) && canWriteCategory(permission, item))
              .map((item) => (
                <option key={item.name} value={item.name}>
                  {item.path.join(" - ")}
                </option>
              ))
          )}
        </select>
      </div>

      <div className="editor-topbar">
        <input
          type="text"
          className="mde-title-input"
          placeholder="문서 제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          readOnly={isEditMode}
        />

        <button
          type="button"
          className="save-btn"
          onClick={handleSubmit}
          disabled={saving || !canWriteCategory(permission, categoryOptions.find((item) => item.name === category))}
        >
          저장
        </button>
      </div>

      <div className="editor-workspace" data-color-mode="light">
        <section className="editor-workspace__pane" aria-label="Markdown 편집기">
          <h2 className="editor-workspace__heading">편집</h2>
          <SimpleMDE value={value} onChange={setValue} options={mdeOptions} />
        </section>

        <section
          className="editor-workspace__pane editor-markdown-preview"
          aria-label="Markdown 미리보기"
        >
          <h2 className="editor-workspace__heading">미리보기</h2>
          <div className="editor-markdown-preview__content">
            {value.trim() ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={markdownRehypePlugins.concat(rehypeKatex)}
              >
                {normalizeMarkdown(value)}
              </ReactMarkdown>
            ) : (
              <p className="editor-markdown-preview__empty">
                왼쪽에 내용을 입력하면 여기에 미리보기가 표시됩니다.
              </p>
            )}
          </div>
        </section>
      </div>

      <div className="editor-footer">
        <div className="tag-container">
          {tags.map((tag) => (
            <div key={tag} className="tag-chip">
              <span>#{tag}</span>

              <button
                type="button"
                className="tag-remove-btn"
                onClick={() => removeTag(tag)}
              >
                ×
              </button>
            </div>
          ))}

          <input
            type="text"
            className="tag-input"
            placeholder="태그 입력"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " " || e.key === "Tab") {
                e.preventDefault();
                addTag();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default DocsEditor;
