export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getNotices } from "../../lib/api";
import NoticeBoardTable from "./NoticeBoardTable";

export const metadata: Metadata = {
  title: "Notice Board | Odisha Digital Media Mahasangha (ODMM)",
  description:
    "Official circulars, press releases, tender documents, and announcements from Odisha Digital Media Mahasangha.",
};

export default async function NoticeBoardPage() {
  const noticesData = await getNotices({ limit: 1000 });
  const notices = noticesData?.notices || [];

  return (
    <main className="listingPage">
      <section className="listingHeader">
        <h1>Notice Board</h1>
        <p>Official notices, circulars, and announcements of Odisha Digital Media Mahasangha.</p>
      </section>

      <div style={{ width: "min(1200px, 94%)", margin: "0 auto" }}>
        <NoticeBoardTable initialNotices={notices} />
      </div>
    </main>
  );
}
