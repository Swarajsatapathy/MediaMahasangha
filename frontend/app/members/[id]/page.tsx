import { getMemberById } from "../../../lib/api";
import SocialShare from "../../components/SocialShare";
import MemberIdCardDownload from "../../components/MemberIdCardDownload";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatValidUpto(dateValue?: string) {
  if (!dateValue) {
    return "Not Set";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Not Set";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const member = await getMemberById(id);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.mediamahasangha.in";

  const imageUrl = member?.photo?.url || `${siteUrl}/default-og-image.jpg`;

  const description = member
    ? `${member.name} - ${member.designation}, ${member.district}`
    : "ODMM Member Profile";

  return {
    title: member?.name || "ODMM Member",
    description,

    openGraph: {
      title: member?.name || "ODMM Member",
      description,
      url: `${siteUrl}/members/${id}`,
      siteName: "ODMM - Odisha Digital Media Mahasangha",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: member?.name || "ODMM Member",
        },
      ],
      type: "profile",
    },

    twitter: {
      card: "summary_large_image",
      title: member?.name || "ODMM Member",
      description,
      images: [imageUrl],
    },
  };
}

export default async function MemberDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const member = await getMemberById(id);

  if (!member) {
    return (
      <main className="detailsPage">
        <div className="detailsContainer">
          <h1>Member not found</h1>

          <p>The member profile may have been deleted or is unavailable.</p>
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
            <span>{member.name?.charAt(0).toUpperCase() || "M"}</span>
          )}
        </div>

        <div className="memberDetailsInfo">
          <div className="memberDetailsTopRow">
            <span className="memberDetailsBadge">ODMM Member</span>

            <MemberIdCardDownload member={member} />
          </div>

          <h1>{member.name}</h1>

          <SocialShare title={`${member.name} - ${member.designation}`} />

          <div className="memberDetailsRows">
            <p>
              <strong>Member ID:</strong> {member.memberId}
            </p>

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
              <strong>Valid Upto:</strong>{" "}
              {member.validUpto
                ? new Date(member.validUpto).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    timeZone: "UTC",
                  })
                : "Not specified"}
            </p>

            <p>
              <strong>Status:</strong> {member.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
