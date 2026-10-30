"use client";

import { useEffect, useState } from "react";
import SearchInput from "./SearchInput";

type NoticeItem = {
  _id: string;
  title: string;
  pdf: {
    url: string;
    key: string;
  };
  date: string;
  websiteLink?: string;
  isActive: boolean;
  createdAt?: string;
};

export default function NoticeBoardSection() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [websiteLink, setWebsiteLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      // Pass all=true and limit=100 so admin can see active and inactive notices
      const res = await fetch(`${API_URL}/api/notices?all=true&limit=100`);
      const data = await res.json();

      if (data?.data?.notices) {
        setNotices(data.data.notices);
      }
    } catch (error) {
      console.error("Failed to fetch notices:", error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDate(new Date().toISOString().split("T")[0]);
    setWebsiteLink("");
    setIsActive(true);
    setPdfFile(null);
    setEditingNoticeId(null);

    const fileInput = document.getElementById("notice-pdf") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEditClick = (notice: NoticeItem) => {
    setEditingNoticeId(notice._id);
    setTitle(notice.title || "");
    setDate(
      notice.date
        ? new Date(notice.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0]
    );
    setWebsiteLink(notice.websiteLink || "");
    setIsActive(notice.isActive !== false);
    setPdfFile(null);

    const fileInput = document.getElementById("notice-pdf") as HTMLInputElement;
    if (fileInput) fileInput.value = "";

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmitNotice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("odmm_admin_token");
    if (!token) {
      setMessage("Login token missing. Please login again.");
      return;
    }

    if (!title.trim()) {
      setMessage("Notice title is required.");
      return;
    }

    if (!editingNoticeId && !pdfFile) {
      setMessage("PDF document is required for new notices.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("date", date);
      formData.append("websiteLink", websiteLink.trim());
      formData.append("isActive", String(isActive));

      if (pdfFile) {
        formData.append("pdf", pdfFile);
      }

      const url = editingNoticeId
        ? `${API_URL}/api/notices/${editingNoticeId}`
        : `${API_URL}/api/notices`;

      const res = await fetch(url, {
        method: editingNoticeId ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save notice");
      }

      setMessage(
        editingNoticeId
          ? "Notice updated successfully."
          : "Notice created successfully."
      );

      resetForm();
      fetchNotices();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this notice? This will permanently delete the PDF file."
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("odmm_admin_token");
    if (!token) {
      setMessage("Login token missing. Please login again.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/notices/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete notice");
      }

      setMessage("Notice deleted successfully.");
      if (editingNoticeId === id) resetForm();
      fetchNotices();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Something went wrong.");
      }
    }
  };

  const filteredNotices = notices.filter((n) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      n.title?.toLowerCase().includes(q) ||
      n.date?.toLowerCase().includes(q) ||
      n.websiteLink?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="noticesSection">
      <div className="sectionTop">
        <div>
          <h1>Notice Board</h1>
          <p>Upload official PDFs, assign titles and links, and manage notices for the website</p>
        </div>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="grid">
        <form className="card" onSubmit={handleSubmitNotice}>
          <h2>{editingNoticeId ? "Edit Notice" : "Upload New Notice"}</h2>

          <label className="label">Notice Title *</label>
          <input
            type="text"
            placeholder="e.g. Press Release regarding Annual General Meeting 2026"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label className="label">Date of Notice *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <label className="label">Associated Website Link (Optional)</label>
          <input
            type="url"
            placeholder="https://example.com/more-details"
            value={websiteLink}
            onChange={(e) => setWebsiteLink(e.target.value)}
          />

          <label className="label">
            PDF Document {editingNoticeId ? "(Upload only if you want to replace existing PDF)" : "*"}
          </label>
          <input
            id="notice-pdf"
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
          />

          <label className="checkboxLabel">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span>Active & Published on Website</span>
          </label>

          <button className="submit" type="submit" disabled={loading}>
            {loading
              ? editingNoticeId
                ? "Updating..."
                : "Uploading..."
              : editingNoticeId
              ? "Update Notice"
              : "Upload Notice"}
          </button>

          {editingNoticeId && (
            <button className="cancel" type="button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </form>

        <div className="card">
          <div className="adminListHeader">
            <h2>
              Notices ({filteredNotices.length}
              {searchQuery ? ` of ${notices.length}` : ""})
            </h2>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search notices by title, date, link..."
            />
          </div>

          <div className="list">
            {filteredNotices.length === 0 ? (
              searchQuery ? (
                <div className="adminSearchEmpty">
                  <p>No notices matching &ldquo;{searchQuery}&rdquo;</p>
                  <button type="button" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </button>
                </div>
              ) : (
                <p className="empty">No notices found.</p>
              )
            ) : (
              filteredNotices.map((item) => (
                <div className="item" key={item._id}>
                  <div className="pdfIconBadge">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#d71920"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>

                  <div className="details">
                    <div className="itemTitleRow">
                      <p className="itemTitle">{item.title}</p>
                      <span className={`statusBadge ${item.isActive ? "active" : "inactive"}`}>
                        {item.isActive ? "Active" : "Hidden"}
                      </span>
                    </div>

                    <div className="itemMeta">
                      <span>
                        📅{" "}
                        {item.date
                          ? new Date(item.date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : "---"}
                      </span>

                      {item.websiteLink && (
                        <a
                          href={item.websiteLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="linkRef"
                        >
                          🔗 External Link
                        </a>
                      )}

                      {item.pdf?.url && (
                        <a
                          href={item.pdf.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pdfLink"
                        >
                          📥 View PDF
                        </a>
                      )}
                    </div>

                    <div className="actions">
                      <button
                        className="edit"
                        onClick={() => handleEditClick(item)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete"
                        onClick={() => handleDeleteNotice(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .noticesSection {
          color: #ffffff;
        }

        .sectionTop {
          margin-bottom: 18px;
        }

        .sectionTop h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 800;
        }

        .sectionTop p {
          margin: 6px 0 0;
          color: #8ea2c4;
          font-size: 14px;
        }

        .message {
          background: #101827;
          border: 1px solid #223047;
          color: #00d5ff;
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 18px;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .card {
          background: #101827;
          border: 1px solid #223047;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
        }

        .card h2 {
          margin: 0 0 16px;
          font-size: 21px;
        }

        .listHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .listHeader h2 {
          margin: 0;
        }

        .searchInput {
          max-width: 200px;
          padding: 8px 12px;
          font-size: 13px;
        }

        .label {
          display: block;
          margin-top: 12px;
          margin-bottom: 6px;
          font-size: 13px;
          color: #8ea2c4;
          font-weight: 600;
        }

        input[type="text"],
        input[type="url"],
        input[type="date"],
        input[type="file"] {
          width: 100%;
          background: #080f1d;
          border: 1px solid #223047;
          color: #ffffff;
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 14px;
          box-sizing: border-box;
          outline: none;
        }

        input[type="file"] {
          padding: 8px 12px;
          cursor: pointer;
        }

        .checkboxLabel {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 16px 0 20px;
          cursor: pointer;
          font-size: 14px;
          color: #d1d5db;
        }

        .checkboxLabel input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #003366;
          cursor: pointer;
        }

        .submit {
          background: #003366;
          color: #ffffff;
          border: none;
          padding: 13px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .submit:hover {
          background: #002244;
        }

        .submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cancel {
          background: transparent;
          border: 1px solid #223047;
          color: #8ea2c4;
          padding: 10px;
          border-radius: 10px;
          margin-top: 10px;
          cursor: pointer;
        }

        .cancel:hover {
          color: #ffffff;
          border-color: #4b5563;
        }

        .list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
          max-height: 600px;
          padding-right: 4px;
        }

        .empty {
          color: #8ea2c4;
          font-size: 14px;
          text-align: center;
          margin: 30px 0;
        }

        .item {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          background: #080f1d;
          border: 1px solid #1a273b;
          padding: 14px;
          border-radius: 12px;
        }

        .pdfIconBadge {
          background: rgba(215, 25, 32, 0.1);
          border: 1px solid rgba(215, 25, 32, 0.3);
          border-radius: 8px;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .details {
          flex: 1;
          min-width: 0;
        }

        .itemTitleRow {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
        }

        .itemTitle {
          margin: 0;
          font-weight: 600;
          font-size: 14px;
          color: #f3f4f6;
          line-height: 1.4;
          word-break: break-word;
        }

        .statusBadge {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 999px;
          font-weight: 600;
          white-space: nowrap;
        }

        .statusBadge.active {
          background: rgba(34, 197, 94, 0.15);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .statusBadge.inactive {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .itemMeta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 8px;
          font-size: 12px;
          color: #9ca3af;
        }

        .linkRef {
          color: #60a5fa;
          text-decoration: underline;
        }

        .pdfLink {
          color: #f87171;
          font-weight: 600;
          text-decoration: underline;
        }

        .actions {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }

        .actions button {
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .edit {
          background: #1e3a5f;
          color: #93c5fd;
        }

        .edit:hover {
          background: #2563eb;
          color: #ffffff;
        }

        .delete {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
        }

        .delete:hover {
          background: #dc2626;
          color: #ffffff;
        }

        @media (max-width: 900px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
