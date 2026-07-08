import { getMemberNewsChannelById } from "../../../lib/api";
import SocialShare from "../../components/SocialShare";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const channel = await getMemberNewsChannelById(id);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.mediamahasangha.in";

  const imageUrl = channel?.photo?.url || `${siteUrl}/default-og-image.jpg`;

  const description = channel
    ? `${channel.newsChannelName} - Owner: ${channel.ownerName}, ${channel.district}`
    : "ODMM Member News Channel Profile";

  return {
    title: channel?.newsChannelName || "ODMM Member News Channel",
    description,

    openGraph: {
      title: channel?.newsChannelName || "ODMM Member News Channel",
      description,
      url: `${siteUrl}/member-news-channels/${id}`,
      siteName: "ODMM - Odisha Digital Media Mahasangha",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: channel?.newsChannelName || "ODMM Member News Channel",
        },
      ],
      type: "profile",
    },

    twitter: {
      card: "summary_large_image",
      title: channel?.newsChannelName || "ODMM Member News Channel",
      description,
      images: [imageUrl],
    },
  };
}

export default async function MemberNewsChannelDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;
  const channel = await getMemberNewsChannelById(id);

  if (!channel) {
    return (
      <main className="detailsPage">
        <div className="detailsContainer">
          <h1>Member news channel not found</h1>
          <p>
            The member news channel profile may have been deleted or is
            unavailable.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="detailsPage">
      <section className="memberDetailsCard">
        <div className="memberDetailsPhoto channelDetailsLogo">
          {channel.photo?.url ? (
            <img src={channel.photo.url} alt={channel.newsChannelName} />
          ) : (
            <span>{channel.newsChannelName?.charAt(0) || "N"}</span>
          )}
        </div>

        <div className="memberDetailsInfo">
          <span className="memberDetailsBadge">ODMM Member News Channel</span>

          <h1>{channel.newsChannelName}</h1>

          <SocialShare
            title={`${channel.newsChannelName} - ${channel.district}`}
          />

          <div className="memberDetailsRows">

            <p>
              <strong>ODMM Registration No:</strong>{" "}
              {channel.odmmRegistrationNo}
            </p>

            <p>
              <strong>Name of News Channel:</strong>{" "}
              {channel.newsChannelName}
            </p>

            <p>
              <strong>Name of Owner:</strong> {channel.ownerName}
            </p>

            <p>
              <strong>District:</strong> {channel.district}
            </p>

            <p>
              <strong>Mobile No:</strong> {channel.mobileNumber}
            </p>

            <p>
              <strong>E-mail ID:</strong> {channel.email}
            </p>

            <p>
              <strong>Website URL:</strong>{" "}
              <a
                href={channel.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {channel.websiteUrl}
              </a>
            </p>

            {channel.registrationNumber && (
              <p>
                <strong>Registration No:</strong>{" "}
                {channel.registrationNumber}
              </p>
            )}

            <p>
              <strong>Status:</strong>{" "}
              {channel.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}