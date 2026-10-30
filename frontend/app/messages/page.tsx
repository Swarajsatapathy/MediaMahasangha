export const dynamic = "force-dynamic";

import { getVideos } from "../../lib/api";
import VideoNewsDirectory from "./VideoNewsDirectory";

export default async function VideoNewsPage() {
  const videosData = await getVideos({
    all: true,
    limit: 1000,
    published: true,
  });
  const videos = videosData?.videos || [];

  return (
    <main className="listingPage">
      <section className="listingHeader">
        <h1>Messages</h1>
        <p>Latest video messages and public updates.</p>
      </section>

      <VideoNewsDirectory initialVideos={videos} />
    </main>
  );
}
