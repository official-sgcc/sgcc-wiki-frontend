import React from 'react'
import { FiChevronRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import './EditList.css'
import { getDocumentPath } from '../util/DocsAPI'

function formatEditDate(value) {
  if (!value) {
    return '날짜 정보 없음';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function EditList({ edits = [] }) {
  if (!edits || edits.length === 0) {
    return <div className="editListEmpty">편집 내역이 없습니다.</div>;
  }

  return (
    <ul className="editListItems">
      {edits.map((item, index) => {
        const version = item.version_number ?? item.version ?? item.rev ?? index + 1;
        const versionText = String(version);
        const documentTitle = item.wiki_doc_title || item.title || item.docTitle || item.document_title;
        const displayTitle = documentTitle || '문서 제목 없음';
        const date = formatEditDate(
          item.updated_at ?? item.date ?? item.createdAt ?? item.updatedAt,
        );
        const linkPath = documentTitle
          ? getDocumentPath(documentTitle)
          : '#';
        const itemKey = item.id ?? (
          documentTitle
            ? `${documentTitle}-${versionText}`
            : `document-${index}`
        );

        return (
          <li key={itemKey} className="editListItem">
            <Link to={linkPath} className="editListLink">
              <div className="editListLeft">
                <span className="versionBadge">
                  {versionText.startsWith('v') ? versionText : `v${versionText}`}
                </span>
                <div className="editListInfo">
                  <span className="editListTitle">{displayTitle}</span>
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
