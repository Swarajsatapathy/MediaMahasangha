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

  const title = galleryItem?.district
    ? `${galleryItem.district} Gallery | ODMM`
    : "ODMM Gallery";

  return {
    title,
    description,

    openGraph: {
      title,
      description,
      url: `${siteUrl}/gallery/${id}`,
      siteName: "ODMM - Odisha Digital Media Mahasangha",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: galleryItem?.district || "ODMM Gallery",
        },
      ],
      type: "article",
    },

    twitter: {
      card: "summary_large_image",
      title,
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

        <h1>{galleryItem.district ? `${galleryItem.district} Gallery` : "ODMM Gallery"}</h1>

        <div className="detailsMeta">
          <span>{galleryItem.district}</span>
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

        <SocialShare title={`${galleryItem.district || "ODMM"} Gallery - ODMM`} />

        {galleryItem.photo?.url && (
          <div className="galleryDetailsPhoto">
            <img
              src={galleryItem.photo.url}
              alt={galleryItem.district || "ODMM Gallery"}
            />
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