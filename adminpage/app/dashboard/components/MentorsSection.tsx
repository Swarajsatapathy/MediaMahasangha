"use client";

import { useEffect, useState } from "react";

type Mentor = {
  _id: string;
  serialNumber: number;
  name: string;
  description: string;
  mobileNumber: string;
  photo?: {
    url: string;
    key: string;
  };
  isActive: boolean;
};

export default function MentorsSection() {
  const [mentors, setMentors] = useState<Mentor[]>([]);

  const [serialNumber, setSerialNumber] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);

  const [editingMentorId, setEditingMentorId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const res = await fetch(`${API_URL}/api/mentors`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch mentors");
      }

      if (data?.data?.mentors) {
        setMentors(data.data.mentors);
      } else if (Array.isArray(data?.data)) {
        setMentors(data.data);
      } else {
        setMentors([]);
      }
    } catch (error) {
      console.error("Failed to fetch mentors:", error);
      setMessage("Failed to fetch mentors.");
    }
  };

  const resetForm = () => {
    setSerialNumber("");
    setName("");
    setDescription("");
    setMobileNumber("");
    setPhoto(null);
    setIsActive(true);
    setEditingMentorId(null);

    const fileInput = document.getElementById("mentorPhoto") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEditClick = (mentor: Mentor) => {
    setEditingMentorId(mentor._id);
    setSerialNumber(String(mentor.serialNumber || ""));
    setName(mentor.name || "");
    setDescription(mentor.description || "");
    setMobileNumber(mentor.mobileNumber || "");
    setIsActive(mentor.isActive ?? true);
    setPhoto(null);

    const fileInput = document.getElementById("mentorPhoto") as HTMLInputElement;
    if (fileInput) fileInput.value = "";

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmitMentor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("odmm_admin_token");

    if (!token) {
      setMessage("Login token missing. Please login again.");
      return;
    }

    if (!serialNumber || !name || !description || !mobileNumber) {
      setMessage("Serial number, name, description and mobile number are required.");
      return;
    }

    if (!editingMentorId && !photo) {
      setMessage("Please select a mentor photo.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();

      formData.append("serialNumber", serialNumber);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("mobileNumber", mobileNumber);
      formData.append("isActive", String(isActive));

      if (photo) {
        formData.append("photo", photo);
      }

      const url = editingMentorId
        ? `${API_URL}/api/mentors/${editingMentorId}`
        : `${API_URL}/api/mentors`;

      const res = await fetch(url, {
        method: editingMentorId ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        console.log("Mentor save error:", data);
        throw new Error(data.message || data.error || "Failed to save mentor");
      }

      setMessage(
        editingMentorId
          ? "Mentor updated successfully."
          : "Mentor created successfully."
      );

      resetForm();
      fetchMentors();
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

  const handleDeleteMentor = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this mentor?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("odmm_admin_token");

    if (!token) {
      setMessage("Login token missing. Please login again.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/mentors/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete mentor");
      }

      setMessage("Mentor deleted successfully.");
      fetchMentors();
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Something went wrong.");
      }
    }
  };

  return (
    <section className="mentorsSection">
      <div className="sectionTop">
        <div>
          <h1>Mentors</h1>
          <p>Create and manage mentors</p>
        </div>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="grid">
        <form className="card" onSubmit={handleSubmitMentor}>
          <h2>{editingMentorId ? "Edit Mentor" : "Create Mentor"}</h2>

          <input
            type="number"
            placeholder="Serial Number e.g. 1"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Mentor name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Mobile number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />

          <label className="label">
            Photo {editingMentorId ? "(leave empty to keep old photo)" : ""}
          </label>

          <input
            id="mentorPhoto"
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />

          <div className="checks">
            <label>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>
          </div>

          <button className="submit" type="submit" disabled={loading}>
            {loading
              ? editingMentorId
                ? "Updating..."
                : "Creating..."
              : editingMentorId
              ? "Update Mentor"
              : "Create Mentor"}
          </button>

          {editingMentorId && (
            <button className="cancel" type="button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </form>

        <div className="card">
          <h2>Mentors ({mentors.length})</h2>

          <div className="list">
            {mentors.length === 0 ? (
              <p className="empty">No mentors found.</p>
            ) : (
              mentors.map((mentor) => (
                <div className="item" key={mentor._id}>
                  <div className="avatar">
                    {mentor.photo?.url ? (
                      <img src={mentor.photo.url} alt={mentor.name} />
                    ) : (
                      <span>{mentor.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="details">
                    <h3>
                      SL {mentor.serialNumber} - {mentor.name}
                    </h3>

                    <p>{mentor.description}</p>

                    <p className="mobile">
                      Mobile:{" "}
                      <a href={`tel:${mentor.mobileNumber}`}>
                        {mentor.mobileNumber}
                      </a>
                    </p>

                    <div className="actions">
                      <span className={mentor.isActive ? "active" : "inactive"}>
                        {mentor.isActive ? "Active" : "Inactive"}
                      </span>

                      <button
                        className="edit"
                        type="button"
                        onClick={() => handleEditClick(mentor)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete"
                        type="button"
                        onClick={() => handleDeleteMentor(mentor._id)}
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
        .mentorsSection {
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
          min-height: 120px;
          resize: vertical;
        }

        input:focus,
        textarea:focus {
          border-color: #00d5ff;
        }

        .label {
          display: block;
          color: #8ea2c4;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .checks {
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

        .submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
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

        .mobile {
          color: #b8c7e6 !important;
        }

        .mobile a {
          color: #00d5ff;
          text-decoration: none;
          font-weight: 700;
        }

        .mobile a:hover {
          color: #fbbf24;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .active,
        .inactive,
        .edit,
        .delete {
          border: none;
          padding: 9px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 800;
        }

        .active {
          background: rgba(0, 213, 255, 0.12);
          color: #00d5ff;
          border: 1px solid rgba(0, 213, 255, 0.25);
        }

        .inactive {
          background: rgba(251, 191, 36, 0.12);
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.25);
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
          font-size: 14px;
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