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

function formatValidUpto(value?: string) {
  if (!value) {
    return "Not specified";
  }

  const dateOnly = value.split("T")[0];
  const [year, month, day] = dateOnly.split("-").map(Number);

  if (!year || !month || !day) {
    return "Not specified";
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

async function convertImageToDataUrl(imageUrl: string) {
  const response = await fetch(imageUrl, {
    method: "GET",
    mode: "cors",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Unable to load member photo: ${response.status}`);
  }

  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Unable to convert member photo"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Unable to read member photo"));
    };

    reader.readAsDataURL(blob);
  });
}

export default function MemberIdCardDownload({
  member,
}: MemberIdCardDownloadProps) {
  const idCardRef = useRef<HTMLDivElement>(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadPhotoUrl, setDownloadPhotoUrl] = useState(
    member.photo?.url || "",
  );

  const waitForImages = async (element: HTMLElement) => {
    const images = Array.from(element.querySelectorAll("img"));

    await Promise.all(
      images.map((image) => {
        if (image.complete && image.naturalWidth > 0) {
          return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          image.onload = () => resolve();
          image.onerror = () => resolve();
        });
      }),
    );
  };

  const downloadIdCard = async () => {
    if (!idCardRef.current || isDownloading) {
      return;
    }

    try {
      setIsDownloading(true);

      let preparedPhotoUrl = member.photo?.url || "";

      if (member.photo?.url) {
        try {
          preparedPhotoUrl = await convertImageToDataUrl(member.photo.url);

          setDownloadPhotoUrl(preparedPhotoUrl);

          // Allow React to update the hidden card image.
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => resolve());
            });
          });
        } catch (photoError) {
          console.error("Member photo could not be converted:", photoError);

          /*
           * Continue without the external photo instead of failing
           * the entire ID-card download.
           */
          preparedPhotoUrl = "";
          setDownloadPhotoUrl("");

          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => resolve());
            });
          });
        }
      }

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      await waitForImages(idCardRef.current);

      const dataUrl = await toPng(idCardRef.current, {
        quality: 1,
        pixelRatio: 1,
        cacheBust: false,
        backgroundColor: "#ffffff",
        width: 1011,
        height: 638,
        skipAutoScale: true,
      });

      const safeName =
        createSafeFileName(member.name || member.memberId) || "member";

      const downloadLink = document.createElement("a");

      downloadLink.download = `${safeName}-odmm-atm-id-card.png`;
      downloadLink.href = dataUrl;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
    } catch (error) {
      console.error("ID card download failed:", error);

      alert("The ID card could not be downloaded. Please try again.");
    } finally {
      setDownloadPhotoUrl(member.photo?.url || "");
      setIsDownloading(false);
    }
  };

  return (
    <div className="memberIdDownloadSection">
      <div className="memberIdCardCaptureArea" aria-hidden="true">
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
              {downloadPhotoUrl ? (
                <img src={downloadPhotoUrl} alt={member.name} />
              ) : (
                <span>{member.name?.charAt(0).toUpperCase() || "M"}</span>
              )}
            </div>

            <div className="memberAtmInformation">
              <h3>{member.name}</h3>

              <div className="memberAtmDetails">
                <div>
                  <strong>Member ID</strong>
                  <span>{member.memberId}</span>
                </div>

                <div>
                  <strong>Designation</strong>
                  <span>{member.designation}</span>
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
              <strong>{formatValidUpto(member.validUpto)}</strong>
            </div>

            <div className="memberAtmPresident">
              <span className="memberAtmSignatureMark">Sd/-</span>
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
