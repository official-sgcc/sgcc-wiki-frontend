import { useNavigate } from "react-router-dom";

/*

사용법: <DocsList docsdata={(여기에다가 서버에서 넘어온 response 형식 그대로 넣어주면 됨)} />

클릭 시 해당 문서로 연결되는 것 까지 작성 완료

*/



function formatDate(dateString) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export default function DocsList({ docsdata = [] }) {
  const navigate = useNavigate();

  return (
    <>
      {docsdata.length > 0 ? (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            width: "100%",
          }}
        >
          {docsdata.map((post) => (
            <li
              key={post.title}
              style={{
                textAlign: "left",
                borderBottom: "1px solid #eee",
                padding: "20px 10px",
                cursor: "pointer",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
              }}
              onClick={() =>
                navigate(`/wiki/detail/${post.title}`)
              }
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  color: "#007bff",
                  fontSize: "1.2rem",
                }}
              >
                {post.title}
              </h3>

              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#888",
                }}
              >
                <span>{formatDate(post.updated_at)}</span>
                <span style={{ margin: "0 10px" }}>|</span>
                <span>{post.created_by}</span>
                <span style={{ margin: "0 10px" }}>|</span>
                <span>
                  {post.category?.name ?? "카테고리 없음"}
                </span>
              </div>

              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                {post.tags?.map((tag) => (
                  <span
                    key={tag.name}
                    style={{
                      background: "#f3f3f3",
                      padding: "4px 8px",
                      borderRadius: "999px",
                      fontSize: "0.8rem",
                    }}
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p
          style={{
            color: "#666",
            textAlign: "center",
            marginTop: "50px",
          }}
        >
          등록된 게시글이 없습니다.
        </p>
      )}
    </>
  );
}