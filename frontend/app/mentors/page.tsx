import Link from "next/link";
import { getMentors } from "../../lib/api";

export const revalidate = 600;

export const metadata = {
  title: "Mentors | ODMM",
  description: "Mentors of Odisha Digital Media Mahasangha",
};

export default async function MentorsPage() {
  const mentorsData = await getMentors();

  const rawMentors: any[] = Array.isArray(mentorsData)
    ? mentorsData
    : mentorsData?.mentors ?? [];

  const mentors = rawMentors
    .filter((mentor: any) => mentor.isActive !== false)
    .sort(
      (a: any, b: any) =>
        (a.serialNumber ?? 9999) - (b.serialNumber ?? 9999)
    );

  return (
    <main className="listingPage">
      <section className="listingHeader">
        <h1>Mentors</h1>
        <p>Our Mentors</p>
      </section>

      <section className="membersListingGrid">
        {mentors.length > 0 ? (
          mentors.map((mentor: any) => (
            <Link
              href={`/mentors/${mentor._id}`}
              className="memberListingCard"
              key={mentor._id}
              prefetch={false}
            >
              <div className="memberListingPhoto">
                {mentor.photo?.url ? (
                  <img
                    src={mentor.photo.url}
                    alt={mentor.name || "ODMM Mentor"}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span>
                    {mentor.name?.charAt(0)?.toUpperCase() || "M"}
                  </span>
                )}
              </div>

              <div className="memberListingInfo">
                <h2>{mentor.name}</h2>

                {mentor.designation && <p>{mentor.designation}</p>}

                {mentor.district && (
                  <span className="mentorDistrict">
                    {mentor.district}
                  </span>
                )}
              </div>
            </Link>
          ))
        ) : (
          <p className="emptyListing">No mentors available.</p>
        )}
      </section>
    </main>
  );
}