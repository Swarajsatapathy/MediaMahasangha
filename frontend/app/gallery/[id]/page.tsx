import { getGalleryItemById } from "../../../lib/api";
import SocialShare from "../../components/SocialShare";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const galleryItem = await getGalleryItemById(id);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.mediamahasangha.in";

  const imageUrl =
    galleryItem?.photo?.url || `${siteUrl}/default-og-image.jpg`;

  const description =
    galleryItem?.description
      ?.replace(/<[^>]*>/g, "")
      ?.replace(/\s+/g, " ")
      ?.slice(0, 160) || "Photo Gallery of Odisha Digital Media Mahasangha.";

  return {
    title: galleryItem?.area || "ODMM Gallery",
    description,

    openGraph: {
      title: galleryItem?.area || "ODMM Gallery",
      description,
      url: `${siteUrl}/gallery/${id}`,
      siteName: "ODMM - Odisha Digital Media Mahasangha",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: galleryItem?.area || "ODMM Gallery",
        },
      ],
      type: "article",
    },

    twitter: {
      card: "summary_large_image",
      title: galleryItem?.area || "ODMM Gallery",
      description,
      images: [imageUrl],
    },
  };
}

export default async function GalleryDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const galleryItem = await getGalleryItemById(id);

  if (!galleryItem) {
    return (
      <main className="detailsPage">
        <div className="detailsContainer">
          <h1>Gallery photo not found</h1>
          <p>This gallery photo may have been deleted or is unavailable.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="detailsPage">
      <article className="detailsContainer">
        <div className="detailsBadge">Gallery</div>

        <h1>{galleryItem.area}</h1>

        <div className="detailsMeta">
          <span>{galleryItem.district}</span>
          <span>{galleryItem.area}</span>
          {galleryItem.createdAt && (
            <span>
              {new Date(galleryItem.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        <SocialShare title={`${galleryItem.area} - ${galleryItem.district}`} />

        {galleryItem.photo?.url && (
          <div className="galleryDetailsPhoto">
            <img src={galleryItem.photo.url} alt={galleryItem.area} />
          </div>
        )}

        {galleryItem.description && (
          <div className="detailsContent">
            {galleryItem.description
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