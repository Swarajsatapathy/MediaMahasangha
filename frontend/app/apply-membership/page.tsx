"use client";

import { useState } from "react";
import Image from "next/image";

const DISTRICTS = [
  "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak",
  "Bhubaneswar", "Boudh", "Cuttack", "Deogarh", "Dhenkanal",
  "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda",
  "Kalahandi", "Kandhamal", "Kendrapara", "Keonjhar", "Khordha",
  "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh",
  "Nuapada", "Puri", "Rayagada", "Rourkela", "Sambalpur",
  "Subarnapur", "Sundargarh"
];

export default function ApplyMembershipPage() {
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    bloodGroup: "",
    mobileNumber: "",
    whatsappNumber: "",
    whatsappSameAsMobile: false,
    email: "",
    address: "",
    district: "",
    blockOrNac: "",
    policeStation: "",
    pincode: "",
    newsAgencyName: "",
    nomineeName: "",
    paymentDate: "",
    paymentUtr: "",
    declarationAccepted: false,
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => {
        const newData = { ...prev, [name]: checked };
        if (name === "whatsappSameAsMobile" && checked) {
          newData.whatsappNumber = prev.mobileNumber;
        }
        return newData;
      });
    } else {
      setFormData((prev) => {
        const newData = { ...prev, [name]: value };
        if (name === "mobileNumber" && prev.whatsappSameAsMobile) {
          newData.whatsappNumber = value;
        }
        return newData;
      });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage("Photo size should not exceed 5MB.");
        return;
      }
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        setMessage("Only JPG, JPEG, and PNG formats are allowed.");
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setMessage("");
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    const fileInput = document.getElementById("photoUpload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!photo) {
      setMessage("Please upload a photo.");
      return;
    }

    setLoading(true);
    
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.toString());
      });
      submitData.append("photo", photo);

      const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      const res = await fetch(`${API_URL}/api/membership-applications`, {
        method: "POST",
        body: submitData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit application");
      }

      setIsSuccess(true);
      setApplicationId(data.data.application.applicationId);
    } catch (err: any) {
      setMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="applyPage">
        <div className="container successContainer">
          <h1>Application Submitted Successfully</h1>
          <p>Thank you for applying for ODMM membership.</p>
          
          <div className="appDetails">
            <p><strong>Application ID:</strong> {applicationId}</p>
            <p><strong>Payment Details:</strong> ₹300 (UTR: {formData.paymentUtr})</p>
            <p><strong>Status:</strong> Application submitted and pending verification/review.</p>
          </div>
          <p className="notice">Please keep your Application ID for future reference.</p>
        </div>
        <style jsx>{`
          .applyPage { background: #f8fafc; min-height: 100vh; padding: 60px 20px; }
          .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
          .successContainer { text-align: center; }
          .successContainer h1 { color: #16a34a; font-size: 28px; margin-bottom: 10px; }
          .appDetails { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left; border: 1px solid #bbf7d0; }
          .appDetails p { margin: 8px 0; font-size: 16px; }
          .notice { color: #64748b; font-size: 14px; }
        `}</style>
      </main>
    );
  }

  return (
    <main className="applyPage">
      <div className="container">
        <h1>ODMM Membership Application</h1>
        <p className="subtitle">Fill out the form below to apply for membership.</p>

        {message && <div className="errorMsg">{message}</div>}

        <form onSubmit={handleSubmit} className="applyForm">
          
          <section className="formSection">
            <h2>Personal Details</h2>
            <div className="grid">
              <div className="field">
                <label>Full Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Date of Birth *</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required max={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="field">
                <label>Blood Group *</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
                  <option value="">Select</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="formSection">
            <h2>Contact Details</h2>
            <div className="grid">
              <div className="field">
                <label>Mobile Number *</label>
                <input type="tel" name="mobileNumber" pattern="[0-9]{10}" maxLength={10} value={formData.mobileNumber} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>WhatsApp Number *</label>
                <input type="tel" name="whatsappNumber" pattern="[0-9]{10}" maxLength={10} value={formData.whatsappNumber} onChange={handleChange} required readOnly={formData.whatsappSameAsMobile} className={formData.whatsappSameAsMobile ? "readonly" : ""} />
                <label className="checkboxLabel mt-2">
                  <input type="checkbox" name="whatsappSameAsMobile" checked={formData.whatsappSameAsMobile} onChange={handleChange} />
                  Same as Mobile Number
                </label>
              </div>
              <div className="field">
                <label>Email ID *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
            </div>
          </section>

          <section className="formSection">
            <h2>Address Details</h2>
            <div className="field fullWidth">
              <label>Full Address *</label>
              <textarea name="address" value={formData.address} onChange={handleChange} required rows={3}></textarea>
            </div>
            <div className="grid">
              <div className="field">
                <label>District *</label>
                <select name="district" value={formData.district} onChange={handleChange} required>
                  <option value="">Select District</option>
                  {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Block/NAC *</label>
                <input type="text" name="blockOrNac" value={formData.blockOrNac} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Police Station *</label>
                <input type="text" name="policeStation" value={formData.policeStation} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Pincode *</label>
                <input type="text" name="pincode" pattern="[0-9]{6}" maxLength={6} value={formData.pincode} onChange={handleChange} required />
              </div>
            </div>
          </section>

          <section className="formSection">
            <h2>Professional Details</h2>
            <div className="field fullWidth">
              <label>Name of News Agency *</label>
              <input type="text" name="newsAgencyName" value={formData.newsAgencyName} onChange={handleChange} required />
            </div>
          </section>

          <section className="formSection">
            <h2>Nominee Details</h2>
            <div className="field fullWidth">
              <label>Name of Nominee *</label>
              <input type="text" name="nomineeName" value={formData.nomineeName} onChange={handleChange} required />
            </div>
          </section>

          <section className="formSection">
            <h2>Photo Upload *</h2>
            <div className="photoUploadArea">
              <input type="file" id="photoUpload" accept=".jpg,.jpeg,.png" onChange={handlePhotoChange} className="fileInput" />
              <label htmlFor="photoUpload" className="uploadBtn">Choose Photo</label>
              <p className="helpText">JPG / JPEG / PNG. Max size: 5 MB</p>
              
              {photoPreview && (
                <div className="previewBox">
                  <Image src={photoPreview} alt="Preview" width={100} height={100} className="previewImg" />
                  <div className="previewActions">
                    <button type="button" className="btnSmall" onClick={() => document.getElementById("photoUpload")?.click()}>Change</button>
                    <button type="button" className="btnSmall btnDanger" onClick={removePhoto}>Remove</button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="formSection paymentSection">
            <h2>Payment Details *</h2>
            <div className="paymentBox">
              <div className="paymentHeader">
                <h3>Membership Application Fee</h3>
                <div className="amount">₹300</div>
              </div>
              
              <div className="qrCodeArea">
                <div className="qrImageContainer">
                  <Image 
                    src="/sbi-qr.png" 
                    alt="ODMM SBI QR Code" 
                    width={200}
                    height={200}
                    className="qrImage"
                  />
                </div>
                <p className="upiIdText"><strong>UPI ID:</strong> 45152766635@sbi</p>
                <p>Scan the QR code using your UPI app to pay ₹300.</p>

              </div>

              <div className="grid">
                <div className="field">
                  <label>Payment Date *</label>
                  <input type="date" name="paymentDate" value={formData.paymentDate} onChange={handleChange} required max={new Date().toISOString().split("T")[0]} />
                </div>
                <div className="field">
                  <label>Amount Paid *</label>
                  <input type="text" value="₹300" readOnly className="readonly" />
                </div>
                <div className="field">
                  <label>UTR / Transaction Reference No. *</label>
                  <input type="text" name="paymentUtr" value={formData.paymentUtr} onChange={handleChange} required />
                </div>
              </div>

            </div>
          </section>

          <section className="formSection declarationSection">
            <label className="checkboxLabel">
              <input type="checkbox" name="declarationAccepted" checked={formData.declarationAccepted} onChange={handleChange} required />
              I confirm that the information provided by me is true and correct and may be verified by Odisha Digital Media Mahasangha (ODMM) for membership purposes.
            </label>
          </section>

          <button type="submit" className="submitBtn" disabled={loading}>
            {loading ? "Submitting Application..." : "Submit Membership Application"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .applyPage { background: #f8fafc; min-height: 100vh; padding: 60px 20px; font-family: system-ui, sans-serif; }
        .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        h1 { font-size: 28px; margin: 0 0 10px; color: #0f172a; text-align: center; }
        .subtitle { text-align: center; color: #64748b; margin-bottom: 30px; }
        
        .formSection { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0; }
        .formSection h2 { font-size: 18px; color: #334155; margin-bottom: 20px; }
        
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; }
        
        .field { display: flex; flex-direction: column; gap: 6px; }
        .fullWidth { grid-column: 1 / -1; }
        
        label { font-size: 14px; font-weight: 600; color: #475569; }
        input[type="text"], input[type="date"], input[type="tel"], input[type="email"], select, textarea {
          padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 15px; outline: none; transition: border 0.2s;
        }
        input:focus, select:focus, textarea:focus { border-color: #3b82f6; }
        input.readonly { background: #f1f5f9; color: #64748b; cursor: not-allowed; }
        
        .checkboxLabel { display: flex; align-items: flex-start; gap: 8px; font-weight: normal; font-size: 14px; cursor: pointer; }
        .mt-2 { margin-top: 8px; }
        
        .photoUploadArea { background: #f8fafc; border: 1px dashed #cbd5e1; padding: 20px; border-radius: 8px; text-align: center; }
        .fileInput { display: none; }
        .uploadBtn { display: inline-block; background: #e2e8f0; color: #334155; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; margin-bottom: 10px; }
        .helpText { font-size: 13px; color: #64748b; margin: 0; }
        
        .previewBox { margin-top: 15px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .previewImg { border-radius: 6px; object-fit: cover; border: 1px solid #e2e8f0; }
        .previewActions { display: flex; gap: 10px; }
        .btnSmall { padding: 4px 10px; font-size: 13px; border-radius: 4px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; }
        .btnDanger { color: #ef4444; border-color: #ef4444; }
        
        .paymentBox { background: #f0f9ff; border: 1px solid #bae6fd; padding: 24px; border-radius: 8px; }
        .paymentHeader { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e0f2fe; padding-bottom: 15px; }
        .paymentHeader h3 { margin: 0; font-size: 18px; color: #0369a1; }
        .amount { font-size: 24px; font-weight: bold; color: #0284c7; }
        
        .qrCodeArea { text-align: center; margin-bottom: 30px; }
        .qrImageContainer { margin: 0 auto 15px; padding: 10px; background: #fff; display: inline-block; border-radius: 8px; border: 1px solid #bae6fd; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .qrImage { display: block; width: 200px; height: 200px; }
        .upiIdText { font-size: 16px; color: #0f172a; margin-bottom: 10px; }


        
        .declarationSection { border-bottom: none; }
        
        .submitBtn { width: 100%; padding: 14px; background: #2563eb; color: #fff; font-size: 16px; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
        .submitBtn:hover:not(:disabled) { background: #1d4ed8; }
        .submitBtn:disabled { background: #94a3b8; cursor: not-allowed; }
        
        .errorMsg { background: #fef2f2; border: 1px solid #fecaca; color: #ef4444; padding: 12px; border-radius: 6px; margin-bottom: 20px; font-weight: 500; }
        
        @media (max-width: 600px) {
          .container { padding: 20px; }
          .paymentHeader { flex-direction: column; align-items: flex-start; gap: 10px; }
        }
      `}</style>
    </main>
  );
}
