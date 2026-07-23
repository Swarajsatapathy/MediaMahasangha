import Link from "next/link";
import HomeSectionSlider from "./components/HomeSectionSlider";

import {
  getArticles,
  getFlashArticles,
  getVideos,
  getMembers,
  getMentors,
  getMemberNewsChannels,
  getSrbMembers,
  getGalleryItems,
} from "../lib/api";

/*
  Cache the generated homepage for 60 seconds.

  Do not use:
  export const dynamic = "force-dynamic";

  because it forces all API calls to run again for every page visit.
*/
export const revalidate = 60;

function getResultValue<T>(
  result: PromiseSettledResult<T>,
  fallback: T
): T {
  if (result.status === "fulfilled") {
    return result.value;
  }

  console.error("Homepage API request failed:", result.reason);
  return fallback;
}

export default async function HomePage() {
  /*
    All requests now start together.

    Promise.allSettled() is used instead of Promise.all() so that
    one failed API section does not crash the whole homepage.
  */
  const [
    articlesResult,
    flashResult,
    videosResult,
    membersResult,
    mentorsResult,
    srbMembersResult,
    memberNewsChannelsResult,
    galleryResult,
  ] = await Promise.allSettled([
    getArticles(),
    getFlashArticles(),
    getVideos(),
    getMembers(),
    getMentors(),
    getSrbMembers(),
    getMemberNewsChannels(),
    getGalleryItems(),
  ]);

  const articlesData = getResultValue<any>(articlesResult, {
    articles: [],
  });

  const flashData = getResultValue<any>(flashResult, []);

  const videosData = getResultValue<any>(videosResult, {
    videos: [],
  });

  const membersData = getResultValue<any>(membersResult, {
    members: [],
  });

  const mentorsData = getResultValue<any>(mentorsResult, {
    mentors: [],
  });

  const srbMembersData = getResultValue<any>(srbMembersResult, {
    srbMembers: [],
  });

  const memberNewsChannelsData = getResultValue<any>(
    memberNewsChannelsResult,
    {
      memberNewsChannels: [],
    }
  );

  const galleryData = getResultValue<any>(galleryResult, {
    galleryItems: [],
  });

  const articles = articlesData?.articles || [];
  const videos = videosData?.videos || [];
  const srbMembers = srbMembersData?.srbMembers || [];
  const galleryItems = galleryData?.galleryItems || [];

  const memberNewsChannels =
    memberNewsChannelsData?.memberNewsChannels || [];

  /*
    Supports both possible flash API response formats:

    1. Direct array:
       [{...}, {...}]

    2. Object:
       { flashArticles: [...] }
  */
  const flashArticles = Array.isArray(flashData)
    ? flashData
    : flashData?.flashArticles || flashData?.articles || [];

  const mentors = [...(mentorsData?.mentors || [])].sort(
    (a: any, b: any) =>
      (a.serialNumber || 9999) - (b.serialNumber || 9999)
  );

  const members = [...(membersData?.members || [])].sort(
    (a: any, b: any) =>
      (a.serialNumber || 9999) - (b.serialNumber || 9999)
  );

  return (
    <main className="site">
      <section className="flashTicker">
        <div className="flashBadge">
          <span className="flashDot" />
          <strong>FLASH</strong>
        </div>

        <div className="tickerWrap">
          <div className="tickerTrack">
            {flashArticles.length > 0 ? (
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
                    aria-hidden="true"
                    tabIndex={-1}
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
          title="SRB Members"
          items={srbMembers}
          type="srbMembers"
        />

        <HomeSectionSlider
          title="Mentors"
          items={mentors}
          type="mentors"
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

        <HomeSectionSlider
          title="Gallery"
          items={galleryItems}
          type="gallery"
        />
      </section>
    </main>
  );
}