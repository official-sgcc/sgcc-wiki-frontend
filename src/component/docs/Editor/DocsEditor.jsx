import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import SimpleMDE from "react-simplemde-editor"; //MD Editor
import NotFound from "../../ui/NotFound";
import { GetListOfCategories, GetTagList } from "../../util/TagCategoryAPI";//태그 관련 API
import { SubmitDocs, ModifyDocs, GetDocsDetail } from "../../util/DocsAPI";//문서 API
import { flattenCategories } from "../../util/CategoryTree";
import "./DocsEditor.css";//css
import "easymde/dist/easymde.min.css";//mde css

/*

목적: 문서 편집기

사용법: navigate (with params).
URL: 
작성모드 - /wiki/edit
수정모드 - /wiki/detail/:prevtitle/edit
파라미터: 선택사항(수정 모드) - 문서 제목 prevtitle

설명: 문서 작성 및 수정용 페이지

개발 현황
MUST: 완료 - 문서 편집
SHOULD: 완료 - 문서 수정

*/

function DocsEditor() {
  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [categories, setCategories] = useState([]);
  const categoryOptions = useMemo(
    () => {
      return flattenCategories(categories);
    },
    [categories]
  );
  const location = useLocation();
  const mdeOptions = useMemo(
    () => ({
      spellChecker: false,
    }),
    []
  );

  const initialCategory =
    location.state?.category ?? "";
  const { prevtitle } = useParams();

  // console.log("DocsEditor Render");//debug 용


  const isEditMode = prevtitle !== undefined;
  const [category, setCategory] = useState(
    location.state?.category ?? ""
  );
  const navigate = useNavigate();


  if (sessionStorage.getItem("token") == null) {
    return (<NotFound status={0} message="먼저 로그인을 해주세요" />);
  }
  //카테고리 리스트 받아오기
  useEffect(() => {
    async function loadCategories() {
      try {

        const response = await GetListOfCategories();

        // console.log(response);

        setCategories(response);

        const options = flattenCategories(response);
        if (
          location.state?.category &&
          options.some(
            c => c.name === location.state.category
          )
        ) {
          setCategory(
            location.state.category
          );

        }
        else {

          const firstLeaf =
            options.find(
              c => c.isLeaf
            );

          setCategory(
            firstLeaf?.name ?? ""
          );

        }


      } catch (e) {

        console.error(e);

        setCategories([]);

        setCategory("");

      }
    }

    loadCategories();
    //수정인 경우 이전 파일을 에디터에 띄우기 위한 용도
    async function init() {
      if (isEditMode) {
        const rtn = await GetDocsDetail(prevtitle);

        if (!rtn.ok) {
          if (
            confirm(
              "이전 문서를 불러오는데 실패했습니다. 다시 시도할까요?"
            )
          ) {
            init();
          } else {
            navigate(-1);
          }
          return;
        }

        setTitle(rtn.data.title);
        setValue(rtn.data.content);

        setTags(
          rtn.data.tags?.map(tag => tag.name) ?? []
        );

        setCategory(
          rtn.data.category?.name ?? ""
        );
      }
    }

    init();
  }, []);
  function addTag() {
    const trimmed = tagInput.trim();

    if (!trimmed) return;

    // 중복 방지
    if (tags.includes(trimmed)) {
      setTagInput("");
      return;
    }

    setTags([...tags, trimmed]);
    setTagInput("");
  }

  function removeTag(target) {
    setTags(tags.filter((tag) => tag !== target));
  }
  async function handleSubmit() {
    try {
      setSaving(true);

      // 태그 존재 여부는 백단에서 처리하기로 합의
      // //tag 리스트 item들 존재 여부
      // const ServerTags = await GetTagList();
      // const serverTagNames = ServerTags.map(
      //   tag => tag.name
      // );

      // const missingTags = tags.filter(
      //   tag => !serverTagNames.includes(tag)
      // );
      // // console.log(missingTags);

      // if (missingTags.length > 0) {
      //   alert(
      //     `존재하지 않는 태그: ${missingTags.join(", ")}`
      //   );
      //   return;
      // }


      //카테고리가 존재하지 않는 경우
      // console.log(categories);
      // console.log(category);
      if (categories.length === 0 || !categories.map(cat => cat.name).includes(category)) {
        alert(`존재하지 않는 카테고리: ${category}`);
        return;
      }

      //문서 저장 및 수정
      if (isEditMode)
        await ModifyDocs(title, value, tags, category);
      else
        await SubmitDocs(title, value, tags, category);

      navigate(`/wiki/detail/${title}`);
    }
    catch (e) {
      if (e.response?.status === 401) {
        alert("문서 작성 권한이 없습니다.");
        // console.error(e);
      } else {
        alert("문서 저장 중 오류가 발생했습니다.");
        console.error(e);
      }
    }
    finally {
      setSaving(false);
    }
  }
  if (saving) {
    return (
      //임시로 Notfound 재사용
      <NotFound status={0} message="저장 중 . . ." />
    );
  }
  return (
    <div className="editor-container">
      <div className="editor-category">
        <label htmlFor="category-select">
          카테고리
        </label>

        <select
          id="category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.length === 0 ? (
            <option value="">
              카테고리 없음
            </option>
          ) : (
            categories.map((c) => (
              <option
                key={c.name}
                value={c.name}
              >
                {c.name}
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

        <button className="save-btn" onClick={handleSubmit}>
          저장
        </button>
      </div>
      <div data-color-mode="light">
        <SimpleMDE value={value} onChange={setValue} options={mdeOptions} />
      </div>
      <div className="editor-footer">
        <div className="tag-container">
          {tags.map((tag) => (
            <div
              key={tag}
              className="tag-chip"
            >
              <span>
                #{tag}
              </span>

              <button
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
