"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type Props = {
  title: string;
  items: any[];
  type: "members" | "memberNewsChannels" | "mentors" | "articles" | "videos" | "srbMembers";
  badge?: string;
};

export default function HomeSectionSlider({ title, items, type, badge }: Props) {
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
    <p className="memberPhone">
      📞 {item.mobileNumber}
    </p>
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
                <p className="memberId">SL No: {item.serialNumber}</p>

                <h3>{item.name}</h3>

                <p>{item.designation}</p>

                <span className="mentorDistrict">{item.district}</span>

                {item.mobileNumber && (
                  <p className="memberPhone">📞 {item.mobileNumber}</p>
                )}

                {item.email && (
                  <p className="memberPhone">✉️ {item.email}</p>
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
                  <img
                    src={item.photo.url}
                    alt={item.newsChannelName}
                  />
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
                  <p className="memberPhone">
                    📞 {item.mobileNumber}
                  </p>
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