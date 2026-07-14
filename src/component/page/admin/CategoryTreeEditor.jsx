import { useEffect, useState } from "react";
import {
    GetListOfCategories,
    CreateCategory,
    DeleteCategory,
} from "../../util/TagCategoryAPI";
import "./CategoryTreeEditor.css";

/*

목적: 카테고리 트리 편집기 컴포넌트

사용법: <CategoryTreeEditor /> 
주의사항: AdminPage에만 넣을 것. 관리자 권한을 가진 사용자로 로그인해야 사용 가능

*/




function TreeNode({
    node,
    level = 0,
    selected,
    onSelect,
}) {
    const [open, setOpen] = useState(true);

    return (
        <>
            <div
                className={`tree-row ${selected === node.name ? "selected" : ""
                    }`}
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

                <span className="tree-name">
                    {node.name}
                </span>
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
    const [tree, setTree] = useState([]);
    const [selected, setSelected] = useState(null);

    const [newName, setNewName] = useState("");
    const [parent, setParent] = useState("");

    async function loadTree() {
        const data = await GetListOfCategories();

        if (data) {
            setTree(data);
        }
    }

    useEffect(() => {
        loadTree();
    }, []);

    function flatten(nodes) {
        let arr = [];

        for (const node of nodes) {
            arr.push(node);

            if (node.children?.length) {
                arr = arr.concat(flatten(node.children));
            }
        }

        return arr;
    }

    const allCategories = flatten(tree);

    async function handleCreate() {
        if (!newName.trim()) return;

        try {
            await CreateCategory(
                newName,
                parent === "" ? null : parent
            );

            setNewName("");
            await loadTree();
        } catch (e) {
            console.error(e);
            alert("카테고리 생성 실패");
        }
    }

    async function handleDelete() {

        if (!selected) return;


        const confirmDelete =
            window.confirm(
                `${selected.name} 카테고리를 삭제하시겠습니까?`
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
                    className={`tree-row ${selected === null ? "selected" : ""
                        }`}
                    onClick={() => {
                        setSelected(null);
                        setParent("");
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
                            <b>부모</b> :{" "}
                            {selected.parent ?? "Root"}
                        </p>

                        <p>
                            <b>자식</b> :{" "}
                            {selected.children?.length ?? 0}개
                        </p>

                        <button disabled>
                            이름 변경 (구현 예정)
                        </button>

                        <button disabled>
                            부모 변경 (구현 예정)
                        </button>

                        <button
                            onClick={handleDelete}
                        >
                            삭제
                        </button>
                    </>
                ) : (
                    <p>Root 선택됨</p>
                )}

                <hr />

                <h3>새 카테고리 생성</h3>

                <div className="category-create-form">

                    <div className="form-group">
                        <label>
                            이름
                        </label>

                        <input
                            value={newName}
                            placeholder="카테고리 이름"
                            onChange={(e) =>
                                setNewName(e.target.value)
                            }
                        />
                    </div>


                    <div className="form-group">
                        <label>
                            부모
                        </label>

                        <select
                            value={parent}
                            onChange={(e) =>
                                setParent(e.target.value)
                            }
                        >
                            <option value="">
                                Root (null)
                            </option>

                            {allCategories.map((c) => (
                                <option
                                    key={c.name}
                                    value={c.name}
                                >
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>


                <button
                    className="create-button"
                    onClick={handleCreate}
                >
                    생성
                </button>
            </div>
        </div>
    );
}