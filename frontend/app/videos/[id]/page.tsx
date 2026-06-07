import { getVideoById } from "../../../lib/api";
import SocialShare from "../../components/SocialShare";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getYouTubeEmbedUrl(youtubeId: string) {
  return `https://www.youtube.com/embed/${youtubeId}`;
}

export default async function VideoDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const video = await getVideoById(id);

  if (!video) {
    return (
      <main className="detailsPage">
        <div className="detailsContainer">
          <h1>Video not found</h1>
          <p>The video may have been deleted or is unavailable.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="detailsPage">
      <article className="detailsContainer">
        <div className="detailsBadge">Video Messages</div>

        <h1>{video.title}</h1>

        <div className="detailsMeta">
          <span>{video.district}</span>
          <span>{video.reporter}</span>
          {video.publishedAt && (
            <span>
              {new Date(video.publishedAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        <SocialShare title={video.title} />

        {video.youtubeId && (
          <div className="videoFrame">
            <iframe
              src={getYouTubeEmbedUrl(video.youtubeId)}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}

        {video.description && (
          <div className="detailsContent">
            {video.description
              .split("\n")
              .filter(Boolean)
              .map((para: string, index: number) => (
                <p key={index}>{para}</p>
              ))}
          </div>
        )}
      </article>
    </main>
  );
} 