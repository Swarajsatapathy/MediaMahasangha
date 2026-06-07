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

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const video = await getVideoById(id);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.mediamahasangha.in";

  const imageUrl =
    video?.thumbnailUrl || `${siteUrl}/default-og-image.jpg`;

  const description =
    video?.description
      ?.replace(/<[^>]*>/g, "")
      ?.replace(/\s+/g, " ")
      ?.slice(0, 160) ||
    "Watch latest video message from Odisha Digital Media Mahasangha.";

  return {
    title: video?.title || "Video Message",
    description,

    openGraph: {
      title: video?.title || "Video Message",
      description,
      url: `${siteUrl}/videos/${id}`,
      siteName: "ODMM - Odisha Digital Media Mahasangha",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: video?.title || "Video Message",
        },
      ],
      type: "video.other",
    },

    twitter: {
      card: "summary_large_image",
      title: video?.title || "Video Message",
      description,
      images: [imageUrl],
    },
  };
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