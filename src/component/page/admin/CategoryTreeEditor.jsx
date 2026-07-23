import { useEffect, useState } from "react";
import {
  GetListOfCategories,
  CreateCategory,
  DeleteCategory,
  UpdateCategory,
  GetDocsFromCategory,
} from "../../util/TagCategoryAPI";
import "./CategoryTreeEditor.css";
import { flattenCategories } from "../../util/CategoryTree";
import { useNavigate } from "react-router-dom";

/*
  목적: 관리자용 카테고리 트리 편집 컴포넌트

  사용법:
  <CategoryTreeEditor />

  사용 위치:
  - AdminPage 내부의 카테고리 관리 탭
  - 관리자 권한 검증이 완료된 이후에만 렌더링할 것

  제공 기능:
  - 전체 카테고리를 트리 구조로 조회
  - 카테고리의 하위 항목 펼치기/접기
  - 특정 카테고리 선택 및 상세 정보 확인
  - 새 카테고리 생성
  - 선택한 카테고리의 부모 카테고리 변경
  - 선택한 카테고리 삭제
  - 선택한 카테고리에 속한 문서 개수 조회
  - 문서 개수 클릭 시 해당 카테고리의 문서 목록 페이지로 이동

  트리 구조:
  - Root는 실제 API의 카테고리가 아닌 최상위 가상 노드
  - 부모 카테고리가 없는 카테고리는 Root 하위에 표시
  - 자식 카테고리가 존재하면 폴더 아이콘(📂) 표시
  - 자식 카테고리가 없으면 문서 아이콘(📄) 표시
  - 화살표 버튼을 눌러 하위 카테고리를 펼치거나 접을 수 있음

  상태 관리:
  - tree:
    API에서 조회한 카테고리 트리 데이터

  - selected:
    현재 선택한 카테고리 노드
    Root를 선택하면 null

  - newName:
    새로 생성할 카테고리 이름 입력값

  - parent:
    새 카테고리를 생성할 때 선택한 부모 카테고리 이름
    빈 문자열이면 Root(null) 아래에 생성

  - rename:
    이름 변경 기능을 위한 상태
    현재 백엔드/API 기능 미지원으로 사용하지 않음

  - moveParent:
    선택한 카테고리를 이동할 새 부모 카테고리 이름
    빈 문자열이면 Root(null)로 이동

  - docsCount:
    현재 선택한 카테고리에 등록된 문서 개수

  주요 함수:
  - loadTree():
    전체 카테고리 트리를 API에서 다시 조회하고 tree 상태를 갱신

  - loadDocsCount(selectedName):
    선택된 카테고리의 문서 목록을 조회한 뒤
    응답 배열의 length를 이용하여 문서 개수를 계산

  - handleCreate():
    입력한 이름과 부모 카테고리를 기준으로 새 카테고리 생성
    생성 성공 후 트리를 다시 조회하여 화면 갱신

  - handleMoveParent():
    선택한 카테고리의 부모를 moveParent로 변경
    moveParent가 빈 문자열이면 부모를 null로 설정하여 Root로 이동
    변경 성공 후 트리를 다시 조회하여 화면 갱신

  - handleDelete():
    선택한 카테고리를 삭제
    삭제 전 브라우저 confirm으로 사용자 확인 수행
    삭제 성공 후 선택 상태를 초기화하고 트리를 다시 조회

  - handleRename():
    카테고리 이름 변경을 위한 함수
    현재 API 또는 정책상 기능 미지원 상태로 실제 동작하지 않음

  주의사항:
  - 카테고리 이름을 식별자로 사용하고 있으므로 이름 중복이 없어야 함
  - TreeNode의 key도 node.name을 사용하므로 카테고리 이름은 고유해야 함
  - 현재 문서 개수는 GetDocsFromCategory로 전체 문서를 요청한 뒤 length를 계산함
  - 특정 카테고리의 문서가 많아지면 문서 개수 조회 비용이 커질 수 있음
  - 장기적으로는 API가 문서 개수(count)를 직접 반환하도록 개선하는 것을 권장
  - 부모 변경 시 자신의 하위 카테고리를 부모로 선택하면 순환 구조가 생길 수 있음
  - 현재는 자기 자신만 부모 선택 목록에서 제외하므로,
    추후 자식/하위 자손 카테고리도 부모 후보에서 제외하는 검증이 필요함
  - 삭제 시 하위 카테고리 및 연결된 문서가 어떻게 처리되는지는
    백엔드 DeleteCategory 정책을 반드시 확인해야 함

  개발 현황:
  MUST: 완료 - 전체 카테고리 트리 조회
  MUST: 완료 - 카테고리 트리 펼치기/접기
  MUST: 완료 - 카테고리 선택 및 상세 정보 표시
  MUST: 완료 - 새 카테고리 생성
  MUST: 완료 - 카테고리 부모 변경
  MUST: 완료 - 카테고리 삭제 확인 모달(confirm)
  MUST: 완료 - 선택 카테고리의 문서 개수 조회
  MUST: 완료 - 선택 카테고리 문서 목록 페이지 이동
  SHOULD: 완료 - Root 가상 노드 표시
  SHOULD: 완료 - 선택된 카테고리 스타일 표시
  SHOULD: 완료 - API 처리 후 트리 재조회로 화면 동기화
  COULD: 미지원 - 카테고리 이름 변경(카테고리 이름이 식별자(PK)이므로 정책상 미지원)
  COULD: 진행 예정 - 부모 변경 시 자식/자손 카테고리 선택 방지
  COULD: 진행 예정 - 삭제 전 하위 카테고리/문서 영향 안내
  COULD: 진행 예정 - 생성/수정/삭제 중 로딩 상태 및 버튼 비활성화 처리
  COULD: 진행 예정 - alert 대신 공통 모달 또는 토스트 알림 적용
*/


function TreeNode({ node, level = 0, selected, onSelect }) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <div
        className={`tree-row ${selected === node.name ? "selected" : ""}`}
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={() => onSelect(node)}
      >
        {node.children?.length > 0 ? (
          <span
            className="tree-arrow"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            {open ? "▼" : "▶"}
          </span>
        ) : (
          <span className="tree-arrow"></span>
        )}

        <span className="tree-icon">
          {node.children?.length > 0 ? "📂" : "📄"}
        </span>

        <span className="tree-name">{node.name}</span>
      </div>

      {open &&
        node.children?.map((child) => (
          <TreeNode
            key={child.name}
            node={child}
            level={level + 1}
            selected={selected}
            onSelect={onSelect}
          />
        ))}
    </>
  );
}

export default function CategoryTreeEditor() {
  const navigate = useNavigate();
  const [tree, setTree] = useState([]);
  const [selected, setSelected] = useState(null);

  const [newName, setNewName] = useState("");
  const [parent, setParent] = useState("");

  const [rename, setRename] = useState("");
  const [moveParent, setMoveParent] = useState("");

  const [docsCount, setDocsCount] = useState(0);

  async function loadDocsCount(selectedName) {
    if (!selectedName) {
      setDocsCount(0);
      return;
    }
    const data = await GetDocsFromCategory(selectedName);
    const dataArr = Array.isArray(data) ? data : [];
    console.log("docsCount", dataArr.length);
    setDocsCount(dataArr.length);
  }

  async function loadTree() {
    const data = await GetListOfCategories();

    if (data) {
      setTree(data);
    }
  }

  useEffect(() => {
    loadTree();
  }, []);

  //트리의 부모 변경
  async function handleMoveParent() {
    if (!selected) return;

    try {
      console.log(moveParent);
      await UpdateCategory(
        selected.name,
        "",
        moveParent == "" ? null : moveParent,
      );

      await loadTree();
    } catch (e) {
      console.error(e);
      alert("부모 변경 실패");
    }
  }

  //기능 미지원
  async function handleRename() {
    // if (!selected) return;
    // try {
    //     await UpdateCategory(
    //         selected.name,
    //         rename,
    //         ""
    //     );
    //     await loadTree();
    //     setSelected({
    //         ...selected,
    //         name: rename,
    //     });
    // } catch (e) {
    //     console.error(e);
    //     alert("이름 변경 실패");
    // }
  }

  const allCategories = flattenCategories(tree);
  const selectedInfo = allCategories.find((c) => c.name === selected?.name);

  async function handleCreate() {
    if (!newName.trim()) return;

    try {
      await CreateCategory(newName, parent === "" ? null : parent);

      setNewName("");
      await loadTree();
    } catch (e) {
      console.error(e);
      alert("카테고리 생성 실패");
    }
  }

  async function handleDelete() {
    if (!selected) return;

    const confirmDelete = window.confirm(
      `${selected.name} 카테고리를 삭제하시겠습니까?`,
    );

    if (!confirmDelete) return;

    try {
      await DeleteCategory(selected.name);

      setSelected(null);

      setParent("");

      await loadTree();
    } catch (e) {
      console.error(e);

      alert("카테고리 삭제 실패");
    }
  }

  return (
    <div className="category-editor">
      {/* ===== 왼쪽 트리 ===== */}
      <div className="tree-panel">
        <h2>카테고리</h2>

        <div
          className={`tree-row ${selected === null ? "selected" : ""}`}
          onClick={() => {
            setSelected(null);
            setParent("");

            setRename("");
            setMoveParent("");
          }}
        >
          <span className="tree-arrow"></span>
          <span className="tree-icon">📁</span>
          <span>Root</span>
        </div>

        <div className="tree">
          {tree.map((node) => (
            <TreeNode
              key={node.name}
              node={node}
              level={0}
              selected={selected?.name}
              onSelect={(node) => {
                setSelected(node);
                setParent(node.name);

                const info = allCategories.find((c) => c.name === node.name);

                setRename(node.name);
                loadDocsCount(node.name);

                setMoveParent(
                  info && info.path.length > 1
                    ? info.path[info.path.length - 2]
                    : "",
                );
              }}
            />
          ))}
        </div>
      </div>

      {/* ===== 오른쪽 편집 ===== */}
      <div className="editor-panel">
        <h2>선택된 카테고리</h2>

        {selected ? (
          <>
            <p>
              <b>이름</b> : {selected.name}
            </p>

            <p>
              <b>부모</b> : {selected.parent ?? "Root"}
            </p>

            <p>
              <b>자식</b> : {selected.children?.length ?? 0}개
            </p>
            <div
              onClick={() => {
                navigate(`/wiki/${encodeURIComponent(selected.name)}`);
              }}
              style={{ cursor: "pointer", color: "#007bff" }}
            >
              <p>
                <b>문서 개수</b> : {docsCount}개
              </p>
            </div>
            {/* 이름 변경 기능 미지원
                        <div className="form-group">
                            <label>새 이름</label>

                            <input
                                value={rename}
                                onChange={(e) => setRename(e.target.value)}
                                disabled={true}
                            />

                            <button onClick={handleRename} disabled={true}>
                                이름 변경
                            </button>
                        </div>
                        */}

            <div className="form-group">
              <label>새 부모</label>

              <select
                value={moveParent}
                onChange={(e) => setMoveParent(e.target.value)}
              >
                <option value="">Root (null)</option>

                {allCategories
                  .filter((c) => c.name !== selected.name)
                  .map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.path.join(" - ")}
                    </option>
                  ))}
              </select>

              <button onClick={handleMoveParent}>부모 변경</button>
            </div>

            <button onClick={handleDelete}>삭제</button>
          </>
        ) : (
          <p>Root 선택됨</p>
        )}

        <hr />

        <h3>새 카테고리 생성</h3>

        <div className="category-create-form">
          <div className="form-group">
            <label>이름</label>

            <input
              value={newName}
              placeholder="카테고리 이름"
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>부모</label>

            <select value={parent} onChange={(e) => setParent(e.target.value)}>
              <option value="">Root (null)</option>

              {allCategories.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="create-button" onClick={handleCreate}>
          생성
        </button>
      </div>
    </div>
  );
}
