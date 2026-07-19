"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";

type Member = {
  name: string;
  memberId: string;
  designation: string;
  district: string;
  mobileNumber: string;
  validUpto?: string;
  isActive: boolean;
  photo?: {
    url?: string;
  };
};

type MemberIdCardDownloadProps = {
  member: Member;
};

function createSafeFileName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function MemberIdCardDownload({
  member,
}: MemberIdCardDownloadProps) {
  const idCardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadIdCard = async () => {
    if (!idCardRef.current || isDownloading) return;

    try {
      setIsDownloading(true);

      // Wait for custom fonts and images to finish loading.
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const image = idCardRef.current.querySelector("img");

      if (image && !image.complete) {
        await new Promise<void>((resolve) => {
          image.onload = () => resolve();
          image.onerror = () => resolve();
        });
      }

      const dataUrl = await toPng(idCardRef.current, {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: "#ffffff",
      });

      const safeName =
        createSafeFileName(member.name || member.memberId) || "member";

      const downloadLink = document.createElement("a");

      downloadLink.download = `${safeName}-odmm-id-card.png`;
      downloadLink.href = dataUrl;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Unable to download ID card:", error);

      alert(
        "The ID card could not be downloaded. Please check the member photo or try again.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="memberIdDownloadSection">
      {/* This is the card converted into an image */}
      <div className="memberIdCardCaptureArea">
        <div ref={idCardRef} className="memberAtmIdCard">
          <div className="memberAtmCardHeader">
            <div className="memberAtmLogo">
              <img src="/odmm-logo.png" alt="Odisha Digital Media Mahasangha" />
            </div>

            <div className="memberAtmOrganization">
              <h2>Odisha Digital Media Mahasangha</h2>
              <p>Official Member Identity Card</p>
            </div>
          </div>

          <div className="memberAtmCardBody">
            <div className="memberAtmPhoto">
              {member.photo?.url ? (
                <img
                  src={member.photo.url}
                  alt={member.name}
                  crossOrigin="anonymous"
                />
              ) : (
                <span>{member.name?.charAt(0).toUpperCase() || "M"}</span>
              )}
            </div>

            <div className="memberAtmInformation">
              <h3>{member.name}</h3>

              <div className="memberAtmDetails">
                <div>
                  <strong>Designation</strong>
                  <span>{member.designation}</span>
                </div>

                <div>
                  <strong>Member ID</strong>
                  <span>{member.memberId}</span>
                </div>

                <div>
                  <strong>District</strong>
                  <span>{member.district}</span>
                </div>

                <div>
                  <strong>Mobile</strong>
                  <span>{member.mobileNumber}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="memberAtmFooter">
            <div className="memberAtmValidity">
              <small>VALID UPTO</small>

              <strong>
                {member.validUpto
                  ? new Date(member.validUpto).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      timeZone: "UTC",
                    })
                  : "Not specified"}
              </strong>
            </div>

            <div className="memberAtmPresident">
              <strong>Manoj Satapathy</strong>
              <small>State President</small>
            </div>
          </div>

          <div className="memberAtmContactFooter">
            <span>+91 78529 22654</span>
            <span className="memberAtmFooterDivider">|</span>
            <span>odmmdigital@gmail.com</span>
            <span className="memberAtmFooterDivider">|</span>
            <span>www.mediamahasangha.in</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="memberIdDownloadButton"
        onClick={downloadIdCard}
        disabled={isDownloading}
      >
        <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 3a1 1 0 0 1 1 1v9.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.42l2.3 2.3V4a1 1 0 0 1 1-1ZM5 19a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Z"
          />
        </svg>

        {isDownloading ? "Preparing ID Card..." : "Download ID Card"}
      </button>
    </div>
  );
}
