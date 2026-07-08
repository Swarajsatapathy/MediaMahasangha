export const dynamic = "force-dynamic";

import Link from "next/link";
import { getGalleryItems } from "../../lib/api";

export default async function GalleryPage() {
  const galleryData = await getGalleryItems();
  const galleryItems = galleryData?.galleryItems || [];

  return (
    <main className="listingPage">
      <section className="listingHeader">
        <h1>Gallery</h1>
        <p>Photo Gallery of Odisha Digital Media Mahasangha.</p>
      </section>

      <section className="listingGrid">
        {galleryItems.length > 0 ? (
          galleryItems.map((item: any) => (
            <Link
              href={`/gallery/${item._id}`}
              className="listingCard"
              key={item._id}
            >
              {item.photo?.url && (
                <img src={item.photo.url} alt={item.area} />
              )}

              <div className="listingBody">
                <span>Gallery</span>

                <h2>{item.area}</h2>

                <p>
                  {item.district}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p className="emptyListing">No gallery photos available.</p>
        )}
      </section>
    </main>
  );
}