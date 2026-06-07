export const dynamic = "force-dynamic";

import HomeSectionSlider from "./components/HomeSectionSlider";

import {
  getArticles,
  getFlashArticles,
  getPresidentPicks,
  getVideos,
  getMembers,
} from "../lib/api";
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
              <Link
                key={item._id}
                href={`/articles/${item._id}`}
                className="flashLink"
              >
                {item.title}
              </Link>
            ))}

            {flashArticles.map((item: any) => (
              <Link
                key={`${item._id}-duplicate`}
                href={`/articles/${item._id}`}
                className="flashLink"
              >
                {item.title}
              </Link>
            ))}
          </>
        ) : (
          <span>No flash news available</span>
        )}
      </div>
    </div>
  </section>

      <section className="homeGrid">
        <HomeSectionSlider
          title="Members"
          items={members}
          type="members"
        />

        <HomeSectionSlider
          title="Web News"
          items={articles}
          type="articles"
          badge="Latest"
        />

        <HomeSectionSlider
          title="Messages"
          items={videos}
          type="videos"
          badge="Video"
        />

        <HomeSectionSlider
          title="SRB"
          items={presidentPicks || []}
          type="articles"
          badge="SRB"
        />
      </section>
    </main>
  );
}