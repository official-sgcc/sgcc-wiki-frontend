import { useEffect, useMemo, useRef, useState } from "react";
import {
  CreateCategory,
  DeleteCategory,
  GetDocsFromCategory,
  GetListOfCategories,
  UpdateCategory,
} from "../../util/TagCategoryAPI";
import { useNavigate } from "react-router-dom";
import "./CategoryTreeEditor.css";

const NODE_STEP_X = 13;
const NODE_STEP_Y = 9;
const NODE_WIDTH = 11;
const NODE_HEIGHT = 4.5;
const ROOT_KEY = "__root__";

/*
  목적: 관리자용 카테고리 트리 도식도

  사용법:
  <CategoryTreeEditor />

  설명:
  - 카테고리를 자료구조 교안처럼 정점과 연결선으로 표시한다.
  - 정점 상단 포트에서 다른 정점으로 드래그하면 부모 카테고리를 변경한다.
  - 우측 상단 + 버튼으로 루트 카테고리를 생성한다.
*/

function layoutTree(tree) {
  let leafIndex = 0;
  const nodes = [];

  function visit(node, depth, parentKey) {
    const children = Array.isArray(node.children) ? node.children : [];
    const childLayouts = children.map((child) => visit(child, depth + 1, node.name));
    const x = childLayouts.length
      ? childLayouts.reduce((sum, child) => sum + child.x, 0) / childLayouts.length
      : leafIndex++;

    const current = { key: node.name, node, depth, parentKey, x };
    nodes.push(current);
    return current;
  }

  const roots = tree.map((node) => visit(node, 1, ROOT_KEY));
  const rootX = roots.length
    ? roots.reduce((sum, node) => sum + node.x, 0) / roots.length
    : 0;

  return [
    { key: ROOT_KEY, node: { name: "Root" }, depth: 0, parentKey: null, x: rootX },
    ...nodes,
  ];
}

function isDescendant(tree, sourceName, targetName) {
  function find(nodes) {
    for (const node of nodes) {
      if (node.name === sourceName) return node;
      const found = find(Array.isArray(node.children) ? node.children : []);
      if (found) return found;
    }
    return null;
  }

  function contains(node, name) {
    return (node.children ?? []).some(
      (child) => child.name === name || contains(child, name),
    );
  }

  const source = find(tree);
  return Boolean(source && contains(source, targetName));
}

function DiagramNode({ item, selected, onSelect, onPortPointerDown }) {
  const isRoot = item.key === ROOT_KEY;

  return (
    <div
      className={`diagram-node ${isRoot ? "diagram-node--root" : ""} ${
        selected ? "is-selected" : ""
      }`}
      data-category-node={item.key}
      style={{
        left: `${item.x * NODE_STEP_X}rem`,
        top: `${item.depth * NODE_STEP_Y}rem`,
      }}
      onClick={() => !isRoot && onSelect(item.node)}
    >
      {!isRoot && (
        <button
          type="button"
          className="diagram-port diagram-port--input"
          aria-label={`${item.node.name} 부모 연결점`}
          title="드래그해서 부모 정점에 연결"
          onPointerDown={(event) => onPortPointerDown(event, item.node.name)}
        />
      )}
      <strong className="diagram-node__name">{item.node.name}</strong>
      <span>{item.node.children?.length ?? 0} children</span>
      <span className="diagram-port diagram-port--output" aria-hidden="true" />
    </div>
  );
}

export default function CategoryTreeEditor() {
  const navigate = useNavigate();
  const diagramRef = useRef(null);
  const [tree, setTree] = useState([]);
  const [selected, setSelected] = useState(null);
  const [docsCount, setDocsCount] = useState(0);
  const [newName, setNewName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [connectionDrag, setConnectionDrag] = useState(null);
  const [savingConnection, setSavingConnection] = useState(false);

  const diagramNodes = useMemo(() => layoutTree(tree), [tree]);
  const maxDepth = diagramNodes.reduce((max, item) => Math.max(max, item.depth), 0);
  const maxX = diagramNodes.reduce((max, item) => Math.max(max, item.x), 0);
  const diagramWidth = Math.max(32, maxX * NODE_STEP_X + NODE_WIDTH + 4);
  const diagramHeight = Math.max(15, (maxDepth + 1) * NODE_STEP_Y + NODE_HEIGHT);
  const remSize = Number.parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  ) || 16;

  async function loadTree() {
    const data = await GetListOfCategories();
    setTree(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTree();
  }, []);

  async function loadDocsCount(name) {
    if (!name) {
      setDocsCount(0);
      return;
    }
    const data = await GetDocsFromCategory(name);
    setDocsCount(Array.isArray(data) ? data.length : 0);
  }

  function handleSelect(node) {
    setSelected(node);
    loadDocsCount(node.name);
  }

  function updateDragPosition(clientX, clientY) {
    const rect = diagramRef.current?.getBoundingClientRect();
    if (!rect) return;
    setConnectionDrag((current) =>
      current
        ? { ...current, x: clientX - rect.left, y: clientY - rect.top }
        : current,
    );
  }

  useEffect(() => {
    if (!connectionDrag) return undefined;

    const handlePointerMove = (event) => updateDragPosition(event.clientX, event.clientY);
    const handlePointerUp = async (event) => {
      const target = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest("[data-category-node]");
      const targetName = target?.dataset.categoryNode;
      const sourceName = connectionDrag.source;
      setConnectionDrag(null);

      if (
        !targetName ||
        targetName === sourceName ||
        (targetName !== ROOT_KEY && isDescendant(tree, sourceName, targetName))
      ) {
        return;
      }

      setSavingConnection(true);
      try {
        await UpdateCategory(sourceName, "", targetName === ROOT_KEY ? null : targetName);
        await loadTree();
        if (selected?.name === sourceName) {
          setSelected((current) => (current ? { ...current, parent: targetName === ROOT_KEY ? null : targetName } : current));
        }
      } catch (error) {
        console.error(error);
        alert("카테고리 연결 변경에 실패했습니다.");
      } finally {
        setSavingConnection(false);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [connectionDrag, selected, tree]);

  function handlePortPointerDown(event, source) {
    event.preventDefault();
    event.stopPropagation();
    const rect = diagramRef.current?.getBoundingClientRect();
    if (!rect) return;
    setConnectionDrag({
      source,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }

  async function handleCreate(event) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;

    try {
      await CreateCategory(name, null);
      setNewName("");
      setShowCreateForm(false);
      await loadTree();
    } catch (error) {
      console.error(error);
      alert("카테고리 생성에 실패했습니다.");
    }
  }

  async function handleDelete() {
    if (!selected || !window.confirm(`${selected.name} 카테고리를 삭제하시겠습니까?`)) return;

    try {
      await DeleteCategory(selected.name);
      setSelected(null);
      await loadTree();
    } catch (error) {
      console.error(error);
      alert("카테고리 삭제에 실패했습니다.");
    }
  }

  const edgePaths = diagramNodes
    .filter((item) => item.parentKey)
    .map((item) => {
      const parent = diagramNodes.find((candidate) => candidate.key === item.parentKey);
      const startX = parent.x * NODE_STEP_X + NODE_WIDTH / 2;
      const startY = parent.depth * NODE_STEP_Y + NODE_HEIGHT;
      const endX = item.x * NODE_STEP_X + NODE_WIDTH / 2;
      const endY = item.depth * NODE_STEP_Y;
      const middleY = (startY + endY) / 2;
      return `M ${startX} ${startY} C ${startX} ${middleY}, ${endX} ${middleY}, ${endX} ${endY}`;
    });

  return (
    <section className="category-editor">
      <div className="diagram-panel">
        <div className="diagram-panel__header">
          <div>
            <p className="diagram-eyebrow">CATEGORY STRUCTURE</p>
            <h2>카테고리 트리</h2>
            <p className="diagram-help">상단 연결점을 드래그해 부모 정점에 놓으세요.</p>
          </div>
          <button
            type="button"
            className="diagram-add-button"
            onClick={() => setShowCreateForm((current) => !current)}
            aria-label="루트 카테고리 추가"
            title="루트에 새 정점 추가"
          >
            +
          </button>
        </div>

        {showCreateForm && (
          <form className="diagram-create-form" onSubmit={handleCreate}>
            <label htmlFor="new-category-name">새 루트 정점</label>
            <input
              id="new-category-name"
              value={newName}
              placeholder="카테고리 이름"
              onChange={(event) => setNewName(event.target.value)}
              autoFocus
            />
            <button type="submit">생성</button>
          </form>
        )}

        <div className="diagram-scroll-area">
          <div
            className="diagram-stage"
            ref={diagramRef}
            style={{ width: `${diagramWidth}rem`, height: `${diagramHeight}rem` }}
          >
            <svg className="diagram-edges" viewBox={`0 0 ${diagramWidth} ${diagramHeight}`} aria-hidden="true">
              {edgePaths.map((path, index) => <path key={`${path}-${index}`} d={path} />)}
              {connectionDrag && (
                (() => {
                  const source = diagramNodes.find((item) => item.key === connectionDrag.source);
                  if (!source) return null;
                  return (
                    <line
                      className="diagram-edge--draft"
                      x1={source.x * NODE_STEP_X + NODE_WIDTH / 2}
                      y1={source.depth * NODE_STEP_Y}
                      x2={connectionDrag.x / remSize}
                      y2={connectionDrag.y / remSize}
                    />
                  );
                })()
              )}
            </svg>
            {diagramNodes.map((item) => (
              <DiagramNode
                key={item.key}
                item={item}
                selected={selected?.name === item.key}
                onSelect={handleSelect}
                onPortPointerDown={handlePortPointerDown}
              />
            ))}
          </div>
        </div>
        {savingConnection && <p className="diagram-status">연결을 저장하는 중...</p>}
      </div>

      <aside className="category-inspector">
        <p className="diagram-eyebrow">INSPECTOR</p>
        <h2>정점 정보</h2>
        {selected ? (
          <>
            <div className="inspector-name">{selected.name}</div>
            <dl className="inspector-list">
              <div><dt>부모</dt><dd>{selected.parent ?? "Root"}</dd></div>
              <div><dt>자식</dt><dd>{selected.children?.length ?? 0}개</dd></div>
              <div><dt>문서</dt><dd>{docsCount}개</dd></div>
            </dl>
            <button
              type="button"
              className="inspector-link"
              onClick={() => navigate(`/wiki/${encodeURIComponent(selected.name)}`)}
            >
              이 카테고리 문서 보기
            </button>
            <button type="button" className="inspector-delete" onClick={handleDelete}>
              정점 삭제
            </button>
          </>
        ) : (
          <p className="inspector-empty">도식도의 정점을 선택하면 상세 정보가 표시됩니다.</p>
        )}
      </aside>
    </section>
  );
}
