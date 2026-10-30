export const dynamic = "force-dynamic";

import { getArticles } from "../../lib/api";
import WebNewsDirectory from "./WebNewsDirectory";

export default async function WebNewsPage() {
  const articlesData = await getArticles({
    all: true,
    limit: 1000,
    published: true,
  });
  const articles = articlesData?.articles || [];

  return (
    <main className="listingPage">
      <section className="listingHeader">
        <h1>Web News</h1>
        <p>Latest web news and reports from ODMM News.</p>
      </section>

      <WebNewsDirectory initialArticles={articles} />
    </main>
  );
}
