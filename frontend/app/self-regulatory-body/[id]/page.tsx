import { getSrbMemberById } from "../../../lib/api";
import SocialShare from "../../components/SocialShare";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const member = await getSrbMemberById(id);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.mediamahasangha.in";

  const imageUrl =
    member?.photo?.url || `${siteUrl}/default-og-image.jpg`;

  const description = member
    ? `${member.name} - ${member.designation}, ${member.district}`
    : "Self Regulatory Body Member Profile";

  return {
    title: member?.name || "Self Regulatory Body Member",
    description,

    openGraph: {
      title: member?.name || "Self Regulatory Body Member",
      description,
      url: `${siteUrl}/self-regulatory-body/${id}`,
      siteName: "ODMM - Odisha Digital Media Mahasangha",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: member?.name || "Self Regulatory Body Member",
        },
      ],
      type: "profile",
    },

    twitter: {
      card: "summary_large_image",
      title: member?.name || "Self Regulatory Body Member",
      description,
      images: [imageUrl],
    },
  };
}

export default async function SrbMemberDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const member = await getSrbMemberById(id);

  if (!member) {
    return (
      <main className="detailsPage">
        <div className="detailsContainer">
          <h1>SRB member not found</h1>
          <p>The SRB member profile may have been deleted or is unavailable.</p>
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
            <span>{member.name?.charAt(0) || "S"}</span>
          )}
        </div>

        <div className="memberDetailsInfo">
          <span className="memberDetailsBadge">
            Self Regulatory Body
          </span>

          <h1>{member.name}</h1>

          <SocialShare
            title={`${member.name} - ${member.designation}`}
          />

          <div className="memberDetailsRows">
            
            <p>
              <strong>Designation:</strong> {member.designation}
            </p>

            <p>
              <strong>District:</strong> {member.district}
            </p>

            <p>
              <strong>Mobile:</strong> {member.mobileNumber}
            </p>

            <p>
              <strong>E-mail ID:</strong> {member.email}
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