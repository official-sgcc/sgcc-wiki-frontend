import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect } from "react";
import SimpleMDE from "react-simplemde-editor";
import "./DocsEditor.css";
import "easymde/dist/easymde.min.css";
import NotFound from "./NotFound";

const api_url = import.meta.env.VITE_SERVER_URL;

//Docs Submit
async function SubmitDocs(Title, Content, Tags, Category) {
  await axios.post(`${api_url}/documents`, {
    title: Title,
    content: Content,
    tags: Tags.map(tag => ({
      name: tag,
    })),
    category: {
      name: Category,
    }
  }, {
    headers: {
      "Content-Type": "application/json",
      auth: sessionStorage.getItem("token"),
    },
  });
}

function DocsEditor() {
  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [categories, setCategories] = useState([]);
  const location = useLocation();

  const initialCategory =
    location.state?.category ?? "";
  const [category, setCategory] = useState(
    location.state?.category ?? ""
  );
  const navigate = useNavigate();

  //수정인 경우 이전 파일을 에디터에 띄우기 위한 용도
  // useEffect(() => {
  //   if (prev !== "") {
  //     setValue(prev);
  //   }
  // }, [prev]);
  if (sessionStorage.getItem("token") == null) {
    return (<NotFound status={0} message="먼저 로그인을 해주세요" />);
  }
  //카테고리 리스트 받아오기
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await axios.get(`${api_url}/categories`);

        setCategories(response.data);

        //카테고리로 넘어온 location 값이 get으로 받은 리스트에 존재하는지 확인 후 처리
        if (
          location.state?.category &&
          response.data.some(
            c => c.name === location.state.category
          )
        ) {
          setCategory(location.state.category);
        }
        else if (response.data.length > 0) {
          setCategory(response.data[0].name);
        }
      } catch (e) {
        console.error(e);

        setCategories([]);
        setCategory("");
      }
    }

    loadCategories();
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
        />

        <button className="save-btn" onClick={handleSubmit}>
          저장
        </button>
      </div>
      <div data-color-mode="light">
        <SimpleMDE value={value} onChange={setValue} />
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
