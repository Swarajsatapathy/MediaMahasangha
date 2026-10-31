"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CardShare from "./CardShare";
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
  | "notices"
  | "patrons";
  badge?: string;
  className?: string;
};

export default function HomeSectionSlider({
  title,
  items,
  type,
  badge,
  className = "",
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
      <section className={`homeBlock ${className}`.trim()}>
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
                    <img src={item.photo.url} alt={item.name} loading="lazy" decoding="async" />
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
      <section className={`homeBlock ${className}`.trim()}>
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
                    <img src={item.photo.url} alt={item.name} loading="lazy" decoding="async" />
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
      <section className={`homeBlock ${className}`.trim()}>
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
                    <img src={item.photo.url} alt={item.newsChannelName} loading="lazy" decoding="async" />
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

  if (type === "patrons") {
    return (
      <section className={`homeBlock ${className}`.trim()}>
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
              <Link href={`/chief-patron/${item._id}`} className="memberHomeCard">
                <div className="memberPhotoBox">
                  {item.photo?.url ? (
                    <img src={item.photo.url} alt={item.name} loading="lazy" decoding="async" />
                  ) : (
                    <span>{item.name?.charAt(0)?.toUpperCase() || "P"}</span>
                  )}
                </div>

                <div className="memberInfo">
                  <h3>{item.name}</h3>

                  <p
                    style={{
                      color: /chief patron/i.test(item.designation || "")
                        ? "var(--navy, #003366)"
                        : undefined,
                      fontWeight: /chief patron/i.test(item.designation || "") ? 700 : undefined,
                    }}
                  >
                    {item.designation}
                  </p>

                  {item.designation2 && (
                    <p
                      style={{
                        fontSize: "12.5px",
                        color: "var(--navy, #003366)",
                        fontWeight: 700,
                      }}
                    >
                      {item.designation2}
                    </p>
                  )}

                  {(item.area || item.district) && (
                    <span>{item.area || item.district}</span>
                  )}
                </div>
              </Link>
            ) : (
              <p>No chief patrons available</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (type === "mentors") {
    return (
      <section className={`homeBlock ${className}`.trim()}>
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
                    <img src={item.photo.url} alt={item.name} loading="lazy" decoding="async" />
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
      <section className={`homeBlock ${className}`.trim()}>
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
                    <img src={item.photo.url} alt={item.name} loading="lazy" decoding="async" />
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
      <section className={`homeBlock ${className}`.trim()}>
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
                    <img src={item.photo.url} alt={item.name} loading="lazy" decoding="async" />
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
      <section className={`homeBlock ${className}`.trim()}>
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
                  <img src={item.photo.url} alt={item.description || item.district || "Gallery"} loading="lazy" decoding="async" />
                ) : (
                  <span>Gallery</span>
                )}
              </div>

              <div className="galleryHomeOverlay">
                {item.district && <span>{item.district}</span>}
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
    const list = items || [];
    if (list.length === 0) {
      return (
        <section className={`homeBlock ${className}`.trim()}>
          <div className="blockHeader">
            <h2>{title}</h2>
            <Link href="/notice-board" className="noticeHeaderViewAll">
              View All →
            </Link>
          </div>

          <div className="sliderStage">
            <div className="noticeTickerEmpty">
              <p>No notices available</p>
              <Link href="/notice-board" className="noticeEmptyBtn">
                View Notice Board →
              </Link>
            </div>
          </div>
        </section>
      );
    }

    // Build seamless looping list (at least 6 items for smooth continuous vertical scrolling)
    const loopList =
      list.length < 3
        ? [...list, ...list, ...list, ...list]
        : list.length < 6
        ? [...list, ...list, ...list]
        : [...list, ...list];

    // Speed: approx 4 seconds per notice in the primary list
    const duration = Math.max(16, list.length * 4);

    return (
      <section className={`homeBlock ${className}`.trim()}>
        <div className="blockHeader">
          <h2>{title}</h2>
          <Link href="/notice-board" className="noticeHeaderViewAll">
            View All →
          </Link>
        </div>

        <div className="sliderStage">
          <div className="noticeVerticalTickerWrap">
            <div
              className="noticeVerticalTickerTrack"
              style={{ animationDuration: `${duration}s` }}
            >
              {loopList.map((notif: any, i: number) => {
                const isNew =
                  notif?.date &&
                  (Date.now() - new Date(notif.date).getTime()) /
                    (1000 * 3600 * 24) <=
                    15;
                const formattedDate = notif?.date
                  ? new Date(notif.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "";
                const href = notif.pdf?.url || "/notice-board";
                const isExternal = Boolean(notif.pdf?.url);

                return (
                  <a
                    key={`${notif._id || i}-${i}`}
                    href={href}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="noticeTickerItem"
                  >
                    <div className="noticeTickerItemHeader">
                      <span className="noticeBulletDot">●</span>
                      <span className="noticeTickerTitle">{notif.title}</span>
                      {isNew && <span className="noticeNewPill">NEW</span>}
                    </div>
                    <div className="noticeTickerItemMeta">
                      {formattedDate && (
                        <span className="noticeTickerDate">
                          📅 {formattedDate}
                        </span>
                      )}
                      {notif.pdf?.url && (
                        <span className="noticeTickerPdfTag">
                          <svg
                            width="11"
                            height="11"
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
                          PDF
                        </span>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
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
    <section className={`homeBlock ${className}`.trim()}>
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
          className={`bigNewsCard sliderAnimatedCard ${direction}`}
        >
          <Link href={href} className="bigNewsCardLink" aria-label={item?.title || title}>
            {imageUrl && <img src={imageUrl} alt={item?.title || title} loading="lazy" decoding="async" />}

            {type === "videos" && (
              <div className="playButton">
                <span>▶</span>
              </div>
            )}
          </Link>

          <div className="overlay">
            <Link href={href} className="overlayTextLink">
              <span>{badge || title}</span>
              <h3>{item?.title || `No ${title} available`}</h3>
            </Link>

            {(type === "articles" || type === "videos") && item?._id && (
              <div className="sliderShareWrapper">
                <CardShare
                  title={item?.title || title}
                  url={href}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
