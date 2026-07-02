import { getMentorById } from "../../../lib/api";
import SocialShare from "../../components/SocialShare";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const mentor = await getMentorById(id);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.mediamahasangha.in";

  const imageUrl = mentor?.photo?.url || `${siteUrl}/default-og-image.jpg`;

  const description = mentor
    ? `${mentor.name} - ${mentor.designation}, ${mentor.district}`
    : "ODMM Mentor Profile";

  return {
    title: mentor?.name || "ODMM Mentor",
    description,

    openGraph: {
      title: mentor?.name || "ODMM Mentor",
      description,
      url: `${siteUrl}/mentors/${id}`,
      siteName: "ODMM - Odisha Digital Media Mahasangha",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: mentor?.name || "ODMM Mentor",
        },
      ],
      type: "profile",
    },

    twitter: {
      card: "summary_large_image",
      title: mentor?.name || "ODMM Mentor",
      description,
      images: [imageUrl],
    },
  };
}

export default async function MentorDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const mentor = await getMentorById(id);

  if (!mentor) {
    return (
      <main className="detailsPage">
        <div className="detailsContainer">
          <h1>Mentor not found</h1>
          <p>The mentor profile may have been deleted or is unavailable.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="detailsPage">
      <section className="memberDetailsCard">
        <div className="memberDetailsPhoto">
          {mentor.photo?.url ? (
            <img src={mentor.photo.url} alt={mentor.name} />
          ) : (
            <span>{mentor.name?.charAt(0)?.toUpperCase() || "M"}</span>
          )}
        </div>

        <div className="memberDetailsInfo">
          <span className="memberDetailsBadge">ODMM Mentor</span>

          <h1>{mentor.name}</h1>

          <SocialShare title={`${mentor.name} - ODMM Mentor`} />

          <div className="memberDetailsRows">

            <p>
              <strong>Designation:</strong> {mentor.designation}
            </p>

            <p>
              <strong>District:</strong> {mentor.district}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {mentor.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}