"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Article = {
  _id: string;
  title: string;
  content: string;
  reporter: string;
  district: string;
  isPublished: boolean;
  isFlash: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isEditorsPick: boolean;
};

export default function ArticlesSection() {
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [reporter, setReporter] = useState("");
  const [district, setDistrict] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState<FileList | null>(null);

  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  const [isPublished, setIsPublished] = useState(true);
  const [isFlash, setIsFlash] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isEditorsPick, setIsEditorsPick] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("odmm_admin_token");

    if (!token) {
      router.push("/login");
      return;
    }

    fetchArticles();
    fetchDistricts();
  }, [router]);

  const fetchArticles = async () => {
    try {
      const res = await fetch(`${API_URL}/api/articles`);
      const data = await res.json();

      if (data?.data?.articles) {
        setArticles(data.data.articles);
      }
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    }
  };

  const fetchDistricts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/locations/districts`);
      const data = await res.json();

      if (data?.data) {
        setDistricts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch districts:", error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setReporter("");
    setDistrict("");
    setTags("");
    setImages(null);
    setIsPublished(true);
    setIsFlash(false);
    setIsFeatured(false);
    setIsTrending(false);
    setIsEditorsPick(false);
    setEditingArticleId(null);

    const fileInput = document.getElementById("images") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEditClick = (article: Article) => {
  setEditingArticleId(article._id);
  setTitle(article.title || "");
  setContent(article.content || "");
  setReporter(article.reporter || "");
  setDistrict(article.district || "");
  setTags("");
  setIsPublished(article.isPublished || false);
  setIsFlash(article.isFlash || false);
  setIsFeatured(article.isFeatured || false);
  setIsTrending(article.isTrending || false);
  setIsEditorsPick(article.isEditorsPick || false);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}; 

  const handleSubmitArticle = async (e: React.FormEvent<HTMLFormElement>) => { 
    e.preventDefault();

    const token = localStorage.getItem("odmm_admin_token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (!title || !district) {
      setMessage("Title and district are required.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();

      formData.append("title", title);
      formData.append("content", content);
      formData.append("reporter", reporter || "Admin");
      formData.append("district", district);
      formData.append("tags", tags);
      formData.append("isPublished", String(isPublished));
      formData.append("isFlash", String(isFlash));
      formData.append("isFeatured", String(isFeatured));
      formData.append("isTrending", String(isTrending));
      formData.append("isEditorsPick", String(isEditorsPick));

      if (images) {
        Array.from(images).forEach((image) => {
          formData.append("images", image);
        });
      }

      const url = editingArticleId
  ? `${API_URL}/api/articles/${editingArticleId}`
  : `${API_URL}/api/articles`;

const res = await fetch(url, {
  method: editingArticleId ? "PUT" : "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create article");
      }

      setMessage(
  editingArticleId
    ? "Article updated successfully."
    : "Article created successfully."
);
      resetForm();
      fetchArticles();
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

  const handleDeleteArticle = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this article?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("odmm_admin_token");

    try {
      const res = await fetch(`${API_URL}/api/articles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete article");
      }

      setMessage("Article deleted successfully.");
      fetchArticles();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Something went wrong.");
      }
    }
  };

  return (
    <main className="page">
      <div className="top">
        <div>
          <h1>Articles</h1>
          <p>Create and manage web news articles</p>
        </div>

      </div>

      {message && <div className="message">{message}</div>}

      <section className="grid">
        <form className="card" onSubmit={handleSubmitArticle}>
          <h2>{editingArticleId ? "Edit Article" : "Create Article"}</h2>

          <input
            type="text"
            placeholder="Article title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Article content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
          />

          <input
            type="text"
            placeholder="Reporter name"
            value={reporter}
            onChange={(e) => setReporter(e.target.value)}
          />

          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            required
          >
            <option value="">Select District</option>
            {districts.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Tags comma separated"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <label className="label">Images</label>
          <input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(e.target.files)}
          />

          <div className="checks">
            <label>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              Published
            </label>

            <label>
              <input
                type="checkbox"
                checked={isFlash}
                onChange={(e) => setIsFlash(e.target.checked)}
              />
              Flash
            </label>

            <label>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              Featured
            </label>

            <label>
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
              />
              Trending
            </label>

            <label>
              <input
                type="checkbox"
                checked={isEditorsPick}
                onChange={(e) => setIsEditorsPick(e.target.checked)}
              />
              President&apos;s Pick
            </label>
          </div>

          <button className="submit" type="submit" disabled={loading}>
            {loading
  ? editingArticleId
    ? "Updating..."
    : "Creating..."
  : editingArticleId
  ? "Update Article"
  : "Create Article"}
          </button>

          {editingArticleId && (
  <button className="cancel" type="button" onClick={resetForm}>
    Cancel Edit
  </button>
)}
        </form>

        <div className="card">
          <h2>Articles ({articles.length})</h2>

          <div className="list">
            {articles.length === 0 ? (
              <p className="empty">No articles found.</p>
            ) : (
              articles.map((article) => (
                <div className="item" key={article._id}>
                  <h3>{article.title}</h3>
<p>
  {article.district} • {article.reporter}
</p>

<div className="badges">
  {article.isPublished && <span className="badge published">Published</span>}
  {article.isFlash && <span className="badge flash">Flash</span>}
  {article.isFeatured && <span className="badge featured">Featured</span>}
  {article.isTrending && <span className="badge trending">Trending</span>}
  {article.isEditorsPick && (
    <span className="badge president">President&apos;s Pick</span>
  )}
</div>

<div className="actions">
                    <button
  className="edit"
  onClick={() => handleEditClick(article)}
>
  Edit
</button>
                    <button
                      className="delete"
                      onClick={() => handleDeleteArticle(article._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #070d18;
          color: #ffffff;
          padding: 32px;
        }

        .top {
          max-width: 1300px;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .top h1 {
          margin: 0;
          font-size: 28px;
        }

        .top p {
          color: #8ea2c4;
          margin: 6px 0 0;
        }

        .top button {
          background: transparent;
          color: #8ea2c4;
          border: 1px solid #263653;
          padding: 10px 16px;
          border-radius: 10px;
          cursor: pointer;
        }

        .message {
          max-width: 1300px;
          margin: 0 auto 20px;
          background: #101827;
          border: 1px solid #223047;
          color: #00d5ff;
          padding: 12px 16px;
          border-radius: 10px;
        }

        .grid {
          max-width: 1300px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .card {
          background: #101827;
          border: 1px solid #223047;
          border-radius: 16px;
          padding: 24px;
        }

        .card h2 {
          margin: 0 0 20px;
          font-size: 22px;
        }

        input,
        textarea,
        select {
          width: 100%;
          background: #080f1d;
          border: 1px solid #223047;
          color: #ffffff;
          border-radius: 10px;
          padding: 13px 15px;
          margin-bottom: 16px;
          outline: none;
          font-size: 14px;
        }

        input:focus,
        textarea:focus,
        select:focus {
          border-color: #00d5ff;
        }

        .label {
          display: block;
          color: #8ea2c4;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .checks {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin: 10px 0 20px;
          color: #b8c7e6;
          font-size: 14px;
        }

        .checks label {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .checks input {
          width: auto;
          margin: 0;
        }

        .submit {
          width: 100%;
          background: #14798b;
          color: #06111f;
          border: none;
          padding: 13px;
          border-radius: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .submit:hover {
          background: #00d5ff;
        }

        .cancel {
  width: 100%;
  margin-top: 10px;
  background: transparent;
  color: #8ea2c4;
  border: 1px solid #2a3a58;
  padding: 13px;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
}

.cancel:hover {
  color: #00d5ff;
  border-color: #00d5ff;
}

        .list {
          max-height: 650px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .item {
          background: #080f1d;
          border: 1px solid #223047;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 14px;
        }

        .item h3 {
          margin: 0 0 6px;
          font-size: 16px;
          line-height: 1.45;
        }

        .item p {
          margin: 0 0 14px;
          color: #8ea2c4;
          font-size: 14px;
        }

        .actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

        .badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 10px 0 14px;
}

.badge {
  font-size: 12px;
  font-weight: 800;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid transparent;
}

.published {
  background: rgba(0, 213, 255, 0.12);
  color: #00d5ff;
  border-color: rgba(0, 213, 255, 0.25);
}

.flash {
  background: rgba(251, 191, 36, 0.12);
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.25);
}

.featured {
  background: rgba(168, 85, 247, 0.12);
  color: #c084fc;
  border-color: rgba(168, 85, 247, 0.25);
}

.trending {
  background: rgba(248, 113, 113, 0.12);
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.25);
}

.president {
  background: rgba(34, 197, 94, 0.12);
  color: #4ade80;
  border-color: rgba(34, 197, 94, 0.25);
}

        .actions button {
  border: none;
  padding: 9px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
}
        .edit {
  background: #07364b;
  color: #00d5ff;
}

.delete {
  background: #351125;
  color: #ff4d7d;
}

        .empty {
          color: #8ea2c4;
        }

        @media (max-width: 900px) {
          .grid {
            grid-template-columns: 1fr;
          }

          .page {
            padding: 20px;
          }
        }
      `}</style>
    </main>
  );
}