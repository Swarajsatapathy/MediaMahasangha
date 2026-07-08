export const dynamic = "force-dynamic";

import Link from "next/link";
import { getSrbMembers } from "../../lib/api";

export default async function SelfRegulatoryBodyPage() {
  const srbData = await getSrbMembers();

  const srbMembers = (srbData?.srbMembers || []).sort(
    (a: any, b: any) => (a.serialNumber || 9999) - (b.serialNumber || 9999)
  );

  return (
    <main className="listingPage">
      <section className="listingHeader">
        <h1>Self Regulatory Body</h1>
        <p>Governing Committee of Self Regulatory Body</p>
      </section>

      <section className="membersListingGrid">
        {srbMembers.length > 0 ? (
          srbMembers.map((member: any) => (
            <Link
              href={`/self-regulatory-body/${member._id}`}
              className="memberListingCard"
              key={member._id}
            >
              <div className="memberListingPhoto">
                {member.photo?.url ? (
                  <img src={member.photo.url} alt={member.name} />
                ) : (
                  <span>{member.name?.charAt(0) || "S"}</span>
                )}
              </div>

              <div className="memberListingInfo">
                <h2>{member.name}</h2>

                <p>{member.designation}</p>

                <span>{member.district}</span>

                {member.email && (
                  <p className="memberListingPhone">
                    ✉️ {member.email}
                  </p>
                )}
              </div>
            </Link>
          ))
        ) : (
          <p className="emptyListing">No SRB members available.</p>
        )}
      </section>
    </main>
  );
}