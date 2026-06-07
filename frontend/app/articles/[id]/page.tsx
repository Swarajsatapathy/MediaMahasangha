import { getArticleById } from "../../../lib/api";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ArticleDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article) {
    return (
      <main className="detailsPage">
        <div className="detailsContainer">
          <h1>Article not found</h1>
          <p>The article may have been deleted or is unavailable.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="detailsPage">
      <article className="detailsContainer">
        <div className="detailsBadge">Web News</div>

        <h1>{article.title}</h1>

        <div className="detailsMeta">
          <span>{article.district}</span>
          <span>{article.reporter}</span>
          {article.publishedAt && (
            <span>
              {new Date(article.publishedAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        {article.images?.[0]?.url && (
          <img
            className="detailsImage"
            src={article.images[0].url}
            alt={article.title}
          />
        )}

        <div className="detailsContent">
          {article.content
            ?.split("\n")
            .filter(Boolean)
            .map((para: string, index: number) => (
              <p key={index}>{para}</p>
            ))}
        </div>
      </article>
    </main>
  );
}