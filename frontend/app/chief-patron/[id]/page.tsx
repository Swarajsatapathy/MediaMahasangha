import { getPatronById } from "../../../lib/api";
import SocialShare from "../../components/SocialShare";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const patron = await getPatronById(id);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.mediamahasangha.in";

  const imageUrl = patron?.photo?.url || `${siteUrl}/default-og-image.jpg`;

  const description = patron
    ? `${patron.name} - ${patron.designation}${patron.designation2 ? ` / ${patron.designation2}` : ""}${patron.area || patron.district ? `, ${patron.area || patron.district}` : ""}`
    : "ODMM Chief Patron Profile";

  return {
    title: patron?.name ? `${patron.name} | ODMM Chief Patron` : "ODMM Chief Patron",
    description,

    openGraph: {
      title: patron?.name ? `${patron.name} | ODMM Chief Patron` : "ODMM Chief Patron",
      description,
      url: `${siteUrl}/chief-patron/${id}`,
      siteName: "ODMM - Odisha Digital Media Mahasangha",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: patron?.name || "ODMM Chief Patron",
        },
      ],
      type: "profile",
    },

    twitter: {
      card: "summary_large_image",
      title: patron?.name ? `${patron.name} | ODMM Chief Patron` : "ODMM Chief Patron",
      description,
      images: [imageUrl],
    },
  };
}

export default async function ChiefPatronDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const patron = await getPatronById(id);

  if (!patron) {
    return (
      <main className="detailsPage">
        <div className="detailsContainer">
          <h1>Chief Patron not found</h1>
          <p>The profile may have been deleted or is unavailable.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="detailsPage">
      <section className="memberDetailsCard">
        <div className="memberDetailsPhoto">
          {patron.photo?.url ? (
            <img src={patron.photo.url} alt={patron.name} />
          ) : (
            <span>{patron.name?.charAt(0)?.toUpperCase() || "C"}</span>
          )}
        </div>

        <div className="memberDetailsInfo">
          <h1>{patron.name}</h1>

          <SocialShare title={`${patron.name} - ODMM Chief Patron`} />

          <div className="memberDetailsRows">
            {patron.designation && (
              <p
                style={{
                  color: /chief patron/i.test(patron.designation)
                    ? "var(--navy, #003366)"
                    : "inherit",
                  fontWeight: /chief patron/i.test(patron.designation) ? 700 : 500,
                }}
              >
                {patron.designation}
              </p>
            )}

            {patron.designation2 && (
              <p
                style={{
                  color: "var(--navy, #003366)",
                  fontWeight: 700,
                }}
              >
                {patron.designation2}
              </p>
            )}

            {(patron.area || patron.district) && (
              <p>
                <strong>Area / District:</strong> {patron.area || patron.district}
              </p>
            )}

            <p>
              <strong>Status:</strong>{" "}
              {patron.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

