"use client";

import { useState, useMemo } from "react";
import { Notice } from "../../lib/api";

interface NoticeBoardTableProps {
  initialNotices: Notice[];
}

export default function NoticeBoardTable({ initialNotices }: NoticeBoardTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter notices based on search
  const filteredNotices = useMemo(() => {
    if (!searchTerm.trim()) return initialNotices;
    const term = searchTerm.toLowerCase().trim();
    return initialNotices.filter(
      (notice) =>
        notice.title.toLowerCase().includes(term) ||
        (notice.date &&
          new Date(notice.date)
            .toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
            .includes(term))
    );
  }, [initialNotices, searchTerm]);

  // Pagination calculation
  const totalEntries = filteredNotices.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);

  const startIndex = (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const currentEntries = useMemo(() => {
    return filteredNotices.slice(startIndex, endIndex);
  }, [filteredNotices, startIndex, endIndex]);

  // Check if notice is recent (within 15 days)
  const isRecentNotice = (dateStr?: string) => {
    if (!dateStr) return false;
    const noticeDate = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffDays = (now - noticeDate) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 15;
  };

  // Format date to DD-MM-YYYY
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "---";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "---";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Generate pagination page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (validPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (validPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", validPage - 1, validPage, validPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="noticeBoardWrapper">
      {/* Search and Entries Control Toolbar */}
      <div className="tableControls">
        <div className="entriesSelect">
          <label htmlFor="entries-count">Show</label>
          <select
            id="entries-count"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>entries</span>
        </div>

        <div className="searchBox">
          <label htmlFor="notice-search">Search:</label>
          <input
            id="notice-search"
            type="text"
            placeholder="Search by title or date..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Main Table Matching Reference Image */}
      <div className="tableResponsive">
        <table className="noticeTable">
          <thead>
            <tr>
              <th className="colTitle">Title</th>
              <th className="colDate">Date</th>
              <th className="colLink">Website Link</th>
              <th className="colDownload">Download</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.length > 0 ? (
              currentEntries.map((notice) => {
                const isNew = isRecentNotice(notice.date);
                return (
                  <tr key={notice._id}>
                    <td className="cellTitle">
                      <span className="noticeTitleText">{notice.title}</span>
                      {isNew && (
                        <span className="newBurstBadge" title="Recently Published">
                          <span className="newBurstInner">NEW</span>
                        </span>
                      )}
                    </td>
                    <td className="cellDate">{formatDate(notice.date)}</td>
                    <td className="cellLink">
                      {notice.websiteLink ? (
                        <a
                          href={notice.websiteLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="externalLink"
                          title="Visit official link"
                        >
                          Visit Link ↗
                        </a>
                      ) : (
                        <span className="emptyHyphen">---</span>
                      )}
                    </td>
                    <td className="cellDownload">
                      {notice.pdf?.url ? (
                        <a
                          href={notice.pdf.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="downloadBtnLink"
                          title={`Download ${notice.title} (PDF)`}
                        >
                          <svg
                            className="downloadIcon"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          <span className="downloadLabel">file_download</span>
                        </a>
                      ) : (
                        <span className="emptyHyphen">---</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="noRecords">
                  No notices found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Status Footer */}
      <div className="tableFooter">
        <div className="entriesInfo">
          {totalEntries > 0
            ? `Showing ${startIndex + 1} to ${endIndex} of ${totalEntries} entries`
            : "Showing 0 to 0 of 0 entries"}
        </div>

        {totalPages > 1 && (
          <div className="paginationControls">
            <button
              type="button"
              className="pageBtn navBtn"
              disabled={validPage === 1}
              onClick={() => handlePageChange(validPage - 1)}
            >
              Previous
            </button>

            {getPageNumbers().map((p, idx) =>
              typeof p === "number" ? (
                <button
                  type="button"
                  key={idx}
                  className={`pageBtn ${validPage === p ? "active" : ""}`}
                  onClick={() => handlePageChange(p)}
                >
                  {p}
                </button>
              ) : (
                <span key={idx} className="pageEllipsis">
                  ...
                </span>
              )
            )}

            <button
              type="button"
              className="pageBtn navBtn"
              disabled={validPage === totalPages}
              onClick={() => handlePageChange(validPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .noticeBoardWrapper {
          width: 100%;
          background: #ffffff;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .tableControls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          background: #fafbfc;
          flex-wrap: wrap;
          gap: 12px;
        }

        .entriesSelect {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
        }

        .entriesSelect select {
          padding: 6px 10px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #ffffff;
          color: #1f2937;
          font-size: 14px;
          cursor: pointer;
          outline: none;
        }

        .searchBox {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
        }

        .searchBox input {
          padding: 7px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          min-width: 220px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .searchBox input:focus {
          border-color: #003366;
          box-shadow: 0 0 0 3px rgba(0, 51, 102, 0.12);
        }

        .tableResponsive {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .noticeTable {
          width: 100%;
          border-collapse: collapse;
          font-family: inherit;
        }

        .noticeTable thead {
          background: #003366; /* ODMM Theme Navy Blue matching reference */
        }

        .noticeTable th {
          color: #ffffff;
          font-weight: 700;
          font-size: 15px;
          padding: 14px 16px;
          text-align: left;
          letter-spacing: 0.3px;
          border-right: 1px solid rgba(255, 255, 255, 0.2);
        }

        .noticeTable th:last-child {
          border-right: none;
        }

        .colTitle {
          width: 60%;
        }

        .colDate {
          width: 14%;
          text-align: center !important;
        }

        .colLink {
          width: 13%;
          text-align: center !important;
        }

        .colDownload {
          width: 13%;
          text-align: center !important;
        }

        .noticeTable tbody tr {
          border-bottom: 1px solid #e5e7eb;
          transition: background 0.15s ease;
        }

        .noticeTable tbody tr:hover {
          background: #f8fafc;
        }

        .noticeTable td {
          padding: 14px 16px;
          font-size: 14.5px;
          color: #1f2937;
          vertical-align: middle;
          border-right: 1px solid #f1f5f9;
        }

        .noticeTable td:last-child {
          border-right: none;
        }

        .cellTitle {
          line-height: 1.5;
        }

        .noticeTitleText {
          color: #1f2937;
          font-weight: 500;
        }

        /* NEW Badge starburst effect matching reference */
        .newBurstBadge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-left: 8px;
          vertical-align: middle;
          animation: pulseBurst 1.8s infinite ease-in-out;
        }

        .newBurstInner {
          background: linear-gradient(135deg, #d71920 0%, #b30f16 100%);
          color: #ffffff;
          font-size: 10px;
          font-weight: 900;
          padding: 2px 7px;
          border-radius: 4px;
          box-shadow: 0 0 6px rgba(215, 25, 32, 0.5);
          letter-spacing: 0.5px;
          border: 1px solid #f2c94c;
          text-transform: uppercase;
        }

        @keyframes pulseBurst {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        .cellDate {
          text-align: center;
          color: #374151;
          font-weight: 500;
          white-space: nowrap;
        }

        .cellLink {
          text-align: center;
        }

        .externalLink {
          color: #003366;
          font-weight: 600;
          text-decoration: underline;
          transition: color 0.15s;
        }

        .externalLink:hover {
          color: #d71920;
        }

        .cellDownload {
          text-align: center;
        }

        .downloadBtnLink {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #003366;
          font-style: italic;
          font-size: 14px;
          text-decoration: underline;
          transition: color 0.15s;
          font-weight: 500;
        }

        .downloadBtnLink:hover {
          color: #d71920;
        }

        .downloadIcon {
          width: 15px;
          height: 15px;
        }

        .emptyHyphen {
          color: #9ca3af;
          font-weight: 600;
        }

        .noRecords {
          text-align: center;
          padding: 40px !important;
          color: #6b7280;
          font-size: 15px;
          font-style: italic;
        }

        /* Footer Pagination */
        .tableFooter {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: #ffffff;
          border-top: 1px solid #e5e7eb;
          flex-wrap: wrap;
          gap: 12px;
        }

        .entriesInfo {
          font-size: 14px;
          color: #4b5563;
        }

        .paginationControls {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .pageBtn {
          min-width: 34px;
          height: 34px;
          padding: 0 10px;
          border: 1px solid #d1d5db;
          background: #ffffff;
          color: #374151;
          font-size: 14px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .pageBtn:hover:not(:disabled) {
          border-color: #003366;
          color: #003366;
          background: #f0f7ff;
        }

        .pageBtn.active {
          background: #003366;
          border-color: #003366;
          color: #ffffff;
          font-weight: 700;
        }

        .pageBtn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .navBtn {
          padding: 0 12px;
        }

        .pageEllipsis {
          padding: 0 6px;
          color: #6b7280;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .noticeTable {
            min-width: 650px;
          }

          .tableControls {
            flex-direction: column;
            align-items: stretch;
          }

          .searchBox input {
            width: 100%;
          }

          .tableFooter {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
