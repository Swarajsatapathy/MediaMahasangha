"use client";

import { useEffect, useState } from "react";

type Member = {
  _id: string;
  memberId: string;
  name: string;
  designation: string;
  district: string;
  mobileNumber: string;
  photo?: {
    url: string;
    key: string;
  };
  isActive: boolean;
};

export default function MembersSection() {
  const [members, setMembers] = useState<Member[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  const [memberId, setMemberId] = useState("");
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [district, setDistrict] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchMembers();
    fetchDistricts();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/members`);
      const data = await res.json();

      if (data?.data?.members) {
        setMembers(data.data.members);
      }
    } catch (error) {
      console.error("Failed to fetch members:", error);
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
    setMemberId("");
    setName("");
    setDesignation("");
    setDistrict("");
    setMobileNumber("");
    setPhoto(null);
    setIsActive(true);
    setEditingMemberId(null);

    const fileInput = document.getElementById("photo") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEditClick = (member: Member) => {
  setEditingMemberId(member._id);
  setMemberId(member.memberId || "");
  setName(member.name || "");
  setDesignation(member.designation || "");
  setDistrict(member.district || "");
  setMobileNumber(member.mobileNumber || "");
  setIsActive(member.isActive ?? true);
  setPhoto(null);

  const fileInput = document.getElementById("photo") as HTMLInputElement;
  if (fileInput) fileInput.value = "";

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

  const handleSubmitMember = async (e: React.FormEvent<HTMLFormElement>) => { 
    e.preventDefault();

    const token = localStorage.getItem("odmm_admin_token");

    if (!token) {
      setMessage("Login token missing. Please login again.");
      return;
    }

    if (!memberId || !name || !designation || !district || !mobileNumber) {
      setMessage("All required fields must be filled.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();

      formData.append("memberId", memberId);
      formData.append("name", name);
      formData.append("designation", designation);
      formData.append("district", district);
      formData.append("mobileNumber", mobileNumber);
      formData.append("isActive", String(isActive));

      if (photo) {
        formData.append("photo", photo);
      }

      const url = editingMemberId
  ? `${API_URL}/api/members/${editingMemberId}`
  : `${API_URL}/api/members`;

const res = await fetch(url, {
  method: editingMemberId ? "PUT" : "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create member");
      }

     setMessage(
  editingMemberId
    ? "Member updated successfully."
    : "Member created successfully."
);
      resetForm();
      fetchMembers();
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

  const handleDeleteMember = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this member?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("odmm_admin_token");

    try {
      const res = await fetch(`${API_URL}/api/members/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete member");
      }

      setMessage("Member deleted successfully.");
      fetchMembers();
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
          <h1>Members</h1>
          <p>Create and manage reporters/members</p>
        </div>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="grid">
        <form className="card" onSubmit={handleSubmitMember}>
          <h2>{editingMemberId ? "Edit Member" : "Create Member"}</h2>

          <input
            type="text"
            placeholder="Member ID e.g. ODMM001"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Designation"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
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
            placeholder="Mobile number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />

          <label className="label">Photo</label>
          <input
            id="photo"
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
  ? editingMemberId
    ? "Updating..."
    : "Creating..."
  : editingMemberId
  ? "Update Member"
  : "Create Member"}
          </button>

          {editingMemberId && (
  <button className="cancel" type="button" onClick={resetForm}>
    Cancel Edit
  </button>
)}

        </form>

        <div className="card">
          <h2>Members ({members.length})</h2>

          <div className="list">
            {members.length === 0 ? (
              <p className="empty">No members found.</p>
            ) : (
              members.map((member) => (
                <div className="item" key={member._id}>
                  <div className="avatar">
                    {member.photo?.url ? (
                      <img src={member.photo.url} alt={member.name} />
                    ) : (
                      <span>{member.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                    <div className="details">
                        <h3>{member.name}</h3>
                        <p>
                        {member.designation} • {member.district}
                        </p>
                        <p>{member.mobileNumber}</p>

                        <div className="actions">
  <span className={member.isActive ? "active" : "inactive"}>
    {member.isActive ? "Active" : "Inactive"}
  </span>

  <button className="edit" onClick={() => handleEditClick(member)}>
    Edit
  </button>

  <button
    className="delete"
    onClick={() => handleDeleteMember(member._id)}
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