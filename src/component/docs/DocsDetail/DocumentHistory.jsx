import { useEffect, useState } from "react";
import { FiArrowLeft, FiClock, FiUser } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import NotFound from "../../ui/NotFound";
import {
  formatDate,
  GetDocsVersion,
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

export default function DocumentHistory() {
  const { title, versionNumber } = useParams();
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);

  useEffect(() => {
    let isActive = true;

    async function fetchHistory() {
      setLoading(true);
      setErrorStatus(null);
      setSelectedVersion(null);
      setVersions([]);

      try {
        if (versionNumber) {
          const version = await GetDocsVersion(title, versionNumber);
          if (isActive) setSelectedVersion(version);
        } else {
          const data = await GetDocsVersions(title);
          if (isActive) setVersions(Array.isArray(data) ? [...data].reverse() : []);
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

  if (selectedVersion) {
    const version = getVersionNumber(selectedVersion);

    return (
      <article className="document-history document-history--detail">
        <Link className="document-history__back" to={`/wiki/detail/${encodedTitle}/history`}>
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

        <section className="document-history__content">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {normalizeMarkdown(selectedVersion.content)}
          </ReactMarkdown>
        </section>
      </article>
    );
  }

  return (
    <article className="document-history">
      <Link className="document-history__back" to={`/wiki/detail/${encodedTitle}`}>
        <FiArrowLeft aria-hidden="true" />
        문서로 돌아가기
      </Link>

      <header className="document-history__header">
        <div>
          <p className="document-history__eyebrow">DOCUMENT HISTORY</p>
          <h1>{title} 수정 기록</h1>
        </div>
        <span className="document-history__count">{versions.length}개 버전</span>
      </header>

      {versions.length > 0 ? (
        <ol className="document-history__list">
          {versions.map((version) => {
            const number = getVersionNumber(version);

            return (
              <li key={number}>
                <Link
                  className="document-history__item"
                  to={`/wiki/detail/${encodedTitle}/history/${number}`}
                >
                  <span className="document-history__badge">v{number}</span>
                  <span className="document-history__item-info">
                    <strong>버전 {number}</strong>
                    <span>
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
