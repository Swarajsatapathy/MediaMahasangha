import { getMemberById } from "../../../lib/api";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

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
            <span>{member.name?.charAt(0) || "M"}</span>
          )}
        </div>

        <div className="memberDetailsInfo">
          <span className="memberDetailsBadge">ODMM Member</span>

          <h1>{member.name}</h1>

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
              <strong>Status:</strong>{" "}
              {member.isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}