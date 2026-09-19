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
        const isEvent = Boolean(item.event_type);
        const version = item.version_number ?? item.version ?? item.rev ?? index + 1;
        const versionText = String(version);
        const documentTitle = item.document_title || item.wiki_doc_title || item.title || item.docTitle;
        const eventTitle = item.event_type === 'rename' ? '제목 변경' : '삭제';
        const displayTitle = isEvent ? `${eventTitle} · ${documentTitle}` : documentTitle || '문서 제목 없음';
        const date = formatEditDate(
          item.updated_at ?? item.date ?? item.createdAt ?? item.updatedAt,
        );
        const linkPath = documentTitle && !item.deleted
          ? getDocumentPath(documentTitle)
          : null;
        const itemKey = isEvent ? `event-${item.id}` : (
          documentTitle
            ? `${documentTitle}-${versionText}`
            : `document-${index}`
        );

        const content = (
          <>
            <div className="editListLeft">
              <span className="versionBadge">
                {isEvent ? (item.event_type === 'rename' ? '제목' : '삭제') :
                  (versionText.startsWith('v') ? versionText : `v${versionText}`)}
              </span>
              <div className="editListInfo">
                <span className="editListTitle">{displayTitle}</span>
                {item.event_type === 'rename' && <span className="editListDate">{item.old_title} → {item.new_title}</span>}
                <span className="editListDate">{date}</span>
              </div>
            </div>
            {linkPath && <FiChevronRight className="editListArrow" />}
          </>
        );

        return (
          <li key={itemKey} className="editListItem">
            {linkPath ? <Link to={linkPath} className="editListLink">{content}</Link> :
              <div className="editListLink">{content}</div>}
          </li>
        );
      })}
    </ul>
  );
}

export default EditList;
