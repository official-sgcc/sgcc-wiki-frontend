import { useEffect, useState } from "react";
import { FiArrowLeft, FiClock, FiUser } from "react-icons/fi";
import { Link, useParams, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { markdownRehypePlugins } from "../../util/MarkdownSecurity";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import NotFound from "../../ui/NotFound";
import {
  formatDate,
  GetDocsDiff,
  GetDocsHistoryEvents,
  GetDocsVersions,
} from "../../util/DocsAPI";
import "./DocumentHistory.css";

function normalizeMarkdown(content) {
  if (typeof content !== "string") return "";

  const fencedDocument = content.match(
    /^\s*```(?:markdown|md)?\s*\n([\s\S]*?)\n```\s*$/i,
  );

  return fencedDocument ? fencedDocument[1] : content;
}

function getVersionNumber(version) {
  return version.version_number ?? version.version ?? version.rev;
}

function getCategoryName(category) {
  return typeof category === "string" ? category : category?.name;
}

function getTagNames(tags) {
  return new Set(tags.map((tag) => typeof tag === "string" ? tag : tag?.name).filter(Boolean));
}

function describeChanges(version, previousVersion) {
  if (!previousVersion) {
    return [{ title: getVersionNumber(version) === 1 ? "문서 생성" : "이전 버전 없음" }];
  }

  const changes = [];
  if (version.content !== previousVersion.content) changes.push({ title: "본문 변경" });

  const previousCategory = getCategoryName(previousVersion.category);
  const currentCategory = getCategoryName(version.category);
  if (previousCategory && currentCategory && previousCategory !== currentCategory) {
    changes.push({ title: "위치 이동", detail: `${previousCategory} → ${currentCategory}` });
  }

  // 태그 스냅샷 자체가 누락된 버전은 변경 여부를 추정하지 않는다.
  if (Array.isArray(version.tags) && Array.isArray(previousVersion.tags)) {
    const oldTags = getTagNames(previousVersion.tags);
    const newTags = getTagNames(version.tags);
    const added = [...newTags].filter((tag) => !oldTags.has(tag));
    const removed = [...oldTags].filter((tag) => !newTags.has(tag));
    if (added.length || removed.length) {
      changes.push({
        title: "태그 변경",
        detail: [
          added.length ? `추가 ${added.map((tag) => `#${tag}`).join(", ")}` : null,
          removed.length ? `제거 ${removed.map((tag) => `#${tag}`).join(", ")}` : null,
        ].filter(Boolean).join(" · "),
      });
    }
  }

  return changes.length ? changes : [{ title: "변경 내역 없음" }];
}

export default function DocumentHistory() {
  const { title: pathTitle, versionNumber: pathVersionNumber } = useParams();
  const [searchParams] = useSearchParams();
  const title = searchParams.get("title") ?? pathTitle;
  const versionNumber = searchParams.get("version") ?? pathVersionNumber;
  const [versions, setVersions] = useState([]);
  const [events, setEvents] = useState([]);
  const [contentDiff, setContentDiff] = useState(null);
  const [showDiff, setShowDiff] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);

  useEffect(() => {
    let isActive = true;

    async function fetchHistory() {
      setLoading(true);
      setErrorStatus(null);
      setVersions([]);
      setEvents([]);
      setContentDiff(null);
      setShowDiff(true);

      try {
        const [data, historyEvents, diff] = await Promise.all([
          GetDocsVersions(title),
          GetDocsHistoryEvents(title),
          versionNumber && Number(versionNumber) > 1
            ? GetDocsDiff(title, versionNumber).catch(() => null)
            : Promise.resolve(null),
        ]);
        if (isActive) {
          setVersions(Array.isArray(data)
            ? [...data].sort((a, b) => getVersionNumber(b) - getVersionNumber(a))
            : []);
          setEvents(Array.isArray(historyEvents) ? historyEvents : []);
          setContentDiff(Array.isArray(diff) && diff.some(([operation]) => operation !== 0)
            ? diff
            : null);
        }
      } catch (error) {
        if (isActive) setErrorStatus(error.response?.status ?? 500);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    fetchHistory();
    return () => {
      isActive = false;
    };
  }, [title, versionNumber]);

  if (loading) {
    return <NotFound status={0} message="버전 기록을 불러오는 중 . . ." />;
  }

  if (errorStatus) {
    return <NotFound status={errorStatus} message="버전 기록을 찾을 수 없습니다" />;
  }

  const encodedTitle = encodeURIComponent(title);
  const selectedIndex = versionNumber
    ? versions.findIndex((version) => String(getVersionNumber(version)) === String(versionNumber))
    : -1;
  const selectedVersion = versions[selectedIndex];
  const historyItems = [
    ...versions.map((version, index) => ({ kind: "version", version, index, updated_at: version.updated_at })),
    ...events.map((event) => ({ kind: "event", event, updated_at: event.updated_at })),
  ].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  if (versionNumber && !selectedVersion) {
    return <NotFound status={404} message="버전 기록을 찾을 수 없습니다" />;
  }

  if (selectedVersion) {
    const version = getVersionNumber(selectedVersion);
    const changes = describeChanges(selectedVersion, versions[selectedIndex + 1]);
    const showBody = changes.some((change) =>
      ["본문 변경", "문서 생성", "이전 버전 없음"].includes(change.title));

    return (
      <article className="document-history document-history--detail">
        <Link className="document-history__back" to={`/wiki/history?title=${encodedTitle}`}>
          <FiArrowLeft aria-hidden="true" />
          버전 목록으로
        </Link>

        <header className="document-history__header">
          <div>
            <p className="document-history__eyebrow">DOCUMENT HISTORY</p>
            <h1>{title}</h1>
          </div>
          <span className="document-history__version">v{version}</span>
        </header>

        <div className="document-history__meta">
          <span><FiUser aria-hidden="true" /> {selectedVersion.updated_by ?? "알 수 없음"}</span>
          <span><FiClock aria-hidden="true" /> {formatDate(selectedVersion.updated_at)}</span>
        </div>

        <div className="document-history__changes" aria-label="변경 내용">
          {changes.map((change) => (
            <span key={change.title}>
              <strong>{change.title}</strong>
              {change.detail && <small>{change.detail}</small>}
            </span>
          ))}
        </div>

        {showBody && contentDiff && (
          <div className="document-history__view-switch" aria-label="본문 표시 방식">
            <button type="button" aria-pressed={showDiff} onClick={() => setShowDiff(true)}>raw</button>
            <button type="button" aria-pressed={!showDiff} onClick={() => setShowDiff(false)}>v{version}</button>
          </div>
        )}

        {showBody && contentDiff && showDiff ? (
          <section className="document-history__diff" aria-label="이전 버전과 비교한 본문">
            <pre>{contentDiff.map(([operation, value], index) => (
              <span key={index} className={operation === 1 ? "document-history__added" : operation === -1 ? "document-history__removed" : undefined}>
                {value}
              </span>
            ))}</pre>
          </section>
        ) : showBody ? (
          <section className="document-history__content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={markdownRehypePlugins.concat(rehypeKatex)}
            >
              {normalizeMarkdown(selectedVersion.content)}
            </ReactMarkdown>
          </section>
        ) : null}
      </article>
    );
  }

  return (
    <article className="document-history">
      <Link className="document-history__back" to={`/wiki/detail?title=${encodedTitle}`}>
        <FiArrowLeft aria-hidden="true" />
        문서로 돌아가기
      </Link>

      <header className="document-history__header">
        <div>
          <p className="document-history__eyebrow">DOCUMENT HISTORY</p>
          <h1>{title} 수정 기록</h1>
        </div>
        <span className="document-history__count">{historyItems.length}개 기록</span>
      </header>

      {historyItems.length > 0 ? (
        <ol className="document-history__list">
          {historyItems.map((item) => {
            if (item.kind === "event") {
              const { event } = item;
              return (
                <li key={`event-${event.id}`} className="document-history__item document-history__item--event">
                  <span className="document-history__badge">기록</span>
                  <span className="document-history__item-info">
                    <strong>{event.event_type === "rename" ? "제목 변경" : "삭제"}</strong>
                    {event.event_type === "rename" && (
                      <span className="document-history__item-changes">{event.old_title} → {event.new_title}</span>
                    )}
                    <span className="document-history__item-meta">
                      {event.updated_by ?? "알 수 없음"} · {formatDate(event.updated_at)}
                    </span>
                  </span>
                </li>
              );
            }
            const { version, index } = item;
            const number = getVersionNumber(version);
            const changes = describeChanges(version, versions[index + 1]);

            return (
              <li key={number}>
                <Link
                  className="document-history__item"
                  to={`/wiki/history?title=${encodedTitle}&version=${number}`}
                >
                  <span className="document-history__badge">v{number}</span>
                  <span className="document-history__item-info">
                    <strong>{changes.map((change) => change.title).join(" · ")}</strong>
                    {changes.some((change) => change.detail) && (
                      <span className="document-history__item-changes">
                        {changes.map((change) => change.detail).filter(Boolean).join(" · ")}
                      </span>
                    )}
                    <span className="document-history__item-meta">
                      {version.updated_by ?? "알 수 없음"} · {formatDate(version.updated_at)}
                    </span>
                  </span>
                  <FiArrowLeft className="document-history__item-arrow" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="document-history__empty">버전 기록이 없습니다.</p>
      )}
    </article>
  );
}
