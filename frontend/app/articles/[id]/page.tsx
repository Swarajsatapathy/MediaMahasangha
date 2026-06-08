import { getArticleById } from "../../../lib/api";
import SocialShare from "../../components/SocialShare";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const article = await getArticleById(id);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.mediamahasangha.in";

  const imageUrl =
    article?.images?.[0]?.url || `${siteUrl}/default-og-image.jpg`;

  const description =
    article?.content
      ?.replace(/<[^>]*>/g, "")
      ?.replace(/\s+/g, " ")
      ?.slice(0, 160) || "Read latest news from Odisha Digital Media Mahasangha.";

  return {
    title: article?.title || "Web News",
    description,

    openGraph: {
      title: article?.title || "Web News",
      description,
      url: `${siteUrl}/articles/${id}`,
      siteName: "ODMM - Odisha Digital Media Mahasangha",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article?.title || "Web News",
        },
      ],
      type: "article",
    },

    twitter: {
      card: "summary_large_image",
      title: article?.title || "Web News",
      description,
      images: [imageUrl],
    },
  };
}

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

        <p className="viewsCount">👁 {article.views || 0} views</p>

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

        <SocialShare title={article.title} />

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