export const dynamic = "force-dynamic";

import {
  getArticles,
  getFlashArticles,
  getPresidentPicks,
  getVideos,
  getMembers,
} from "../lib/api";

import {
  FaFacebookF,
  FaWhatsapp,
  FaInstagram,
  FaYoutube,
  FaTelegramPlane,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";


import Link from "next/link";


export default async function HomePage() {
  const articlesData = await getArticles();
  const flashArticles = await getFlashArticles();
  const presidentPicks = await getPresidentPicks();
  const videosData = await getVideos();
  const membersData = await getMembers();

  const articles = articlesData?.articles || [];
  const videos = videosData?.videos || [];
  const members = membersData?.members || [];

  const trendingArticles = articles.filter((item: any) => item.isTrending);
  const mainPick = presidentPicks?.[0];

  return (
    <main className="site">
      
      <section className="flashTicker">
  <div className="flashBadge">
    <span className="flashDot"></span>
    <strong>FLASH</strong>
  </div>

  <div className="tickerWrap">
    <div className="tickerTrack">
      {flashArticles?.length ? (
        <>
          {flashArticles.map((item: any) => (
            <span key={item._id}>{item.title}</span>
          ))}

          {flashArticles.map((item: any) => (
            <span key={`${item._id}-duplicate`}>{item.title}</span>
          ))}
        </>
      ) : (
        <span>No flash news available</span>
      )}
    </div>
  </div>
</section>

      <section className="homeGrid">

        <section className="homeBlock">
    <div className="blockHeader">
      <h2>Members</h2>
      <div className="arrows">
        <button>‹</button>
        <button>›</button>
      </div>
    </div>

    <div className="memberGridHome">
  {members.slice(0, 4).map((member: any) => (
    <Link
  href={`/members/${member._id}`}
  className="memberHomeCard"
  key={member._id}
>
      <div className="memberPhotoBox">
        {member.photo?.url ? (
          <img src={member.photo.url} alt={member.name} />
        ) : (
          <span>{member.name?.charAt(0) || "M"}</span>
        )}
      </div>

      <div className="memberInfo">
        <p className="memberId">ID: {member.memberId}</p>
        <h3>{member.name}</h3>
        <p>{member.designation}</p>
        <span>{member.district}</span>
      </div>
    </Link>
  ))}
</div>
  </section>

  <section className="homeBlock">
    <div className="blockHeader">
      <h2>Web News</h2>
      <div className="arrows">
        <button>‹</button>
        <button>›</button>
      </div>
    </div>

    <Link
  href={articles[0]?._id ? `/articles/${articles[0]._id}` : "#"}
  className="bigNewsCard"
>
  {articles[0]?.images?.[0]?.url && (
    <img src={articles[0].images[0].url} alt={articles[0].title} />
  )}

  <div className="overlay">
    <span>Latest</span>
    <h3>{articles[0]?.title || "No web news available"}</h3>
  </div>
</Link>
  </section>

  <section className="homeBlock">
    <div className="blockHeader">
      <h2>Messages</h2>
      <div className="arrows">
        <button>‹</button>
        <button>›</button>
      </div>
    </div>

    <Link
  href={videos[0]?._id ? `/videos/${videos[0]._id}` : "#"}
  className="bigNewsCard"
>
  {videos[0]?.thumbnailUrl && (
    <img src={videos[0].thumbnailUrl} alt={videos[0].title} />
  )}

  <div className="playButton">
  <span>▶</span>
</div>

  <div className="overlay">
    <span>Video</span>
    <h3>{videos[0]?.title || "No video news available"}</h3>
  </div>
</Link>
  </section>

  <section className="homeBlock">
    <div className="blockHeader">
      <h2>SRB</h2>
      <div className="arrows">
        <button>‹</button>
        <button>›</button>
      </div>
    </div>

    <Link
  href={mainPick?._id ? `/articles/${mainPick._id}` : "#"}
  className="bigNewsCard"
>
      {mainPick?.images?.[0]?.url && (
        <img src={mainPick.images[0].url} alt={mainPick.title} />
      )}

      <div className="overlay">
        <span>SRB</span>
        <h3>{mainPick?.title || "No SRB available"}</h3>
      </div>
    </Link>
  </section>
</section>
    </main>
  );
}