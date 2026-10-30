"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import CardShare from "../components/CardShare";

type Article = {
  _id: string;
  title: string;
  district?: string;
  reporter?: string;
  images?: { url: string; key?: string }[];
  isPublished?: boolean;
  publishedAt?: string;
  createdAt?: string;
};

type WebNewsDirectoryProps = {
  initialArticles: Article[];
};

const ARTICLES_PER_PAGE = 12;

export default function WebNewsDirectory({
  initialArticles,
}: WebNewsDirectoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalArticles = initialArticles.length;
  const totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE) || 1;
  const validPage = Math.min(Math.max(currentPage, 1), totalPages);

  const currentArticles = initialArticles.slice(
    (validPage - 1) * ARTICLES_PER_PAGE,
    validPage * ARTICLES_PER_PAGE
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
    <div ref={containerRef} className="webNewsDirectoryContainer">
      <section className="listingGrid">
        {currentArticles.length > 0 ? (
          currentArticles.map((article) => (
            <div className="listingCard" key={article._id}>
              <Link
                href={`/articles/${article._id}`}
                className="listingCardMedia"
                aria-label={article.title}
              >
                {article.images?.[0]?.url && (
                  <img
                    src={article.images[0].url}
                    alt={article.title}
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </Link>

              <div className="listingBody">
                <Link
                  href={`/articles/${article._id}`}
                  className="listingCardTitleLink"
                >
                  <span>Web News</span>
                  <h2>{article.title}</h2>
                </Link>

                <div className="listingCardFooter">
                  <p>
                    {article.district} • {article.reporter}
                  </p>

                  <CardShare
                    title={article.title}
                    url={`/articles/${article._id}`}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="emptyListing">No web news available.</p>
        )}
      </section>

      {totalArticles > ARTICLES_PER_PAGE && (
        <nav className="webNewsPagination" aria-label="Web news pagination">
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

