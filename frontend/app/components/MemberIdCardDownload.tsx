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
    return { day: "", suffix: "", monthYear: "Not specified", isFormatted: false };
  }

  const dateOnly = value.split("T")[0];
  const parts = dateOnly.split("-").map(Number);
  let date: Date;

  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) {
    return { day: "", suffix: "", monthYear: "Not specified", isFormatted: false };
  }

  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const month = date.toLocaleDateString("en-GB", {
    month: "long",
    timeZone: "UTC",
  });

  const getSuffix = (d: number) => {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return {
    day: String(day),
    suffix: getSuffix(day),
    monthYear: `${month}, ${year}`,
    isFormatted: true,
  };
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
        width: 591,
        height: 1004,
        skipAutoScale: true,
      });

      const safeName =
        createSafeFileName(member.name || member.memberId) || "member";

      const downloadLink = document.createElement("a");

      downloadLink.download = `${safeName}-odmm-id-card.png`;
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

  const validity = formatValidUpto(member.validUpto);

  return (
    <div className="memberIdDownloadSection">
      <div className="memberIdCardCaptureArea" aria-hidden="true">
        <div ref={idCardRef} className="memberIdCard">
          {/* Top Decorative Background Waves */}
          <svg
            className="memberIdCardTopBg"
            viewBox="0 0 591 480"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Yellow Swoop */}
            <path
              d="M 0,0 L 591,0 L 591,352 C 500,412 400,437 295.5,437 C 191,437 91,412 0,352 Z"
              fill="#FAD02C"
            />
            {/* Maroon Header */}
            <path
              d="M 0,0 L 591,0 L 591,310 C 500,370 400,395 295.5,395 C 191,395 91,370 0,310 Z"
              fill="#800000"
            />
          </svg>

          {/* Header Title */}
          <div className="memberIdCardHeader">
            <h1>ODISHA DIGITAL</h1>
            <h2>MEDIA MAHASANGHA</h2>
          </div>

          {/* Vertical PRESS Text */}
          <div className="memberIdCardPress">
            <span className="pressP">P</span>
            <span className="pressR">R</span>
            <span className="pressE">E</span>
            <span className="pressS1">S</span>
            <span className="pressS2">S</span>
          </div>

          {/* Center Member Photo */}
          <div className="memberIdCardPhoto">
            {downloadPhotoUrl ? (
              <img src={downloadPhotoUrl} alt={member.name} />
            ) : (
              <div className="memberIdCardPhotoFallback">
                <span>{member.name?.charAt(0).toUpperCase() || "M"}</span>
              </div>
            )}
          </div>

          {/* Member Name and Designation */}
          <div className="memberIdCardIdentity">
            <h3 className="memberIdCardName">
              {member.name || "Member Name"}
            </h3>
            <p className="memberIdCardDesignation">
              {member.designation || "Member"}
            </p>
          </div>

          {/* Details Table */}
          <div className="memberIdCardDetails">
            <div className="memberIdCardRow">
              <span className="memberIdCardLabel">ID No</span>
              <span className="memberIdCardColon">:</span>
              <span className="memberIdCardValue">{member.memberId}</span>
            </div>

            <div className="memberIdCardRow">
              <span className="memberIdCardLabel">District</span>
              <span className="memberIdCardColon">:</span>
              <span className="memberIdCardValue">{member.district}</span>
            </div>

            <div className="memberIdCardRow">
              <span className="memberIdCardLabel">Phone</span>
              <span className="memberIdCardColon">:</span>
              <span className="memberIdCardValue">{member.mobileNumber}</span>
            </div>

            <div className="memberIdCardRow">
              <span className="memberIdCardLabel">Validity</span>
              <span className="memberIdCardColon">:</span>
              <span className="memberIdCardValue">
                {validity.isFormatted ? (
                  <>
                    {validity.day}
                    <sup>{validity.suffix}</sup> {validity.monthYear}
                  </>
                ) : (
                  validity.monthYear
                )}
              </span>
            </div>
          </div>

          {/* Authority and ODMM Logo */}
          <div className="memberIdCardAuthoritySection">
            <div className="memberIdCardLogo">
              <img
                src="/odmm-logo.png"
                alt="Odisha Digital Media Mahasangha"
              />
            </div>

            <div className="memberIdCardAuthority">
              <div className="memberIdCardAuthTitle">Issuing Authority</div>
              <div className="memberIdCardAuthLine" />
              <div className="memberIdCardAuthName">Manoj Satapathy</div>
              <div className="memberIdCardAuthRole">State President</div>
            </div>
          </div>

          {/* Contact Footer */}
          <div className="memberIdCardFooter">
            <div>+91 78529 22654</div>
            <div>odmmdigital@gmail.com</div>
            <div>www.mediamahasangha.in</div>
          </div>

          {/* Bottom Yellow Swoop */}
          <svg
            className="memberIdCardBottomBg"
            viewBox="0 0 591 108"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M 0,0 Q 25,91 50,91 L 541,91 Q 566,91 591,0 L 591,108 L 0,108 Z"
              fill="#FAD02C"
            />
          </svg>
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
