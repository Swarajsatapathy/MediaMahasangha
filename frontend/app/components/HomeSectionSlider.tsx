"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type Props = {
  title: string;
  items: any[];
  type:
  | "members"
  | "memberNewsChannels"
  | "mentors"
  | "supremeCouncil"
  | "womenCell"
  | "articles"
  | "videos"
  | "srbMembers"
  | "gallery"
  | "notices";
  badge?: string;
};

export default function HomeSectionSlider({
  title,
  items,
  type,
  badge,
}: Props) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const total = items.length;

  const prev = () => {
    if (total <= 1) return;

    setDirection("prev");
    setIndex((oldIndex) => (oldIndex === 0 ? total - 1 : oldIndex - 1));
  };

  const next = () => {
    if (total <= 1) return;

    setDirection("next");
    setIndex((oldIndex) => (oldIndex === total - 1 ? 0 : oldIndex + 1));
  };

  useEffect(() => {
    if (total <= 1) return;

    const timer = setInterval(() => {
      setDirection("next");
      setIndex((oldIndex) => (oldIndex === total - 1 ? 0 : oldIndex + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, [total]);

  const item = total > 0 ? items[index] : null;

  if (type === "members") {
    return (
      <section className="homeBlock">
        <div className="blockHeader">
          <h2>{title}</h2>

          <div className="arrows">
            <button type="button" onClick={prev} aria-label="Previous">
              <FaChevronLeft />
            </button>

            <button type="button" onClick={next} aria-label="Next">
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="sliderStage">
          <div
            key={item?._id || index}
            className={`sliderAnimatedCard ${direction}`}
          >
            {item ? (
              <Link href={`/members/${item._id}`} className="memberHomeCard">
                <div className="memberPhotoBox">
                  {item.photo?.url ? (
                    <img src={item.photo.url} alt={item.name} />
                  ) : (
                    <span>{item.name?.charAt(0) || "M"}</span>
                  )}
                </div>

                <div className="memberInfo">
                  <p className="memberId">ID: {item.memberId}</p>
                  <h3>{item.name}</h3>
                  <p>{item.designation}</p>
                  <span className="mentorDistrict">{item.district}</span>

                  {item.mobileNumber && (
                    <p className="memberPhone">📞 {item.mobileNumber}</p>
                  )}
                </div>
              </Link>
            ) : (
              <p>No members available</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (type === "srbMembers") {
    return (
      <section className="homeBlock">
        <div className="blockHeader">
          <h2>{title}</h2>

          <div className="arrows">
            <button type="button" onClick={prev} aria-label="Previous">
              <FaChevronLeft />
            </button>

            <button type="button" onClick={next} aria-label="Next">
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="sliderStage">
          <div
            key={item?._id || index}
            className={`sliderAnimatedCard ${direction}`}
          >
            {item ? (
              <Link
                href={`/self-regulatory-body/${item._id}`}
                className="memberHomeCard"
              >
                <div className="memberPhotoBox">
                  {item.photo?.url ? (
                    <img src={item.photo.url} alt={item.name} />
                  ) : (
                    <span>{item.name?.charAt(0)?.toUpperCase() || "S"}</span>
                  )}
                </div>

                <div className="memberInfo">
                  <h3>{item.name}</h3>

                  <p>{item.designation}</p>

                  <span className="mentorDistrict">{item.district}</span>

                  {item.mobileNumber && (
                    <p className="memberPhone">📞 {item.mobileNumber}</p>
                  )}
                </div>
              </Link>
            ) : (
              <p>No SRB members available</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (type === "memberNewsChannels") {
    return (
      <section className="homeBlock">
        <div className="blockHeader">
          <h2>{title}</h2>

          <div className="arrows">
            <button type="button" onClick={prev} aria-label="Previous">
              <FaChevronLeft />
            </button>

            <button type="button" onClick={next} aria-label="Next">
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="sliderStage">
          <div
            key={item?._id || index}
            className={`sliderAnimatedCard ${direction}`}
          >
            {item ? (
              <Link
                href={`/member-news-channels/${item._id}`}
                className="memberHomeCard"
              >
                <div className="memberPhotoBox channelHomeLogo">
                  {item.photo?.url ? (
                    <img src={item.photo.url} alt={item.newsChannelName} />
                  ) : (
                    <span>
                      {item.newsChannelName?.charAt(0)?.toUpperCase() || "N"}
                    </span>
                  )}
                </div>

                <div className="memberInfo">
                  <p className="memberId">
                    ODMM Reg. No: {item.odmmRegistrationNo}
                  </p>

                  <h3>{item.newsChannelName}</h3>

                  <p>Owner: {item.ownerName}</p>

                  <span className="mentorDistrict">{item.district}</span>

                  {item.mobileNumber && (
                    <p className="memberPhone">📞 {item.mobileNumber}</p>
                  )}
                </div>
              </Link>
            ) : (
              <p>No member news channels available</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (type === "mentors") {
    return (
      <section className="homeBlock">
        <div className="blockHeader">
          <h2>{title}</h2>

          <div className="arrows">
            <button type="button" onClick={prev} aria-label="Previous">
              <FaChevronLeft />
            </button>

            <button type="button" onClick={next} aria-label="Next">
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="sliderStage">
          <div
            key={item?._id || index}
            className={`sliderAnimatedCard ${direction}`}
          >
            {item ? (
              <Link href={`/mentors/${item._id}`} className="memberHomeCard">
                <div className="memberPhotoBox">
                  {item.photo?.url ? (
                    <img src={item.photo.url} alt={item.name} />
                  ) : (
                    <span>{item.name?.charAt(0)?.toUpperCase() || "M"}</span>
                  )}
                </div>

                <div className="memberInfo">
                  <h3>{item.name}</h3>

                  <p>{item.designation}</p>

                  <span>{item.district}</span>
                </div>
              </Link>
            ) : (
              <p>No mentors available</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (type === "supremeCouncil") {
    return (
      <section className="homeBlock">
        <div className="blockHeader">
          <h2>{title}</h2>

          <div className="arrows">
            <button type="button" onClick={prev} aria-label="Previous">
              <FaChevronLeft />
            </button>

            <button type="button" onClick={next} aria-label="Next">
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="sliderStage">
          <div
            key={item?._id || index}
            className={`sliderAnimatedCard ${direction}`}
          >
            {item ? (
              <Link href={`/supreme-council/${item._id}`} className="memberHomeCard">
                <div className="memberPhotoBox">
                  {item.photo?.url ? (
                    <img src={item.photo.url} alt={item.name} />
                  ) : (
                    <span>{item.name?.charAt(0)?.toUpperCase() || "S"}</span>
                  )}
                </div>

                <div className="memberInfo">
                  <h3>{item.name}</h3>

                  <p>{item.designation}</p>

                  <span>{item.district}</span>
                </div>
              </Link>
            ) : (
              <p>No supreme council members available</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (type === "womenCell") {
    return (
      <section className="homeBlock">
        <div className="blockHeader">
          <h2>{title}</h2>

          <div className="arrows">
            <button type="button" onClick={prev} aria-label="Previous">
              <FaChevronLeft />
            </button>

            <button type="button" onClick={next} aria-label="Next">
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="sliderStage">
          <div
            key={item?._id || index}
            className={`sliderAnimatedCard ${direction}`}
          >
            {item ? (
              <Link href={`/women-cell/${item._id}`} className="memberHomeCard">
                <div className="memberPhotoBox">
                  {item.photo?.url ? (
                    <img src={item.photo.url} alt={item.name} />
                  ) : (
                    <span>{item.name?.charAt(0)?.toUpperCase() || "W"}</span>
                  )}
                </div>

                <div className="memberInfo">
                  <h3>{item.name}</h3>

                  <p>{item.designation}</p>

                  <span>{item.district}</span>
                </div>
              </Link>
            ) : (
              <p>No women cell members available</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (type === "gallery") {
    return (
      <section className="homeBlock">
        <div className="blockHeader">
          <h2>{title}</h2>

          <div className="arrows">
            <button type="button" onClick={prev} aria-label="Previous">
              <FaChevronLeft />
            </button>

            <button type="button" onClick={next} aria-label="Next">
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="sliderStage">
          {item ? (
            <Link
              key={item?._id || index}
              href={`/gallery/${item._id}`}
              className={`galleryHomeCard sliderAnimatedCard ${direction}`}
            >
              <div className="galleryHomeImage">
                {item.photo?.url ? (
                  <img
                    src={item.photo.url}
                    alt={item.description || item.district || "Gallery"}
                  />
                ) : (
                  <span>Gallery</span>
                )}
              </div>

              <div className="galleryHomeOverlay">
                <span>{item.district}</span>
                <h3>{item.description}</h3>
              </div>
            </Link>
          ) : (
            <p>No gallery photos available</p>
          )}
        </div>
      </section>
    );
  }

  if (type === "notices") {
    const isNew =
      item?.date &&
      (Date.now() - new Date(item.date).getTime()) / (1000 * 3600 * 24) <= 15;
    const formattedDate = item?.date
      ? new Date(item.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "";

    return (
      <section className="homeBlock">
        <div className="blockHeader">
          <h2>{title}</h2>

          <div className="arrows">
            <button type="button" onClick={prev} aria-label="Previous">
              <FaChevronLeft />
            </button>

            <button type="button" onClick={next} aria-label="Next">
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="sliderStage">
          {item ? (
            <div
              key={item?._id || index}
              className={`noticeHomeCard sliderAnimatedCard ${direction}`}
            >
              <div className="noticeCardTop">
                <span className="noticeBadge">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  OFFICIAL NOTICE
                </span>
                {formattedDate && (
                  <span className="noticeDate">📅 {formattedDate}</span>
                )}
              </div>

              <div className="noticeCardBody">
                <h3 className="noticeTitle">
                  {item.title}
                  {isNew && <span className="noticeNewPill">NEW</span>}
                </h3>
              </div>

              <div className="noticeCardActions">
                {item.pdf?.url ? (
                  <a
                    href={item.pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="noticeDownloadBtn"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download PDF
                  </a>
                ) : null}

                <Link href="/notice-board" className="noticeViewAllBtn">
                  All Notices →
                </Link>
              </div>
            </div>
          ) : (
            <div className="noticeHomeCard emptyNoticeCard">
              <p>No notices available</p>
              <Link href="/notice-board" className="noticeViewAllBtn">
                View Notice Board →
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  const href =
    type === "videos"
      ? item?._id
        ? `/videos/${item._id}`
        : "#"
      : item?._id
        ? `/articles/${item._id}`
        : "#";

  const imageUrl =
    type === "videos" ? item?.thumbnailUrl : item?.images?.[0]?.url;

  return (
    <section className="homeBlock">
      <div className="blockHeader">
        <h2>{title}</h2>

        <div className="arrows">
          <button type="button" onClick={prev} aria-label="Previous">
            <FaChevronLeft />
          </button>

          <button type="button" onClick={next} aria-label="Next">
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="sliderStage">
        <Link
          key={item?._id || index}
          href={href}
          className={`bigNewsCard sliderAnimatedCard ${direction}`}
        >
          {imageUrl && <img src={imageUrl} alt={item?.title || title} />}

          {type === "videos" && (
            <div className="playButton">
              <span>▶</span>
            </div>
          )}

          <div className="overlay">
            <span>{badge || title}</span>
            <h3>{item?.title || `No ${title} available`}</h3>
          </div>
        </Link>
      </div>
    </section>
  );
}
