import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import SimpleMDE from "react-simplemde-editor";
import "./DocsEditor.css";
import "easymde/dist/easymde.min.css";
import NotFound from "./NotFound";

const api_url = import.meta.env.VITE_SERVER_URL;

//Docs Submit
async function SubmitDocs(Title, Content, Tags,Category) {
  try {
    await axios.post(`${api_url}/documents`, {
      title: Title,
      content: Content,
      tags: Tags,
      category: Category,
    });
  } catch (e) {
    console.error(e);
  }
}

function DocsEditor({ prev = "" }) {
  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput,setTagInput]=useState("");
  const { subcategory } = useParams();
  const navigate = useNavigate();

  //수정인 경우 이전 파일을 에디터에 띄우기 위한 용도
  useEffect(() => {
    if (prev !== "") {
      setValue(prev);
    }
  }, [prev]);
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
    setSaving(true);
    const response = await SubmitDocs(title, value, tags, subcategory);
    setSaving(false);
    console.log(response);
    navigate(`/wiki/detail/${title}`);
    //성공여부를 반환하는 형태로 백엔드 수정되면 반영하기
  }
  if (saving) {
    return (
      //임시로 Notfound 재사용
      <NotFound status={0} message="저장 중 . . ." />
    );
  }
  return (
    <div className="editor-container">
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
              if (e.key === "Enter"||e.key===" "||e.key==="Tab") {
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
