import Link from "next/link";
import { getSupremeCouncilMembers } from "../../lib/api";

export const revalidate = 600;

export const metadata = {
  title: "Supreme Council | ODMM",
  description: "Supreme Council of Odisha Digital Media Mahasangha",
};

export default async function SupremeCouncilPage() {
  const data = await getSupremeCouncilMembers();

  const rawMembers: any[] = Array.isArray(data)
    ? data
    : data?.members ?? [];

  const members = rawMembers
    .filter((member: any) => member.isActive !== false)
    .sort(
      (a: any, b: any) =>
        (a.serialNumber ?? 9999) - (b.serialNumber ?? 9999)
    );

  return (
    <main className="listingPage">
      <section className="listingHeader">
        <h1>Supreme Council</h1>
        <p>Supreme Council of Odisha Digital Media Mahasangha</p>
      </section>

      <section className="membersListingGrid">
        {members.length > 0 ? (
          members.map((member: any) => (
            <Link
              href={`/supreme-council/${member._id}`}
              className="memberListingCard"
              key={member._id}
              prefetch={false}
            >
              <div className="memberListingPhoto">
                {member.photo?.url ? (
                  <img
                    src={member.photo.url}
                    alt={member.name || "Supreme Council Member"}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span>
                    {member.name?.charAt(0)?.toUpperCase() || "S"}
                  </span>
                )}
              </div>

              <div className="memberListingInfo">
                <h2>{member.name}</h2>

                {member.designation && <p>{member.designation}</p>}

                {member.district && (
                  <span className="mentorDistrict">
                    {member.district}
                  </span>
                )}
              </div>
            </Link>
          ))
        ) : (
          <p className="emptyListing">No supreme council members available.</p>
        )}
      </section>
    </main>
  );
}
