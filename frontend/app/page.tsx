export const dynamic = "force-dynamic";

import HomeSectionSlider from "./components/HomeSectionSlider";

import {
  getArticles,
  getFlashArticles,
  getPresidentPicks,
  getVideos,
  getMembers,
  getMentors,
  getMemberNewsChannels,
  getSrbMembers,
} from "../lib/api";

import Link from "next/link";

export default async function HomePage() {
  const articlesData = await getArticles();
  const flashArticles = await getFlashArticles();
  const presidentPicks = await getPresidentPicks();
  const videosData = await getVideos();
  const membersData = await getMembers();
  const mentorsData = await getMentors();
  const srbMembersData = await getSrbMembers();
  const memberNewsChannelsData = await getMemberNewsChannels();
  const articles = articlesData?.articles || [];
  const videos = videosData?.videos || [];
  const memberNewsChannels = memberNewsChannelsData?.memberNewsChannels || [];
  const srbMembers = srbMembersData?.srbMembers || [];

  const mentors = (mentorsData?.mentors || []).sort(
    (a: any, b: any) => (a.serialNumber || 9999) - (b.serialNumber || 9999)
  );

  const members = (membersData?.members || []).sort(
    (a: any, b: any) => (a.serialNumber || 9999) - (b.serialNumber || 9999)
  );

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
          title="Member News Channels"
          items={memberNewsChannels}
          type="memberNewsChannels"
          badge="Latest"
        />

        <HomeSectionSlider
          title="Mentors"
          items={mentors}
          type="mentors"
        />

        <HomeSectionSlider
          title="SRB Members"
          items={srbMembers}
          type="srbMembers"
        />

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
      </section>
    </main>
  );
}