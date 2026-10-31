"use client";

import { useEffect, useState } from "react";
import SearchInput from "./SearchInput";

type Patron = {
  _id: string;
  serialNumber: number;
  name: string;
  designation: string;
  designation2?: string;
  area?: string;
  district?: string;
  photo?: {
    url: string;
    key: string;
  };
  isActive: boolean;
};

export default function PatronSection() {
  const [patrons, setPatrons] = useState<Patron[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  const [serialNumber, setSerialNumber] = useState("");
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [designation2, setDesignation2] = useState("");
  const [area, setArea] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);

  const [editingPatronId, setEditingPatronId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchPatrons();
    fetchDistricts();
  }, []);

  const fetchPatrons = async () => {
    try {
      const res = await fetch(`${API_URL}/api/patrons`);
      const data = await res.json();

      if (data?.data?.patrons) {
        setPatrons(data.data.patrons);
      } else if (Array.isArray(data?.data)) {
        setPatrons(data.data);
      } else {
        setPatrons([]);
      }
    } catch (error) {
      console.error("Failed to fetch patrons:", error);
      setMessage("Failed to fetch patrons.");
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
    setName("");
    setDesignation("");
    setDesignation2("");
    setArea("");
    setPhoto(null);
    setIsActive(true);
    setEditingPatronId(null);

    const fileInput = document.getElementById("patronPhoto") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEditClick = (patron: Patron) => {
    setEditingPatronId(patron._id);
    setSerialNumber(String(patron.serialNumber || ""));
    setName(patron.name || "");
    setDesignation(patron.designation || "");
    setDesignation2(patron.designation2 || "");
    setArea(patron.area || patron.district || "");
    setIsActive(patron.isActive ?? true);
    setPhoto(null);

    const fileInput = document.getElementById("patronPhoto") as HTMLInputElement;
    if (fileInput) fileInput.value = "";

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("odmm_admin_token");

    if (!token) {
      setMessage("Login token missing. Please login again.");
      return;
    }

    if (!serialNumber || !name || !designation) {
      setMessage("Serial number, name, and Designation 1 are required.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("serialNumber", serialNumber);
      formData.append("name", name);
      formData.append("designation", designation);
      formData.append("designation2", designation2);
      formData.append("area", area);
      formData.append("district", area);
      formData.append("isActive", String(isActive));

      if (photo) {
        formData.append("photo", photo);
      }

      const url = editingPatronId
        ? `${API_URL}/api/patrons/${editingPatronId}`
        : `${API_URL}/api/patrons`;

      const method = editingPatronId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save patron.");
      }

      setMessage(
        editingPatronId
          ? "Patron updated successfully!"
          : "Patron created successfully!"
      );

      resetForm();
      fetchPatrons();
    } catch (error: any) {
      console.error("Save patron error:", error);
      setMessage(error.message || "Failed to save patron.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this patron?"
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("odmm_admin_token");

    if (!token) {
      setMessage("Login token missing. Please login again.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`${API_URL}/api/patrons/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete patron.");
      }

      setMessage("Patron deleted successfully!");
      if (editingPatronId === id) resetForm();
      fetchPatrons();
    } catch (error: any) {
      console.error("Delete patron error:", error);
      setMessage(error.message || "Failed to delete patron.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (patron: Patron) => {
    const token = localStorage.getItem("odmm_admin_token");

    if (!token) {
      setMessage("Login token missing. Please login again.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("isActive", String(!patron.isActive));

      const res = await fetch(`${API_URL}/api/patrons/${patron._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update status.");
      }

      fetchPatrons();
    } catch (error: any) {
      console.error("Toggle active error:", error);
      setMessage(error.message || "Failed to update status.");
    }
  };

  const filteredPatrons = patrons
    .filter((patron) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        patron.name?.toLowerCase().includes(q) ||
        patron.designation?.toLowerCase().includes(q) ||
        patron.designation2?.toLowerCase().includes(q) ||
        patron.area?.toLowerCase().includes(q) ||
        patron.district?.toLowerCase().includes(q) ||
        String(patron.serialNumber || "").includes(q)
      );
    })
    .sort(
      (a, b) => (Number(a.serialNumber) || 9999) - (Number(b.serialNumber) || 9999)
    );

  return (
    <div className="sectionWrapper">
      <div className="sectionHeader">
        <div>
          <h2>Patron</h2>
          <p>Create and manage patrons with designations and photo</p>
        </div>
      </div>

      {message && <div className="messageBox">{message}</div>}

      <div className="grid">
        {/* FORM */}
        <div className="card formCard">
          <div className="cardHeader">
            <h3>{editingPatronId ? "Edit Patron" : "Create Patron"}</h3>
          </div>

          <form onSubmit={handleSubmit} className="form">
            <div className="formGroup">
              <label>Serial Number *</label>
              <input
                type="number"
                placeholder="e.g. 1"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                min="1"
                required
              />
            </div>

            <div className="formGroup">
              <label>Name *</label>
              <input
                type="text"
                placeholder="Enter patron name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="formGroup">
              <label>Designation 1 *</label>
              <input
                type="text"
                placeholder="Designation 1"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                required
              />
            </div>

            <div className="formGroup">
              <label>Designation 2 (Secondary)</label>
              <input
                type="text"
                placeholder="Designation 2"
                value={designation2}
                onChange={(e) => setDesignation2(e.target.value)}
              />
            </div>

            <div className="formGroup">
              <label>Area / District</label>
              <input
                type="text"
                list="districtOptions"
                placeholder="e.g. Bhubaneswar / Odisha"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
              <datalist id="districtOptions">
                {districts.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>

            <div className="formGroup">
              <label>Photo</label>
              <input
                id="patronPhoto"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setPhoto(e.target.files[0]);
                  }
                }}
              />
              {photo && (
                <p className="fileHint">Selected: {photo.name}</p>
              )}
            </div>

            <div className="checkboxGroup">
              <label className="checkboxLabel">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Active (Visible on public website)
              </label>
            </div>

            <div className="buttonRow">
              <button type="submit" disabled={loading} className="submitBtn">
                {loading
                  ? "Saving..."
                  : editingPatronId
                  ? "Update Patron"
                  : "Save Patron"}
              </button>

              {editingPatronId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="cancelBtn"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* LIST */}
        <div className="card listCard">
          <div className="cardHeader">
            <h3>Patrons ({filteredPatrons.length})</h3>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search patrons by name, designation, area..."
            />
          </div>

          <div className="list">
            {filteredPatrons.length > 0 ? (
              filteredPatrons.map((patron) => (
                <div key={patron._id} className="itemCard">
                  <div className="itemTop">
                    <div className="photoWrapper">
                      {patron.photo?.url ? (
                        <img
                          src={patron.photo.url}
                          alt={patron.name}
                          className="patronImg"
                        />
                      ) : (
                        <div className="photoPlaceholder">
                          {patron.name?.charAt(0)?.toUpperCase() || "P"}
                        </div>
                      )}
                    </div>

                    <div className="itemInfo">
                      <div className="serialBadge">#{patron.serialNumber}</div>
                      <h4>{patron.name}</h4>
                      <p className="primaryDesig">{patron.designation}</p>
                      {patron.designation2 && (
                        <p className="secondaryDesig">{patron.designation2}</p>
                      )}
                      {(patron.area || patron.district) && (
                        <span className="areaTag">📍 {patron.area || patron.district}</span>
                      )}
                    </div>
                  </div>

                  <div className="itemActions">
                    <button
                      type="button"
                      className={`statusPill ${patron.isActive ? "active" : "inactive"}`}
                      onClick={() => handleToggleActive(patron)}
                      title="Click to toggle status"
                    >
                      {patron.isActive ? "Active" : "Inactive"}
                    </button>

                    <div className="actionButtons">
                      <button
                        type="button"
                        onClick={() => handleEditClick(patron)}
                        className="editBtn"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(patron._id)}
                        className="deleteBtn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="emptyMessage">No patrons found.</p>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .sectionWrapper {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .sectionHeader h2 {
          font-size: 24px;
          color: #ffffff;
          margin-bottom: 6px;
        }

        .sectionHeader p {
          color: #8ea2c4;
          font-size: 14px;
        }

        .messageBox {
          background: #101827;
          border-left: 4px solid #00d5ff;
          padding: 12px 16px;
          border-radius: 8px;
          color: #00d5ff;
          font-size: 14px;
        }

        .grid {
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }

        .card {
          background: #101827;
          border: 1px solid #223047;
          border-radius: 14px;
          padding: 24px;
        }

        .cardHeader {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
          border-bottom: 1px solid #223047;
          padding-bottom: 16px;
        }

        .cardHeader h3 {
          font-size: 18px;
          color: #ffffff;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .formGroup {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .formGroup label {
          color: #8ea2c4;
          font-size: 13px;
          font-weight: 500;
        }

        .formGroup input,
        .formGroup select {
          background: #0b111e;
          border: 1px solid #223047;
          color: #ffffff;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .formGroup input:focus,
        .formGroup select:focus {
          border-color: #00d5ff;
        }

        .fileHint {
          color: #00d5ff;
          font-size: 12px;
          margin-top: 4px;
        }

        .checkboxGroup {
          margin-top: 4px;
        }

        .checkboxLabel {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #cbd5e1;
          font-size: 14px;
          cursor: pointer;
        }

        .buttonRow {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .submitBtn {
          flex: 1;
          background: #00d5ff;
          color: #070d18;
          font-weight: 600;
          padding: 11px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .submitBtn:hover:not(:disabled) {
          opacity: 0.9;
        }

        .submitBtn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cancelBtn {
          background: transparent;
          border: 1px solid #223047;
          color: #8ea2c4;
          padding: 11px 16px;
          border-radius: 8px;
          cursor: pointer;
        }

        .cancelBtn:hover {
          color: #ffffff;
          border-color: #8ea2c4;
        }

        .list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-height: 700px;
          overflow-y: auto;
          padding-right: 6px;
        }

        .itemCard {
          background: #0b111e;
          border: 1px solid #223047;
          border-radius: 10px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: border-color 0.2s;
        }

        .itemCard:hover {
          border-color: #3b506d;
        }

        .itemTop {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .photoWrapper {
          width: 58px;
          height: 58px;
          border-radius: 10px;
          overflow: hidden;
          background: #172338;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .patronImg {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photoPlaceholder {
          color: #00d5ff;
          font-size: 22px;
          font-weight: bold;
        }

        .itemInfo {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .serialBadge {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          color: #00d5ff;
          background: rgba(0, 213, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          align-self: flex-start;
          margin-bottom: 2px;
        }

        .itemInfo h4 {
          font-size: 15px;
          color: #ffffff;
          margin: 0;
        }

        .primaryDesig {
          font-size: 13px;
          color: #00d5ff;
          font-weight: 500;
          margin: 0;
        }

        .secondaryDesig {
          font-size: 12px;
          color: #94a3b8;
          margin: 0;
        }

        .areaTag {
          font-size: 11px;
          color: #64748b;
          margin-top: 2px;
        }

        .itemActions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid #1c293d;
          padding-top: 10px;
          gap: 8px;
        }

        .statusPill {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }

        .statusPill.active {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .statusPill.inactive {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .actionButtons {
          display: flex;
          gap: 8px;
        }

        .editBtn {
          background: #172338;
          border: 1px solid #2b3d58;
          color: #00d5ff;
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          font-weight: 500;
        }

        .editBtn:hover {
          background: #20314f;
        }

        .deleteBtn {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #ef4444;
          padding: 5px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          font-weight: 500;
        }

        .deleteBtn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .emptyMessage {
          color: #64748b;
          font-size: 14px;
          text-align: center;
          padding: 24px;
        }
      `}</style>
    </div>
  );
}

