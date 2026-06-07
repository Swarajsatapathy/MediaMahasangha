"use client";

import { useEffect, useState } from "react";
import {
  FaFacebookF,
  FaWhatsapp,
  FaTelegramPlane,
  FaLinkedinIn,
  FaEnvelope,
  FaLink,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { BsThreeDots } from "react-icons/bs";

type SocialShareProps = {
  title: string;
};

export default function SocialShare({ title }: SocialShareProps) {
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = async () => {
    if (!shareUrl) return;

    await navigator.clipboard.writeText(shareUrl);
    alert("Link copied");
  };

  const nativeShare = async () => {
    if (!shareUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
      } catch {
        // user cancelled share
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="shareRow">
      <span className="shareText">Share:</span>

      <a
        className="shareIcon facebook"
        href={
          shareUrl
            ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
            : "#"
        }
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
      >
        <FaFacebookF />
      </a>

      <a
        className="shareIcon twitter"
        href={
          shareUrl
            ? `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
            : "#"
        }
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
      >
        <FaXTwitter />
      </a>

      <a
        className="shareIcon whatsapp"
        href={
          shareUrl
            ? `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`
            : "#"
        }
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
      >
        <FaWhatsapp />
      </a>

      <a
        className="shareIcon telegram"
        href={
          shareUrl
            ? `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
            : "#"
        }
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Telegram"
      >
        <FaTelegramPlane />
      </a>

      <a
        className="shareIcon linkedin"
        href={
          shareUrl
            ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
            : "#"
        }
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
      >
        <FaLinkedinIn />
      </a>

      <a
        className="shareIcon email"
        href={
          shareUrl
            ? `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A%0A${encodedUrl}`
            : "#"
        }
        aria-label="Share by Email"
      >
        <FaEnvelope />
      </a>

      <button
        type="button"
        className="shareIcon copy"
        onClick={copyLink}
        aria-label="Copy link"
      >
        <FaLink />
      </button>

      <button
        type="button"
        className="shareMore"
        onClick={nativeShare}
        aria-label="More share options"
      >
        <BsThreeDots />
      </button>
    </div>
  );
}