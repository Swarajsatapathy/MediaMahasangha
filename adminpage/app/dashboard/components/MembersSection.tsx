"use client";

import { useEffect, useState } from "react";

type Member = {
  _id: string;
  serialNumber: number;
  memberId: string;
  name: string;
  designation: string;
  district: string;
  mobileNumber: string;
  validUpto: string;
  photo?: {
    url: string;
    key: string;
  };
  isActive: boolean;
  membershipStatus?: "Valid" | "Expired" | "Inactive" | "Validity not set";
  isMembershipValid?: boolean;
};

export default function MembersSection() {
  const [members, setMembers] = useState<Member[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  const [serialNumber, setSerialNumber] = useState("");
  const [memberId, setMemberId] = useState("");
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [district, setDistrict] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [validUpto, setValidUpto] = useState("");
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
      const res = await fetch(`${API_URL}/api/members`, {
        cache: "no-store",
      });

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
    setSerialNumber("");
    setMemberId("");
    setName("");
    setDesignation("");
    setDistrict("");
    setMobileNumber("");
    setValidUpto("");
    setPhoto(null);
    setIsActive(true);
    setEditingMemberId(null);

    const fileInput = document.getElementById("photo") as HTMLInputElement;

    if (fileInput) {
      fileInput.value = "";
    }
  };

  const convertDateForInput = (dateValue?: string) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateValue?: string) => {
    if (!dateValue) {
      return "Not set";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getMembershipStatus = (member: Member) => {
    if (!member.isActive) {
      return "Inactive";
    }

    if (!member.validUpto) {
      return "Validity not set";
    }

    if (member.membershipStatus) {
      return member.membershipStatus;
    }

    const expiryDate = new Date(member.validUpto);
    const today = new Date();

    expiryDate.setHours(23, 59, 59, 999);
    today.setHours(0, 0, 0, 0);

    return expiryDate >= today ? "Valid" : "Expired";
  };

  const getStatusClass = (member: Member) => {
    const status = getMembershipStatus(member);

    if (status === "Valid") {
      return "valid";
    }

    if (status === "Expired") {
      return "expired";
    }

    return "inactive";
  };

  const handleEditClick = (member: Member) => {
    setEditingMemberId(member._id);
    setSerialNumber(String(member.serialNumber || ""));
    setMemberId(member.memberId || "");
    setName(member.name || "");
    setDesignation(member.designation || "");
    setDistrict(member.district || "");
    setMobileNumber(member.mobileNumber || "");
    setValidUpto(convertDateForInput(member.validUpto));
    setIsActive(member.isActive ?? true);
    setPhoto(null);

    const fileInput = document.getElementById("photo") as HTMLInputElement;

    if (fileInput) {
      fileInput.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmitMember = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const token = localStorage.getItem("odmm_admin_token");

    if (!token) {
      setMessage("Login token missing. Please login again.");
      return;
    }

    if (
      !serialNumber ||
      !memberId.trim() ||
      !name.trim() ||
      !designation.trim() ||
      !district ||
      !mobileNumber.trim() ||
      !validUpto
    ) {
      setMessage("All required fields, including Valid Upto, must be filled.");
      return;
    }

    const parsedSerialNumber = Number(serialNumber);

    if (
      Number.isNaN(parsedSerialNumber) ||
      parsedSerialNumber < 1
    ) {
      setMessage("Serial number must be greater than 0.");
      return;
    }

    if (mobileNumber.length !== 10) {
      setMessage("Mobile number must contain exactly 10 digits.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();

      formData.append("serialNumber", serialNumber);
      formData.append("memberId", memberId.trim());
      formData.append("name", name.trim());
      formData.append("designation", designation.trim());
      formData.append("district", district);
      formData.append("mobileNumber", mobileNumber.trim());
      formData.append("validUpto", validUpto);
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
        throw new Error(data.message || "Failed to save member");
      }

      setMessage(
        editingMemberId
          ? "Member updated successfully."
          : "Member created successfully.",
      );

      resetForm();
      await fetchMembers();
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
    const confirmDelete = confirm(
      "Are you sure you want to delete this member?",
    );

    if (!confirmDelete) {
      return;
    }

    const token = localStorage.getItem("odmm_admin_token");

    if (!token) {
      setMessage("Login token missing. Please login again.");
      return;
    }

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
      await fetchMembers();
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
          <p>Create and manage ODMM members and membership validity</p>
        </div>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="grid">
        <form className="card" onSubmit={handleSubmitMember}>
          <h2>{editingMemberId ? "Edit Member" : "Create Member"}</h2>

          <label className="label" htmlFor="serialNumber">
            Serial Number
          </label>

          <input
            id="serialNumber"
            type="number"
            min="1"
            placeholder="Serial Number e.g. 1"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            required
          />

          <label className="label" htmlFor="memberId">
            Member ID
          </label>

          <input
            id="memberId"
            type="text"
            placeholder="Member ID e.g. ODMM001"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            required
          />

          <label className="label" htmlFor="name">
            Full Name
          </label>

          <input
            id="name"
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label className="label" htmlFor="designation">
            Designation
          </label>

          <input
            id="designation"
            type="text"
            placeholder="Designation"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            required
          />

          <label className="label" htmlFor="district">
            District
          </label>

          <select
            id="district"
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

          <label className="label" htmlFor="mobileNumber">
            Mobile Number
          </label>

          <input
            id="mobileNumber"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            placeholder="10-digit mobile number"
            value={mobileNumber}
            onChange={(e) => {
              const onlyNumbers = e.target.value
                .replace(/\D/g, "")
                .slice(0, 10);

              setMobileNumber(onlyNumbers);
            }}
            required
          />

          <label className="label" htmlFor="validUpto">
            Valid Upto
          </label>

          <input
            id="validUpto"
            type="date"
            value={validUpto}
            onChange={(e) => setValidUpto(e.target.value)}
            required
          />

          <p className="dateHelp">
            The member will remain valid until the end of the selected date.
          </p>

          <label className="label" htmlFor="photo">
            Photo
          </label>

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
              Active member
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
              members.map((member) => {
                const membershipStatus = getMembershipStatus(member);

                return (
                  <div className="item" key={member._id}>
                    <div className="avatar">
                      {member.photo?.url ? (
                        <img src={member.photo.url} alt={member.name} />
                      ) : (
                        <span>
                          {member.name?.charAt(0).toUpperCase() || "M"}
                        </span>
                      )}
                    </div>

                    <div className="details">
                      <h3>
                        SL {member.serialNumber} - {member.name}
                      </h3>

                      <p>
                        <strong>ID:</strong> {member.memberId}
                      </p>

                      <p>
                        {member.designation} • {member.district}
                      </p>

                      <p>
                        <strong>Mobile:</strong> {member.mobileNumber}
                      </p>

                      <p>
                        <strong>Valid Upto:</strong>{" "}
                        {formatDisplayDate(member.validUpto)}
                      </p>

                      <div className="actions">
                        <span className={getStatusClass(member)}>
                          {membershipStatus}
                        </span>

                        <button
                          type="button"
                          className="edit"
                          onClick={() => handleEditClick(member)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete"
                          onClick={() => handleDeleteMember(member._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
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
          box-sizing: border-box;
        }

        input[type="date"] {
          color-scheme: dark;
        }

        input:focus,
        select:focus {
          border-color: #00d5ff;
        }

        .label {
          display: block;
          color: #b8c7e6;
          margin-bottom: 8px;
          font-size: 13px;
          font-weight: 700;
        }

        .dateHelp {
          color: #7285a6;
          font-size: 12px;
          line-height: 1.5;
          margin: -8px 0 16px;
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
          color: #ffffff;
          border: none;
          padding: 13px;
          border-radius: 10px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .submit:hover:not(:disabled) {
          background: #00d5ff;
          color: #06111f;
        }

        .submit:disabled {
          cursor: not-allowed;
          opacity: 0.65;
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
          max-height: 720px;
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
          width: 64px;
          height: 64px;
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
          min-width: 0;
        }

        .details h3 {
          margin: 0 0 8px;
          font-size: 16px;
          line-height: 1.4;
        }

        .details p {
          margin: 0 0 6px;
          color: #8ea2c4;
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .details strong {
          color: #b8c7e6;
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
          flex-wrap: wrap;
        }

        .valid,
        .expired,
        .inactive,
        .edit,
        .delete {
          border: none;
          padding: 9px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 800;
        }

        .valid {
          background: rgba(34, 197, 94, 0.12);
          color: #4ade80;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .expired {
          background: rgba(239, 68, 68, 0.12);
          color: #fb7185;
          border: 1px solid rgba(239, 68, 68, 0.3);
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

        .edit:hover,
        .delete:hover {
          filter: brightness(1.2);
        }

        .empty {
          color: #8ea2c4;
        }

        @media (max-width: 950px) {
          .grid {
            grid-template-columns: 1fr;
          }

          .list {
            max-height: none;
          }
        }

        @media (max-width: 540px) {
          .card {
            padding: 16px;
          }

          .item {
            align-items: flex-start;
          }

          .avatar {
            width: 54px;
            height: 54px;
          }

          .actions {
            gap: 7px;
          }

          .valid,
          .expired,
          .inactive,
          .edit,
          .delete {
            padding: 8px 10px;
            font-size: 12px;
          }
        }
      `}</style>
    </section>
  );
}