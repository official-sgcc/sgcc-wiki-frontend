import { useEffect, useState } from "react";
import { GetTagList, DeleteTag } from "../../util/TagCategoryAPI";
import AlertModal from "../../ui/Alert";
import "./TagManager.css";

export default function TagManager() {
    const [tags, setTags] = useState([]);
    const [alert, setAlert] = useState({
        open: false,
        type: "confirm",
        color: "red",
        title: "",
        content: "",
        onConfirm: () => { },
    });

    async function loadTags() {
        try {
            const data = await GetTagList();
            setTags(data ?? []);
        } catch (e) {
            console.error(e);
            setTags([]);
        }
    }

    useEffect(() => {
        loadTags();
    }, []);

    function handleDelete(name) {
        setAlert({
            open: true,
            type: "confirm",
            color: "red",
            title: "태그 삭제",
            content: `#${name} 태그를 삭제하시겠습니까?`,
            onConfirm: async () => {
                try {
                    await DeleteTag(name);
                    await loadTags();
                } catch (e) {
                    console.error(e);
                    alert("태그 삭제 실패");
                } finally {
                    setAlert(prev => ({
                        ...prev,
                        open: false,
                    }));
                }
            },
        });
    }

    return (
        <>
            {alert.open && (
                <AlertModal
                    type={alert.type}
                    color={alert.color}
                    title={alert.title}
                    content={alert.content}
                    onConfirm={alert.onConfirm}
                    onClose={() =>
                        setAlert(prev => ({
                            ...prev,
                            open: false,
                        }))
                    }
                />
            )}
            <div className="tag-manager">
                <div className="tag-panel">
                    <h2>태그 관리</h2>

                    <div className="tag-list">
                        {tags.length === 0 ? (
                            <p className="tag-empty">
                                등록된 태그가 없습니다.
                            </p>
                        ) : (
                            tags.map(tag => (
                                <div
                                    key={tag.name}
                                    className="tag-item"
                                >
                                    <span className="tag-name">
                                        #{tag.name}
                                    </span>

                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(tag.name)}
                                    >
                                        삭제
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}