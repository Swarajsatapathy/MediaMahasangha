import Link from "next/link";
import { getWomenCellMembers } from "../../lib/api";

export const revalidate = 600;

export const metadata = {
  title: "Women Cell | ODMM",
  description: "State Women Cell of Odisha Digital Media Mahasangha",
};

export default async function WomenCellPage() {
  const data = await getWomenCellMembers();

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
        <h1>State Women Cell</h1>
        <p>State Women Cell of Odisha Digital Media Mahasangha</p>
      </section>

      <section className="membersListingGrid">
        {members.length > 0 ? (
          members.map((member: any) => (
            <Link
              href={`/women-cell/${member._id}`}
              className="memberListingCard"
              key={member._id}
              prefetch={false}
            >
              <div className="memberListingPhoto">
                {member.photo?.url ? (
                  <img
                    src={member.photo.url}
                    alt={member.name || "Women Cell Member"}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span>
                    {member.name?.charAt(0)?.toUpperCase() || "W"}
                  </span>
                )}
              </div>

              <div className="memberListingInfo">
                <h2>{member.name}</h2>

                {member.designation && <p>{member.designation}</p>}

                <p className="mentorWing">
                  {member.wing || "State Women Cell"}
                </p>

                {member.district && (
                  <span className="mentorDistrict">
                    {member.district}
                  </span>
                )}
              </div>
            </Link>
          ))
        ) : (
          <p className="emptyListing">No women cell members available.</p>
        )}
      </section>
    </main>
  );
}
