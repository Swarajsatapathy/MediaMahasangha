"use client";

import { useEffect, useState } from "react";

type GalleryItem = {
  _id: string;
  description: string;
  district: string;
  area: string;
  photo?: {
    url: string;
    key: string;
  };
  createdAt?: string;
};

export default function GallerySection() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  const [description, setDescription] = useState("");
  const [district, setDistrict] = useState("");
  const [area, setArea] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchGalleryItems();
    fetchDistricts();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const res = await fetch(`${API_URL}/api/gallery`);
      const data = await res.json();

      if (data?.data?.galleryItems) {
        setGalleryItems(data.data.galleryItems);
      }
    } catch (error) {
      console.error("Failed to fetch gallery items:", error);
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
    setDescription("");
    setDistrict("");
    setArea("");
    setPhoto(null);
    setEditingGalleryId(null);

    const fileInput = document.getElementById("gallery-photo") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEditClick = (item: GalleryItem) => {
    setEditingGalleryId(item._id);
    setDescription(item.description || "");
    setDistrict(item.district || "");
    setArea(item.area || "");
    setPhoto(null);

    const fileInput = document.getElementById("gallery-photo") as HTMLInputElement;
    if (fileInput) fileInput.value = "";

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmitGallery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("odmm_admin_token");

    if (!token) {
      setMessage("Login token missing. Please login again.");
      return;
    }

    if (!description || !district || !area) {
      setMessage("Description, district and area are required.");
      return;
    }

    if (!editingGalleryId && !photo) {
      setMessage("Photo is required.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();

      formData.append("description", description);
      formData.append("district", district);
      formData.append("area", area);

      if (photo) {
        formData.append("photo", photo);
      }

      const url = editingGalleryId
        ? `${API_URL}/api/gallery/${editingGalleryId}`
        : `${API_URL}/api/gallery`;

      const res = await fetch(url, {
        method: editingGalleryId ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save gallery item");
      }

      setMessage(
        editingGalleryId
          ? "Gallery item updated successfully."
          : "Gallery item created successfully."
      );

      resetForm();
      fetchGalleryItems();
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

  const handleDeleteGallery = async (id: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this gallery item?"
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("odmm_admin_token");

    if (!token) {
      setMessage("Login token missing. Please login again.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/gallery/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete gallery item");
      }

      setMessage("Gallery item deleted successfully.");
      fetchGalleryItems();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Something went wrong.");
      }
    }
  };

  return (
    <section className="membersSection">
      <div className="sectionTop">
        <div>
          <h1>Gallery</h1>
          <p>Create and manage gallery photos</p>
        </div>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="grid">
        <form className="card" onSubmit={handleSubmitGallery}>
          <h2>{editingGalleryId ? "Edit Gallery Item" : "Create Gallery Item"}</h2>

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
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
            placeholder="Area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            required
          />

          <label className="label">
            Photo {editingGalleryId ? "(upload only if you want to change)" : ""}
          </label>

          <input
            id="gallery-photo"
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />

          <button className="submit" type="submit" disabled={loading}>
            {loading
              ? editingGalleryId
                ? "Updating..."
                : "Creating..."
              : editingGalleryId
              ? "Update Gallery Item"
              : "Create Gallery Item"}
          </button>

          {editingGalleryId && (
            <button className="cancel" type="button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </form>

        <div className="card">
          <h2>Gallery ({galleryItems.length})</h2>

          <div className="list">
            {galleryItems.length === 0 ? (
              <p className="empty">No gallery items found.</p>
            ) : (
              galleryItems.map((item) => (
                <div className="item" key={item._id}>
                  <div className="avatar galleryAvatar">
                    {item.photo?.url ? (
                      <img src={item.photo.url} alt={item.description} />
                    ) : (
                      <span>G</span>
                    )}
                  </div>

                  <div className="details">
                    <h3>{item.area}</h3>

                    <p>{item.description}</p>

                    <p>
                      <strong>District:</strong> {item.district}
                    </p>

                    <div className="actions">
                      <button
                        className="edit"
                        onClick={() => handleEditClick(item)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete"
                        onClick={() => handleDeleteGallery(item._id)}
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
        .membersSection {
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
        select,
        textarea {
          width: 100%;
          background: #080f1d;
          border: 1px solid #223047;
          color: #ffffff;
          border-radius: 10px;
          padding: 13px 15px;
          margin-bottom: 16px;
          outline: none;
          font-size: 14px;
          font-family: inherit;
        }

        textarea {
          min-height: 110px;
          resize: vertical;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #00d5ff;
        }

        .label {
          display: block;
          color: #8ea2c4;
          margin-bottom: 8px;
          font-size: 13px;
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
          display: flex;
          gap: 14px;
        }

        .avatar {
          width: 58px;
          height: 58px;
          border-radius: 12px;
          background: #07364b;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
        }

        .galleryAvatar {
          width: 90px;
          height: 70px;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar span {
          color: #00d5ff;
          font-weight: 900;
          font-size: 22px;
        }

        .details {
          flex: 1;
        }

        .details h3 {
          margin: 0 0 6px;
          font-size: 16px;
          line-height: 1.4;
        }

        .details p {
          margin: 0 0 6px;
          color: #8ea2c4;
          font-size: 14px;
          line-height: 1.5;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .edit,
        .delete {
          border: none;
          padding: 9px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 800;
        }

        .edit {
          background: #07364b;
          color: #00d5ff;
          cursor: pointer;
        }

        .delete {
          background: #351125;
          color: #ff4d7d;
          cursor: pointer;
        }

        .empty {
          color: #8ea2c4;
        }

        @media (max-width: 950px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}