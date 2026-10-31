import Link from "next/link";
import { getPatrons } from "../../lib/api";

export const revalidate = 60;

export const metadata = {
  title: "Patron | ODMM",
  description: "Patrons of Odisha Digital Media Mahasangha",
};

export default async function PatronPage() {
  const patronsData = await getPatrons();

  const rawPatrons: any[] = Array.isArray(patronsData)
    ? patronsData
    : patronsData?.patrons ?? [];

  const patrons = rawPatrons
    .filter((patron: any) => patron.isActive !== false)
    .sort(
      (a: any, b: any) =>
        (a.serialNumber ?? 9999) - (b.serialNumber ?? 9999)
    );

  return (
    <main className="listingPage">
      <section className="listingHeader">
        <h1>Patron</h1>
        <p>Patrons of Odisha Digital Media Mahasangha</p>
      </section>

      <section className="membersListingGrid">
        {patrons.length > 0 ? (
          patrons.map((patron: any) => (
            <Link
              href={`/patron/${patron._id}`}
              className="memberListingCard"
              key={patron._id}
              prefetch={false}
            >
              <div className="memberListingPhoto">
                {patron.photo?.url ? (
                  <img
                    src={patron.photo.url}
                    alt={patron.name || "ODMM Patron"}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span>
                    {patron.name?.charAt(0)?.toUpperCase() || "P"}
                  </span>
                )}
              </div>

              <div className="memberListingInfo">
                <h2>{patron.name}</h2>

                {patron.designation && <p>{patron.designation}</p>}

                {patron.designation2 && (
                  <p className="secondaryDesignationText" style={{ fontSize: "13px", color: "var(--text-muted, #64748b)", marginTop: "2px" }}>
                    {patron.designation2}
                  </p>
                )}

                {(patron.area || patron.district) && (
                  <span className="mentorDistrict">
                    {patron.area || patron.district}
                  </span>
                )}
              </div>
            </Link>
          ))
        ) : (
          <p className="emptyListing">No patrons available.</p>
        )}
      </section>
    </main>
  );
}

