import { getWomenCellMemberById } from "../../../lib/api";
import SocialShare from "../../components/SocialShare";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const member = await getWomenCellMemberById(id);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.mediamahasangha.in";

  const imageUrl = member?.photo?.url || `${siteUrl}/default-og-image.jpg`;

  const description = member
    ? `${member.name} - ${member.designation}, ${member.wing || "State Women Cell"}, ${member.district}`
    : "ODMM Women Cell Profile";

  return {
    title: member?.name || "ODMM Women Cell",
    description,

    openGraph: {
      title: member?.name || "ODMM Women Cell",
      description,
      url: `${siteUrl}/women-cell/${id}`,
      siteName: "ODMM - Odisha Digital Media Mahasangha",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: member?.name || "ODMM Women Cell",
        },
      ],
      type: "profile",
    },

    twitter: {
      card: "summary_large_image",
      title: member?.name || "ODMM Women Cell",
      description,
      images: [imageUrl],
    },
  };
}

export default async function WomenCellDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const member = await getWomenCellMemberById(id);

  if (!member) {
    return (
      <main className="detailsPage">
        <div className="detailsContainer">
          <h1>Women Cell member not found</h1>
          <p>The profile may have been deleted or is unavailable.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="detailsPage">
      <section className="memberDetailsCard">
        <div className="memberDetailsPhoto">
          {member.photo?.url ? (
            <img src={member.photo.url} alt={member.name} />
          ) : (
            <span>{member.name?.charAt(0)?.toUpperCase() || "W"}</span>
          )}
        </div>

        <div className="memberDetailsInfo">
          <h1>{member.name}</h1>

          <SocialShare title={`${member.name} - ODMM State Women Cell`} />

          <div className="memberDetailsRows">
            <p>
              <strong>Designation:</strong> {member.designation}
            </p>

            <p>
              <strong>Cell:</strong> {member.wing || "State Women Cell"}
            </p>

            <p>
              <strong>District:</strong> {member.district}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {member.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
