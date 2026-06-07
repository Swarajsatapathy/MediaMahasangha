export const dynamic = "force-dynamic";

import Link from "next/link";
import { getArticles } from "../../lib/api";

export default async function WebNewsPage() {
  const articlesData = await getArticles();
  const articles = articlesData?.articles || [];

  return (
    <main className="listingPage">
      <section className="listingHeader">
        <h1>Web News</h1>
        <p>Latest web news and reports from ODMM News.</p>
      </section>

      <section className="listingGrid">
        {articles.length > 0 ? (
          articles.map((article: any) => (
            <Link
              href={`/articles/${article._id}`}
              className="listingCard"
              key={article._id}
            >
              {article.images?.[0]?.url && (
                <img src={article.images[0].url} alt={article.title} />
              )}

              <div className="listingBody">
                <span>Web News</span>
                <h2>{article.title}</h2>
                <p>
                  {article.district} • {article.reporter}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p className="emptyListing">No web news available.</p>
        )}
      </section>
    </main>
  );
}