
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import prisma from "@/lib/prisma";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

function formatDate(date) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function getReadTime(content = "") {
  const plainText = content.replace(/<[^>]*>/g, " ").trim();
  const words = plainText ? plainText.split(/\s+/).length : 0;

  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        where: { published: true },
        include: {
          user: true,
          category: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const categoryArticles = category.posts;

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.header}>
        <div className={styles.headerInner}>
          <p className={styles.eyebrow}>INKSPIRE / TOPICS</p>

          <h1>{category.name}</h1>

          {category.description && (
            <p className={styles.description}>
              {category.description}
            </p>
          )}

          <p className={styles.articleCount}>
            {categoryArticles.length}{" "}
            {categoryArticles.length === 1 ? "ARTICLE" : "ARTICLES"}
          </p>
        </div>
      </section>

      <section className={styles.content}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>EXPLORE THE TOPIC</p>
            <h2>Latest stories</h2>
          </div>
        </div>

        {categoryArticles.length > 0 ? (
          <div className={styles.articleGrid}>
            {categoryArticles.map((article) => (
              <article className={styles.articleCard} key={article.id}>
                <Link
                  href={`/post/${article.slug}`}
                  className={styles.imageLink}
                >
                  {article.image ? (
                    <img
                      src={article.image}
                      alt={article.title}
                      className={styles.articleImage}
                    />
                  ) : (
                    <div className={styles.articleImage} />
                  )}
                </Link>

                <div className={styles.articleDetails}>
                  <p className={styles.articleMeta}>
                    {formatDate(article.createdAt)}
                    <span>·</span>
                    {getReadTime(article.content)}
                  </p>

                  <h3>
                    <Link href={`/post/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h3>

                  <p className={styles.excerpt}>
                    {article.description}
                  </p>

                  <p className={styles.author}>
                    By {article.user?.name || "Inkspire author"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>No stories here yet.</h3>
            <p>
              There are no published articles in this category yet.
              Check back soon for new perspectives.
            </p>
          </div>
        )}

        <div className={styles.bottomLink}>
          <Link href="/">← Back to homepage</Link>
        </div>
      </section>
    </main>
  );
}
