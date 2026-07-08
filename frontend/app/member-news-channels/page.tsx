export const dynamic = "force-dynamic";

import Link from "next/link";
import { getMemberNewsChannels } from "../../lib/api";

export default async function MemberNewsChannelsPage() {
  const channelsData = await getMemberNewsChannels();

  const channels = (channelsData?.memberNewsChannels || []).sort(
    (a: any, b: any) => (a.serialNumber || 9999) - (b.serialNumber || 9999)
  );

  return (
    <main className="listingPage">
      <section className="listingHeader">
        <h1>Member News Channels</h1>
        <p>ODMM Registered News Channels</p>
      </section>

      <section className="membersListingGrid">
        {channels.length > 0 ? (
          channels.map((channel: any) => (
            <Link
              href={`/member-news-channels/${channel._id}`}
              className="memberListingCard"
              key={channel._id}
            >
              <div className="memberListingPhoto">
                {channel.photo?.url ? (
                  <img
                    src={channel.photo.url}
                    alt={channel.newsChannelName}
                  />
                ) : (
                  <span>{channel.newsChannelName?.charAt(0) || "N"}</span>
                )}
              </div>

              <div className="memberListingInfo">
                <p className="memberListingId">
                  ODMM Reg. No: {channel.odmmRegistrationNo}
                </p>

                <h2>{channel.newsChannelName}</h2>

                <p>Owner: {channel.ownerName}</p>

                <span>{channel.district}</span>

                {channel.mobileNumber && (
                  <p className="memberListingPhone">
                    📞 {channel.mobileNumber}
                  </p>
                )}

                {channel.websiteUrl && (
                  <p className="memberListingPhone">
                    🌐 {channel.websiteUrl}
                  </p>
                )}
              </div>
            </Link>
          ))
        ) : (
          <p className="emptyListing">No member news channels available.</p>
        )}
      </section>
    </main>
  );
}