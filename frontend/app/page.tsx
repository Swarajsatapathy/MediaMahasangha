import Link from "next/link";
import HomeSectionSlider from "./components/HomeSectionSlider";
import { getHomepageData } from "../lib/api";

export const revalidate = 60;

export default async function HomePage() {
  const data = await getHomepageData();

  const articles = data?.articles || [];
  const flashArticles = data?.flashArticles || [];
  const videos = data?.videos || [];
  const srbMembers = data?.srbMembers || [];
  const galleryItems = data?.galleryItems || [];
  const notices = data?.notices || [];
  const memberNewsChannels = data?.memberNewsChannels || [];

  const patrons = [...(data?.patrons || [])].sort(
    (a: any, b: any) =>
      (a.serialNumber || 9999) - (b.serialNumber || 9999)
  );

  const mentors = [...(data?.mentors || [])].sort(
    (a: any, b: any) =>
      (a.serialNumber || 9999) - (b.serialNumber || 9999)
  );

  const supremeCouncilMembers = [...(data?.supremeCouncil || [])].sort(
    (a: any, b: any) =>
      (a.serialNumber || 9999) - (b.serialNumber || 9999)
  );

  const womenCellMembers = [...(data?.womenCell || [])].sort(
    (a: any, b: any) =>
      (a.serialNumber || 9999) - (b.serialNumber || 9999)
  );

  const members = [...(data?.members || [])].sort(
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

      <section className="homeTopRow">
        <HomeSectionSlider
          title="Members"
          items={members}
          type="members"
          className="membersTopBlock"
        />

        <HomeSectionSlider
          title="Women Cell"
          items={womenCellMembers}
          type="womenCell"
          className="womenCellSmallBlock"
        />

        <HomeSectionSlider
          title="Notice Board"
          items={notices}
          type="notices"
          badge="Notice"
          className="noticeBoardTopBlock"
        />
      </section>

      <section className="homeGrid">
        <HomeSectionSlider
          title="Patron"
          items={patrons}
          type="patrons"
        />

        <HomeSectionSlider
          title="Supreme Council"
          items={supremeCouncilMembers}
          type="supremeCouncil"
        />

        <HomeSectionSlider
          title="Advisory Board"
          items={mentors}
          type="mentors"
        />

        <HomeSectionSlider
          title="Self Regulatory Body (SRB)"
          items={srbMembers}
          type="srbMembers"
        />

        <HomeSectionSlider
          title="Member News Channel"
          items={memberNewsChannels}
          type="memberNewsChannels"
          badge="Latest"
        />

        <HomeSectionSlider
          title="Web News"
          items={articles}
          type="articles"
          badge="Latest"
        />

        <HomeSectionSlider
          title="Video Message"
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
