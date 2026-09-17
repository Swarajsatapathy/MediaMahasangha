"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Application = {
  _id: string;
  applicationId: string;
  name: string;
  dateOfBirth: string;
  bloodGroup: string;
  mobileNumber: string;
  whatsappNumber: string;
  email: string;
  address: string;
  district: string;
  blockOrNac: string;
  policeStation: string;
  pincode: string;
  newsAgencyName: string;
  nomineeName: string;
  photo: { url: string; key: string };
  paymentAmount: number;
  paymentDate: string;
  paymentUtr: string;
  paymentStatus: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED";
  paymentVerificationRemarks: string;
  applicationStatus: "PENDING" | "APPROVED" | "REJECTED";
  adminRemarks: string;
  memberCreated: boolean;
  memberId: string;
  createdAt: string;
};

export default function MembershipApplicationsSection() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [remarks, setRemarks] = useState("");

  const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, paymentStatusFilter, search]);

  const fetchApplications = async () => {
    const token = localStorage.getItem("odmm_admin_token");
    if (!token) return;

    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (statusFilter !== "All") query.append("status", statusFilter);
      if (paymentStatusFilter !== "All") query.append("paymentStatus", paymentStatusFilter);
      if (search) query.append("search", search);

      const res = await fetch(`${API_URL}/api/membership-applications?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok && data.data?.applications) {
        setApplications(data.data.applications);
      }
    } catch (error) {
      console.error("Failed to fetch applications", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, id: string) => {
    if (action === "reject" || action === "reject-payment") {
      if (!remarks) {
        alert("Please provide remarks for rejection.");
        return;
      }
    }
    
    if (action === "approve") {
      const confirmApprove = window.confirm("Are you sure you want to approve this membership application?");
      if (!confirmApprove) return;
    }

    const token = localStorage.getItem("odmm_admin_token");
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/membership-applications/${id}/${action}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ remarks }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Action failed");

      setMessage(`Successfully executed ${action}`);
      setRemarks("");
      setSelectedApp(null);
      fetchApplications();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const redirectToCreateMember = (applicationId: string) => {
    // Navigate to dashboard with members tab and pass applicationId
    router.push(`/dashboard?tab=members&applicationId=${applicationId}`);
  };

  return (
    <section className="applicationsSection">
      <div className="sectionTop">
        <div>
          <h1>Membership Applications</h1>
          <p>Review and verify membership applications and payments.</p>
        </div>
      </div>

      {message && <div className="message">{message}</div>}

      <div className="filters">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Application Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        
        <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)}>
          <option value="All">All Payment Statuses</option>
          <option value="PENDING_VERIFICATION">Pending Verification</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <input 
          type="text" 
          placeholder="Search by ID, Name, Mobile..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      <div className="tableContainer">
        <table className="table">
          <thead>
            <tr>
              <th>App ID</th>
              <th>Name</th>
              <th>Mobile</th>
              <th>District</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && applications.length === 0 ? (
              <tr><td colSpan={7} className="textCenter">Loading...</td></tr>
            ) : applications.length === 0 ? (
              <tr><td colSpan={7} className="textCenter">No applications found.</td></tr>
            ) : (
              applications.map((app) => (
                <tr key={app._id}>
                  <td>{app.applicationId}</td>
                  <td>{app.name}</td>
                  <td>{app.mobileNumber}</td>
                  <td>{app.district}</td>
                  <td>
                    <span className={`badge ${app.paymentStatus.toLowerCase()}`}>{app.paymentStatus.replace("_", " ")}</span>
                  </td>
                  <td>
                    <span className={`badge ${app.applicationStatus.toLowerCase()}`}>{app.applicationStatus}</span>
                  </td>
                  <td>
                    <button className="viewBtn" onClick={() => setSelectedApp(app)}>View Details</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedApp && (
        <div className="modalOverlay" onClick={() => setSelectedApp(null)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <h2>Application Details</h2>
              <button className="closeBtn" onClick={() => setSelectedApp(null)}>✕</button>
            </div>
            
            <div className="modalBody">
              <div className="detailGrid">
                <div>
                  <h3>Personal & Contact</h3>
                  <p><strong>App ID:</strong> {selectedApp.applicationId}</p>
                  <p><strong>Name:</strong> {selectedApp.name}</p>
                  <p><strong>DOB:</strong> {new Date(selectedApp.dateOfBirth).toLocaleDateString()}</p>
                  <p><strong>Blood Group:</strong> {selectedApp.bloodGroup}</p>
                  <p><strong>Mobile:</strong> {selectedApp.mobileNumber}</p>
                  <p><strong>WhatsApp:</strong> {selectedApp.whatsappNumber}</p>
                  <p><strong>Email:</strong> {selectedApp.email}</p>
                </div>
                
                <div>
                  <h3>Address & Professional</h3>
                  <p><strong>District:</strong> {selectedApp.district}</p>
                  <p><strong>Address:</strong> {selectedApp.address}</p>
                  <p><strong>PIN:</strong> {selectedApp.pincode}</p>
                  <p><strong>News Agency:</strong> {selectedApp.newsAgencyName || "N/A"}</p>
                  <p><strong>Nominee:</strong> {selectedApp.nomineeName || "N/A"}</p>
                </div>

                <div className="photoArea">
                  <h3>Photo</h3>
                  {selectedApp.photo?.url ? (
                    <img src={selectedApp.photo.url} alt="Applicant" className="applicantImg" />
                  ) : (
                    <p>No photo</p>
                  )}
                </div>
              </div>
              
              <div className="paymentSection">
                <h3>Payment Verification</h3>
                <div className="paymentGrid">
                  <div>
                    <p><strong>Amount:</strong> ₹{selectedApp.paymentAmount}</p>
                    <p><strong>Date:</strong> {new Date(selectedApp.paymentDate).toLocaleDateString()}</p>
                    <p><strong>UTR:</strong> {selectedApp.paymentUtr}</p>
                    <p><strong>Status:</strong> <span className={`badge ${selectedApp.paymentStatus.toLowerCase()}`}>{selectedApp.paymentStatus}</span></p>
                  </div>
                  <div className="actions">
                    {selectedApp.paymentStatus === "PENDING_VERIFICATION" && (
                      <>
                        <button className="btn verifyBtn" onClick={() => handleAction("verify-payment", selectedApp._id)}>Verify Payment</button>
                        <div className="rejectBox">
                          <input type="text" placeholder="Remarks for rejection" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                          <button className="btn dangerBtn" onClick={() => handleAction("reject-payment", selectedApp._id)}>Reject Payment</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="applicationSection">
                <h3>Application Decision</h3>
                <p><strong>Status:</strong> <span className={`badge ${selectedApp.applicationStatus.toLowerCase()}`}>{selectedApp.applicationStatus}</span></p>
                {selectedApp.adminRemarks && <p><strong>Remarks:</strong> {selectedApp.adminRemarks}</p>}
                
                {selectedApp.applicationStatus === "PENDING" && (
                  <div className="actions">
                    <button 
                      className="btn approveBtn" 
                      onClick={() => handleAction("approve", selectedApp._id)}
                      disabled={selectedApp.paymentStatus !== "VERIFIED"}
                      title={selectedApp.paymentStatus !== "VERIFIED" ? "Payment must be verified first" : ""}
                    >
                      Approve Application
                    </button>
                    
                    <div className="rejectBox">
                      <input type="text" placeholder="Reason for rejection" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                      <button className="btn dangerBtn" onClick={() => handleAction("reject", selectedApp._id)}>Reject Application</button>
                    </div>
                  </div>
                )}
                
                {selectedApp.applicationStatus === "APPROVED" && (
                  <div className="actions memberActions">
                    {selectedApp.memberCreated ? (
                      <div className="successAlert">
                        Member Created Successfully. Member ID: {selectedApp.memberId}
                      </div>
                    ) : (
                      <button className="btn createMemberBtn" onClick={() => redirectToCreateMember(selectedApp._id)}>
                        Continue to Create Member
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .applicationsSection { padding: 20px; background: #1e293b; border-radius: 12px; }
        .sectionTop { margin-bottom: 20px; border-bottom: 1px solid #334155; padding-bottom: 10px; }
        h1 { margin: 0; font-size: 24px; color: #f8fafc; }
        p { color: #94a3b8; margin: 4px 0 0; }
        
        .filters { display: flex; gap: 15px; margin-bottom: 20px; }
        .filters select, .filters input { padding: 8px 12px; border-radius: 6px; border: 1px solid #475569; background: #0f172a; color: #f8fafc; outline: none; }
        .filters input { flex: 1; max-width: 300px; }
        
        .tableContainer { overflow-x: auto; }
        .table { width: 100%; border-collapse: collapse; text-align: left; }
        .table th, .table td { padding: 12px; border-bottom: 1px solid #334155; }
        .table th { color: #94a3b8; font-weight: 600; }
        .table td { color: #e2e8f0; }
        .textCenter { text-align: center; }
        
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; display: inline-block; }
        .badge.pending_verification, .badge.pending { background: #fef08a; color: #854d0e; }
        .badge.verified, .badge.approved { background: #bbf7d0; color: #166534; }
        .badge.rejected { background: #fecaca; color: #991b1b; }
        
        .viewBtn { padding: 6px 12px; background: #3b82f6; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
        .viewBtn:hover { background: #2563eb; }
        
        .message { padding: 12px; background: #064e3b; color: #d1fae5; border-radius: 6px; margin-bottom: 20px; }
        
        .modalOverlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; overflow-y: auto; }
        .modalContent { background: #1e293b; width: 100%; max-width: 900px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); overflow: hidden; margin: auto; }
        .modalHeader { padding: 20px; border-bottom: 1px solid #334155; display: flex; justify-content: space-between; align-items: center; }
        .modalHeader h2 { margin: 0; color: #f8fafc; }
        .closeBtn { background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; }
        
        .modalBody { padding: 20px; max-height: 80vh; overflow-y: auto; }
        .detailGrid { display: grid; grid-template-columns: 1fr 1fr 200px; gap: 20px; padding-bottom: 20px; border-bottom: 1px solid #334155; }
        .detailGrid h3, .paymentSection h3, .applicationSection h3 { margin-top: 0; color: #cbd5e1; font-size: 16px; border-bottom: 1px solid #334155; padding-bottom: 8px; }
        .detailGrid p, .paymentSection p { margin: 6px 0; color: #94a3b8; font-size: 14px; }
        .detailGrid strong, .paymentSection strong { color: #e2e8f0; }
        
        .applicantImg { width: 100%; height: auto; border-radius: 8px; border: 2px solid #475569; }
        
        .paymentSection, .applicationSection { margin-top: 20px; padding-bottom: 20px; border-bottom: 1px solid #334155; }
        .applicationSection { border-bottom: none; }
        
        .paymentGrid { display: flex; justify-content: space-between; gap: 20px; }
        .actions { display: flex; flex-direction: column; gap: 10px; min-width: 300px; }
        .btn { padding: 10px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; color: #fff; }
        .verifyBtn { background: #10b981; }
        .approveBtn { background: #3b82f6; }
        .approveBtn:disabled { background: #475569; cursor: not-allowed; }
        .dangerBtn { background: #ef4444; margin-top: 6px; width: 100%; }
        
        .rejectBox { display: flex; flex-direction: column; gap: 4px; border: 1px dashed #ef4444; padding: 10px; border-radius: 6px; }
        .rejectBox input { padding: 8px; border-radius: 4px; border: 1px solid #ef4444; background: #450a0a; color: #fecaca; }
        
        .createMemberBtn { background: #8b5cf6; width: 100%; padding: 12px; font-size: 16px; }
        .successAlert { padding: 12px; background: #064e3b; border: 1px solid #059669; color: #d1fae5; border-radius: 6px; font-weight: 600; text-align: center; }
        
        @media (max-width: 768px) {
          .detailGrid { grid-template-columns: 1fr; }
          .paymentGrid { flex-direction: column; }
          .filters { flex-direction: column; gap: 10px; }
          .filters select, .filters input { max-width: 100%; width: 100%; }
        }
      `}</style>
    </section>
  );
}
