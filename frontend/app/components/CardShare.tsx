"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaWhatsapp,
  FaFacebookF,
  FaLink,
  FaCheck,
  FaShareAlt,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { BsThreeDots } from "react-icons/bs";

type CardShareProps = {
  title: string;
  url: string;
  className?: string;
};

export default function CardShare({ title, url, className = "" }: CardShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || "https://www.mediamahasangha.in";

    const cleanUrl = url.startsWith("http")
      ? url
      : `${origin}${url.startsWith("/") ? "" : "/"}${url}`;

    setShareUrl(cleanUrl);
  }, [url]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const toggleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // On mobile devices with native share support, trigger OS share sheet directly
    if (
      typeof navigator !== "undefined" &&
      navigator.share &&
      /android|iphone|ipad|mobile/i.test(navigator.userAgent)
    ) {
      navigator
        .share({
          title,
          url: shareUrl,
        })
        .catch(() => {
          // If user cancels or it fails, fallback to toggling popover
          setIsOpen((prev) => !prev);
        });
      return;
    }

    setIsOpen((prev) => !prev);
  };

  const copyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1800);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const nativeShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!shareUrl) return;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
        setIsOpen(false);
      } catch {
        // User cancelled share
      }
    } else {
      copyLink(e);
    }
  };

  return (
    <div
      className={`cardShareWrapper ${className}`.trim()}
      ref={containerRef}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <button
        type="button"
        className={`cardShareBtn ${isOpen ? "active" : ""}`}
        onClick={toggleShare}
        aria-label="Share this story"
        title="Share"
      >
        <FaShareAlt />
      </button>

      {isOpen && (
        <div
          className="cardSharePopover"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {copied && <span className="copiedToast">Copied!</span>}

          <a
            className="cardShareItem whatsapp"
            href={
              shareUrl
                ? `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`
                : "#"
            }
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on WhatsApp"
            title="Share on WhatsApp"
            onClick={() => setIsOpen(false)}
          >
            <FaWhatsapp />
          </a>

          <a
            className="cardShareItem facebook"
            href={
              shareUrl
                ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
                : "#"
            }
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Facebook"
            title="Share on Facebook"
            onClick={() => setIsOpen(false)}
          >
            <FaFacebookF />
          </a>

          <a
            className="cardShareItem twitter"
            href={
              shareUrl
                ? `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
                : "#"
            }
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on X"
            title="Share on X"
            onClick={() => setIsOpen(false)}
          >
            <FaXTwitter />
          </a>

          <button
            type="button"
            className={`cardShareItem copy ${copied ? "copied" : ""}`}
            onClick={copyLink}
            aria-label="Copy Link"
            title={copied ? "Copied!" : "Copy Link"}
          >
            {copied ? <FaCheck /> : <FaLink />}
          </button>

          {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
            <button
              type="button"
              className="cardShareItem more"
              onClick={nativeShare}
              aria-label="More share options"
              title="More Options"
            >
              <BsThreeDots />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

