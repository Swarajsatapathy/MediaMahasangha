export const dynamic = "force-dynamic";

import Link from "next/link";
import { getVideos } from "../../lib/api";

export default async function VideoNewsPage() {
  const videosData = await getVideos();
  const videos = videosData?.videos || [];

  return (
    <main className="listingPage">
      <section className="listingHeader">
        <h1>Messages</h1>
<p>Latest video messages and public updates from ODMM News.</p>
      </section>

      <section className="listingGrid">
        {videos.length > 0 ? (
          videos.map((video: any) => (
            <Link
              href={`/videos/${video._id}`}
              className="listingCard videoListingCard"
              key={video._id}
            >
              <div className="listingVideoThumb">
                {video.thumbnailUrl && (
                  <img src={video.thumbnailUrl} alt={video.title} />
                )}

                <div className="listingPlayBtn">
                  <span>▶</span>
                </div>
              </div>

              <div className="listingBody">
                <span>Video Messages</span>
                <h2>{video.title}</h2>
                <p>
                  {video.district} • {video.reporter}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p className="emptyListing">No video messages available.</p>
        )}
      </section>
    </main>
  );
}