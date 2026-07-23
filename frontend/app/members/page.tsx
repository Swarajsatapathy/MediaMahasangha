export const dynamic = "force-dynamic";

import { getMembers } from "../../lib/api";
import MembersDirectory from "./MembersDirectory";

export default async function MembersPage() {
  const membersData = await getMembers();

  const receivedMembers = membersData?.members || [];

  const members = Array.isArray(receivedMembers)
    ? receivedMembers
        .filter(
          (member: any) => member.isActive !== false,
        )
        .sort(
          (a: any, b: any) =>
            (a.serialNumber || 9999) -
            (b.serialNumber || 9999),
        )
    : [];

  return (
    <main className="listingPage">
      <section className="listingHeader">
        <h1>Members</h1>
        <p>Our Members</p>
      </section>

      <MembersDirectory members={members} />
    </main>
  );
}