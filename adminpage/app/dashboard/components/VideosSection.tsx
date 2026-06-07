"use client";

import { useEffect, useState } from "react";

type Video = {
  _id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  district: string;
  reporter: string;
  isPublished: boolean;
  isFeatured: boolean;
  isFlash: boolean;
  isTrending: boolean;
  isEditorsPick: boolean;
};

export default function VideosSection() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [district, setDistrict] = useState("");
  const [reporter, setReporter] = useState("");
  const [tags, setTags] = useState("");
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);

  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isFlash, setIsFlash] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isEditorsPick, setIsEditorsPick] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchVideos();
    fetchDistricts();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/videos`);
      const data = await res.json();

      if (data?.data?.videos) {
        setVideos(data.data.videos);
      }
    } catch (error) {
      console.error("Failed to fetch videos:", error);
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
    setDescription("");
    setYoutubeUrl("");
    setDistrict("");
    setReporter("");
    setTags("");
    setIsPublished(true);
    setIsFeatured(false);
    setIsFlash(false);
    setIsTrending(false);
    setIsEditorsPick(false);
    setEditingVideoId(null);
  };

  const handleEditClick = (video: Video) => {
  setEditingVideoId(video._id);
  setTitle(video.title || "");
  setDescription(video.description || "");
  setYoutubeUrl(video.youtubeUrl || "");
  setDistrict(video.district || "");
  setReporter(video.reporter || "");
  setTags("");
  setIsPublished(video.isPublished || false);
  setIsFeatured(video.isFeatured || false);
  setIsFlash(video.isFlash || false);
  setIsTrending(video.isTrending || false);
  setIsEditorsPick(video.isEditorsPick || false);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

  const handleSubmitVideo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("odmm_admin_token");

    if (!token) {
      setMessage("Login token missing. Please login again.");
      return;
    }

    if (!title || !youtubeUrl || !district) {
      setMessage("Title, YouTube URL and district are required.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

     const url = editingVideoId
  ? `${API_URL}/api/videos/${editingVideoId}`
  : `${API_URL}/api/videos`;

const res = await fetch(url, {
  method: editingVideoId ? "PUT" : "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    title,
    description,
    youtubeUrl,
    district,
    reporter: reporter || "Admin",
    tags,
    isPublished,
    isFeatured,
    isFlash,
    isTrending,
    isEditorsPick,
  }),
});

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create video");
      }

      setMessage(
  editingVideoId
    ? "Video news updated successfully."
    : "Video news created successfully."
);
      resetForm();
      fetchVideos();
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

  const handleDeleteVideo = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this video?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("odmm_admin_token");

    try {
      const res = await fetch(`${API_URL}/api/videos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete video");
      }

      setMessage("Video deleted successfully.");
      fetchVideos();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Something went wrong.");
      }
    }
  };

  return (
    <section className="videoSection">
      <div className="sectionTop">
        <div>
          <h1>Video News</h1>
          <p>Create and manage YouTube video news</p>
        </div>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="grid">
        <form className="card" onSubmit={handleSubmitVideo}>
          <h2>{editingVideoId ? "Edit Video" : "Create Video News"}</h2>

          <input
            type="text"
            placeholder="Video title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Video description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />

          <input
            type="url"
            placeholder="YouTube URL"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            required
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
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              Featured
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
  ? editingVideoId
    ? "Updating..."
    : "Creating..."
  : editingVideoId
  ? "Update Video"
  : "Create Video"}
          </button>

          {editingVideoId && (
  <button className="cancel" type="button" onClick={resetForm}>
    Cancel Edit
  </button>
)}

        </form>

        <div className="card">
          <h2>Videos ({videos.length})</h2>

          <div className="list">
            {videos.length === 0 ? (
              <p className="empty">No videos found.</p>
            ) : (
              videos.map((video) => (
                <div className="item" key={video._id}>
                  {video.thumbnailUrl && (
                    <img src={video.thumbnailUrl} alt={video.title} />
                  )}

                  <div>
                    <h3>{video.title}</h3>
<p>
  {video.district} • {video.reporter}
</p>

<div className="badges">
  {video.isPublished && <span className="badge published">Published</span>}
  {video.isFlash && <span className="badge flash">Flash</span>}
  {video.isFeatured && <span className="badge featured">Featured</span>}
  {video.isTrending && <span className="badge trending">Trending</span>}
  {video.isEditorsPick && (
    <span className="badge president">President&apos;s Pick</span>
  )}
</div>

<div className="actions">
  <button className="edit" onClick={() => handleEditClick(video)}>
    Edit
  </button>

  <a href={video.youtubeUrl} target="_blank" rel="noreferrer">
    Open
  </a>

  <button
    className="delete"
    onClick={() => handleDeleteVideo(video._id)}
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
        .videoSection {
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
        }

        .card h2 {
          margin: 0 0 20px;
          font-size: 21px;
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
          padding: 14px;
          margin-bottom: 14px;
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 14px;
        }

        .item img {
          width: 120px;
          height: 75px;
          object-fit: cover;
          border-radius: 8px;
          background: #101827;
        }

        .item h3 {
          margin: 0 0 6px;
          font-size: 16px;
          line-height: 1.4;
        }

        .item p {
          margin: 0 0 12px;
          color: #8ea2c4;
          font-size: 14px;
        }

        .actions {
          display: flex;
          gap: 10px;
        }

        .actions a,
        .actions button {
          border: none;
          padding: 8px 13px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          text-decoration: none;
          font-size: 13px;
        }

        .actions a {
          background: #07364b;
          color: #00d5ff;
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

        @media (max-width: 950px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .item {
            grid-template-columns: 1fr;
          }

          .item img {
            width: 100%;
            height: 180px;
          }
        }
      `}</style>
    </section>
  );
}