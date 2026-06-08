export const dynamic = "force-dynamic";

import Link from "next/link";
import { getMembers } from "../../lib/api";

export default async function MembersPage() {
  const membersData = await getMembers();
  const members = membersData?.members || [];

  return (
    <main className="listingPage">
      <section className="listingHeader">
        <h1>Members</h1>
        <p>Our Members</p>
      </section>

      <section className="membersListingGrid">
        {members.length > 0 ? (
          members.map((member: any) => (
            <Link
              href={`/members/${member._id}`}
              className="memberListingCard"
              key={member._id}
            >
              <div className="memberListingPhoto">
                {member.photo?.url ? (
                  <img src={member.photo.url} alt={member.name} />
                ) : (
                  <span>{member.name?.charAt(0) || "M"}</span>
                )}
              </div>

              <div className="memberListingInfo">
  <p className="memberListingId">ID: {member.memberId}</p>
  <h2>{member.name}</h2>
  <p>{member.designation}</p>
  <span>{member.district}</span>

  {member.phone && (
    <p className="memberListingPhone">
      📞 {member.phone}
    </p>
  )}
</div>
            </Link>
          ))
        ) : (
          <p className="emptyListing">No members available.</p>
        )}
      </section>
    </main>
  );
}