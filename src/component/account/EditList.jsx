import React from 'react'
import { FiChevronRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import './EditList.css'

function EditList({ edits = [] }) {
  if (!edits || edits.length === 0) {
    return <div className="editListEmpty">편집 내역이 없습니다.</div>;
  }

  return (
    <ul className="editListItems">
      {edits.map((item, index) => {
        const version = item.version || item.rev || `v${index + 1}`;
        const title = item.title || item.docTitle || item.document_title || '문서 제목';
        const date = item.date || item.createdAt || item.updatedAt || '2026.08.18';
        const linkPath = item.docId ? `/wiki/${item.docId}` : '#';

        return (
          <li key={item.id || index} className="editListItem">
            <Link to={linkPath} className="editListLink">
              <div className="editListLeft">
                <span className="versionBadge">{version.startsWith('v') ? version : `v${version}`}</span>
                <div className="editListInfo">
                  <span className="editListTitle">{title}</span>
                  <span className="editListDate">{date}</span>
                </div>
              </div>
              <FiChevronRight className="editListArrow" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default EditList;