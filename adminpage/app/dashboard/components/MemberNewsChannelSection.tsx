"use client";

import { useEffect, useState } from "react";

type MemberNewsChannel = {
  _id: string;
  serialNumber: number;
  odmmRegistrationNo: string;
  newsChannelName: string;
  ownerName: string;
  district: string;
  mobileNumber: string;
  email: string;
  websiteUrl: string;
  registrationNumber?: string;
  photo?: {
    url: string;
    key: string;
  };
  isActive: boolean;
};

export default function MemberNewsChannelSection() {
  const [memberNewsChannels, setMemberNewsChannels] = useState<
    MemberNewsChannel[]
  >([]);
  const [districts, setDistricts] = useState<string[]>([]);

  const [serialNumber, setSerialNumber] = useState("");
  const [odmmRegistrationNo, setOdmmRegistrationNo] = useState("");
  const [newsChannelName, setNewsChannelName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [district, setDistrict] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);

  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchMemberNewsChannels();
    fetchDistricts();
  }, []);

  const fetchMemberNewsChannels = async () => {
    try {
      const res = await fetch(`${API_URL}/api/member-news-channels`);
      const data = await res.json();

      if (data?.data?.memberNewsChannels) {
        setMemberNewsChannels(data.data.memberNewsChannels);
      }
    } catch (error) {
      console.error("Failed to fetch member news channels:", error);
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
    setSerialNumber("");
    setOdmmRegistrationNo("");
    setNewsChannelName("");
    setOwnerName("");
    setDistrict("");
    setMobileNumber("");
    setEmail("");
    setWebsiteUrl("");
    setRegistrationNumber("");
    setPhoto(null);
    setIsActive(true);
    setEditingChannelId(null);

    const fileInput = document.getElementById(
      "memberNewsChannelPhoto"
    ) as HTMLInputElement;

    if (fileInput) fileInput.value = "";
  };

  const handleEditClick = (channel: MemberNewsChannel) => {
    setEditingChannelId(channel._id);
    setSerialNumber(String(channel.serialNumber || ""));
    setOdmmRegistrationNo(channel.odmmRegistrationNo || "");
    setNewsChannelName(channel.newsChannelName || "");
    setOwnerName(channel.ownerName || "");
    setDistrict(channel.district || "");
    setMobileNumber(channel.mobileNumber || "");
    setEmail(channel.email || "");
    setWebsiteUrl(channel.websiteUrl || "");
    setRegistrationNumber(channel.registrationNumber || "");
    setIsActive(channel.isActive ?? true);
    setPhoto(null);

    const fileInput = document.getElementById(
      "memberNewsChannelPhoto"
    ) as HTMLInputElement;

    if (fileInput) fileInput.value = "";

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmitMemberNewsChannel = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const token = localStorage.getItem("odmm_admin_token");

    if (!token) {
      setMessage("Login token missing. Please login again.");
      return;
    }

    if (
      !serialNumber ||
      !odmmRegistrationNo ||
      !newsChannelName ||
      !ownerName ||
      !district ||
      !mobileNumber ||
      !email ||
      !websiteUrl
    ) {
      setMessage("All required fields must be filled.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();

      formData.append("serialNumber", serialNumber);
      formData.append("odmmRegistrationNo", odmmRegistrationNo);
      formData.append("newsChannelName", newsChannelName);
      formData.append("ownerName", ownerName);
      formData.append("district", district);
      formData.append("mobileNumber", mobileNumber);
      formData.append("email", email);
      formData.append("websiteUrl", websiteUrl);
      formData.append("registrationNumber", registrationNumber);
      formData.append("isActive", String(isActive));

      if (photo) {
        formData.append("photo", photo);
      }

      const url = editingChannelId
        ? `${API_URL}/api/member-news-channels/${editingChannelId}`
        : `${API_URL}/api/member-news-channels`;

      const res = await fetch(url, {
        method: editingChannelId ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save member news channel");
      }

      setMessage(
        editingChannelId
          ? "Member news channel updated successfully."
          : "Member news channel created successfully."
      );

      resetForm();
      fetchMemberNewsChannels();
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

  const handleDeleteMemberNewsChannel = async (id: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this member news channel?"
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("odmm_admin_token");

    if (!token) {
      setMessage("Login token missing. Please login again.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/member-news-channels/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete member news channel");
      }

      setMessage("Member news channel deleted successfully.");
      fetchMemberNewsChannels();
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
          <h1>Member News Channels</h1>
          <p>Create and manage ODMM registered news channels</p>
        </div>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="grid">
        <form className="card" onSubmit={handleSubmitMemberNewsChannel}>
          <h2>
            {editingChannelId
              ? "Edit Member News Channel"
              : "Create Member News Channel"}
          </h2>

          <input
            type="number"
            placeholder="Serial Number e.g. 1"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="ODMM Registration No. e.g. ODMM001"
            value={odmmRegistrationNo}
            onChange={(e) => setOdmmRegistrationNo(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Name of News Channel"
            value={newsChannelName}
            onChange={(e) => setNewsChannelName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Name of Owner"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
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
            placeholder="Mobile No."
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="E-mail ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="url"
            placeholder="Website URL"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Registration No. optional"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
          />

          <label className="label">Photo</label>
          <input
            id="memberNewsChannelPhoto"
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
              ? editingChannelId
                ? "Updating..."
                : "Creating..."
              : editingChannelId
              ? "Update Member News Channel"
              : "Create Member News Channel"}
          </button>

          {editingChannelId && (
            <button className="cancel" type="button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </form>

        <div className="card">
          <h2>Member News Channels ({memberNewsChannels.length})</h2>

          <div className="list">
            {memberNewsChannels.length === 0 ? (
              <p className="empty">No member news channels found.</p>
            ) : (
              memberNewsChannels.map((channel) => (
                <div className="item" key={channel._id}>
                  <div className="avatar">
                    {channel.photo?.url ? (
                      <img
                        src={channel.photo.url}
                        alt={channel.newsChannelName}
                      />
                    ) : (
                      <span>
                        {channel.newsChannelName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="details">
                    <h3>
                      SL {channel.serialNumber} - {channel.newsChannelName}
                    </h3>

                    <p>ODMM Reg. No: {channel.odmmRegistrationNo}</p>

                    <p>Owner: {channel.ownerName}</p>

                    <p>District: {channel.district}</p>

                    <p>Mobile: {channel.mobileNumber}</p>

                    <p>Email: {channel.email}</p>

                    <p>
                      Website:{" "}
                      <a
                        href={channel.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {channel.websiteUrl}
                      </a>
                    </p>

                    {channel.registrationNumber && (
                      <p>Registration No: {channel.registrationNumber}</p>
                    )}

                    <div className="actions">
                      <span
                        className={channel.isActive ? "active" : "inactive"}
                      >
                        {channel.isActive ? "Active" : "Inactive"}
                      </span>

                      <button
                        className="edit"
                        onClick={() => handleEditClick(channel)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete"
                        onClick={() =>
                          handleDeleteMemberNewsChannel(channel._id)
                        }
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
          word-break: break-word;
        }

        .details a {
          color: #00d5ff;
          text-decoration: none;
        }

        .details a:hover {
          text-decoration: underline;
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