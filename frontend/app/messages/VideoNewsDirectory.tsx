"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import CardShare from "../components/CardShare";

type Video = {
  _id: string;
  title: string;
  district?: string;
  reporter?: string;
  thumbnailUrl?: string;
  youtubeUrl?: string;
  isPublished?: boolean;
  publishedAt?: string;
  createdAt?: string;
};

type VideoNewsDirectoryProps = {
  initialVideos: Video[];
};

const VIDEOS_PER_PAGE = 12;

export default function VideoNewsDirectory({
  initialVideos,
}: VideoNewsDirectoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalVideos = initialVideos.length;
  const totalPages = Math.ceil(totalVideos / VIDEOS_PER_PAGE) || 1;
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);

  const currentVideos = initialVideos.slice(
    (validPage - 1) * VIDEOS_PER_PAGE,
    validPage * VIDEOS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);

    if (containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div ref={containerRef} className="videoNewsDirectoryContainer">
      <section className="listingGrid">
        {currentVideos.length > 0 ? (
          currentVideos.map((video) => (
            <div className="listingCard videoListingCard" key={video._id}>
              <Link
                href={`/videos/${video._id}`}
                className="listingCardMedia"
                aria-label={video.title}
              >
                <div className="listingVideoThumb">
                  {video.thumbnailUrl && (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      loading="lazy"
                      decoding="async"
                    />
                  )}

                  <div className="listingPlayBtn">
                    <span>▶</span>
                  </div>
                </div>
              </Link>

              <div className="listingBody">
                <Link
                  href={`/videos/${video._id}`}
                  className="listingCardTitleLink"
                >
                  <span>Video Messages</span>
                  <h2>{video.title}</h2>
                </Link>

                <div className="listingCardFooter">
                  <p>
                    {video.district} • {video.reporter}
                  </p>

                  <CardShare
                    title={video.title}
                    url={`/videos/${video._id}`}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="emptyListing">No video messages available.</p>
        )}
      </section>

      {totalVideos > VIDEOS_PER_PAGE && (
        <nav
          className="webNewsPagination"
          aria-label="Video messages pagination"
        >
          <button
            type="button"
            className="pageBtn prevBtn"
            onClick={() => handlePageChange(validPage - 1)}
            disabled={validPage === 1}
          >
            ← Previous
          </button>

          <div className="pagePills">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - validPage) <= 2
              )
              .map((p, idx, arr) => {
                const prevP = arr[idx - 1];
                return (
                  <span
                    key={p}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {prevP && p - prevP > 1 && (
                      <span className="pageEllipsis">...</span>
                    )}
                    <button
                      type="button"
                      className={`pagePill ${p === validPage ? "active" : ""}`}
                      onClick={() => handlePageChange(p)}
                      aria-label={`Go to page ${p}`}
                      aria-current={p === validPage ? "page" : undefined}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}
          </div>

          <button
            type="button"
            className="pageBtn nextBtn"
            onClick={() => handlePageChange(validPage + 1)}
            disabled={validPage === totalPages}
          >
            Next →
          </button>
        </nav>
      )}
    </div>
  );
}

