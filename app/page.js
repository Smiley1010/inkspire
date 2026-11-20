
import Link from "next/link";
import Navbar from "./components/Navbar";
import FeaturedContent from "./components/FeaturedContent";
import prisma from "@/lib/prisma";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

function getReadingTime(content = "") {
  const words = content
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default async function HomePage() {
  const [articles, categories, totalArticles] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      include: {
        category: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),

    prisma.category.findMany({
      orderBy: { name: "asc" },
      take: 8,
    }),

    prisma.post.count({
      where: { published: true },
    }),
  ]);

  return (
    <main className={styles.container}>
      <Navbar />

      <div className={styles.wrapper}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>
              A SPACE FOR IDEAS AND PERSPECTIVES
            </span>

            <h1>
              Ideas worth
              <br />
              <em>sharing.</em>
            </h1>

            <p className={styles.heroDescription}>
              A place for thoughtful stories, fresh perspectives and
              conversations that make you see the world differently.
            </p>

            <div className={styles.heroActions}>
              <Link href="/search" className={styles.primaryButton}>
                Explore stories
              </Link>

              <Link href="/about" className={styles.heroNote}>
                Discover Inkspire ↗
              </Link>
            </div>
          </div>

          <div className={styles.heroAside}>
            <div className={styles.heroImage}>
              <span className={styles.imageLabel}>THE ART OF IDEAS</span>
            </div>

            <p className={styles.heroCaption}>
              Thoughtful writing. Different perspectives. Meaningful stories.
            </p>
          </div>
        </section>

        <section className={styles.topicsSection}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>FIND YOUR INTEREST</span>
              <h2>Explore topics.</h2>
            </div>

            <Link href="/search" className={styles.heroNote}>
              All stories ↗
            </Link>
          </div>

          {categories.length > 0 ? (
            <div className={styles.topicList}>
              {categories.map((category) => (
                <Link
                  href={`/category/${category.slug}`}
                  key={category.id}
                  className={styles.topic}
                >
                  {category.name}
                  <span>↗</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className={styles.emptyTopics}>
              Topics will appear here as categories are created.
            </p>
          )}
        </section>

        <section className={styles.latestSection}>
          <div className={styles.latestHeader}>
            <div>
              <span className={styles.eyebrow}>FRESH FROM THE JOURNAL</span>
              <h2>Latest stories.</h2>
            </div>

            <span className={styles.articleCount}>
              {String(totalArticles).padStart(2, "0")} PUBLISHED
            </span>
          </div>

          {articles.length > 0 ? (
            <div className={styles.articleGrid}>
              {articles.map((article) => (
                <article
                  className={styles.articleCard}
                  key={article.id}
                >
                  <Link
                    href={`/post/${article.slug}`}
                    className={styles.articleImageLink}
                  >
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.title}
                        className={styles.articleImage}
                      />
                    ) : (
                      <div className={styles.articleImage}>
                        INKSPIRE
                      </div>
                    )}
                  </Link>

                  <div className={styles.articleInfo}>
                    <div className={styles.articleMeta}>
                      <span>
                        {article.category?.name || "Journal"}
                      </span>
                      <span>
                        {getReadingTime(article.content)} min read
                      </span>
                    </div>

                    <h3>
                      <Link href={`/post/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h3>

                    <p>{article.description}</p>

                    <div className={styles.articleFooter}>
                      <span>
                        {article.user?.name || "Inkspire contributor"}
                      </span>
                      <span>{formatDate(article.createdAt)}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyArticles}>
              <h3>The journal is just getting started.</h3>
              <p>
                Published stories will appear here. Check back soon for
                fresh ideas and perspectives.
              </p>
            </div>
          )}

          {totalArticles > 3 && (
            <div className={styles.latestFooter}>
              <Link href="/search" className={styles.primaryButton}>
                Discover more stories ↗
              </Link>
            </div>
          )}
        </section>

        <FeaturedContent />

        <section className={styles.aboutSection}>
          <div>
            <span className={styles.eyebrow}>WHY INKSPIRE</span>
            <h2>
              Every idea has
              <br />
              a story worth telling.
            </h2>
          </div>

          <div>
            <p>
              Inkspire brings together curious minds, thoughtful writers
              and readers who believe that good ideas can start meaningful
              conversations.
            </p>

            <Link href="/about" className={styles.aboutSignature}>
              More about Inkspire ↗
            </Link>
          </div>
        </section>

        <footer className={styles.footer}>
          <Link href="/" className={styles.footerLogo}>
            inkspire.
          </Link>

          <p>Ideas Worth Sharing.</p>

          <div>
            <Link href="/search">Explore</Link>
            <Link href="/about">About</Link>
            <Link href="/login">Sign in</Link>
          </div>

          <span>
            © {new Date().getFullYear()} Inkspire. All rights reserved.
          </span>
        </footer>
      </div>
    </main>
  );
}
