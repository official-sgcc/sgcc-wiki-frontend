import { Link } from 'react-router-dom'
import './EditList.css'

function formatDate(dateString) {
  if (!dateString) {
    return '날짜미상'
  }

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return '날짜미상'
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

function getEditTitle(edit) {
  return edit?.wiki_doc_title || edit?.title || edit?.documentTitle || '제목 없음'
}

function EditList({ edits = [] }) {
  if (!Array.isArray(edits) || edits.length === 0) {
    return (
      <section className="editList">
        <h2 className="editListTitle">편집 목록</h2>
        <p className="editListEmpty">아직 편집 기록이 없습니다.</p>
      </section>
    )
  }

  return (
    <section className="editList">
      <h2 className="editListTitle">편집 목록</h2>
      <ul className="editListItems">
        {edits.map((edit, index) => {
          const title = getEditTitle(edit)
          const versionNumber = edit?.version_number || edit?.versionNumber

          return (
            <li className="editListItem" key={`${title}-${versionNumber || index}`}>
              <Link className="editListLink" to={`/wiki/detail/${title}`}>
                {title}
              </Link>
              <div className="editListMeta">
                {versionNumber && <span>v{versionNumber}</span>}
                <span>{formatDate(edit?.updated_at || edit?.updatedAt)}</span>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default EditList
