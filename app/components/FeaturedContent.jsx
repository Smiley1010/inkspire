
import Link from "next/link";
import prisma from "@/lib/prisma";
import styles from "./FeaturedContent.module.css";

function getReadingTime(content = "") {
  const words = content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function ArticleImage({ article, className = "" }) {
  return article.image ? (
    <img
      src={article.image}
      alt={article.title}
      className={className}
    />
  ) : (
    <div className={`${styles.imagePlaceholder} ${className}`}>
      INKSPIRE
    </div>
  );
}

export default async function FeaturedContent() {
  const [featuredArticle, popularPosts, editorPicks, categories] =
    await Promise.all([
      prisma.post.findFirst({
        where: { published: true, featured: true },
        include: { category: true, user: true },
        orderBy: { updatedAt: "desc" },
      }),

      prisma.post.findMany({
        where: { published: true },
        include: { category: true, user: true },
        orderBy: [{ views: "desc" }, { createdAt: "desc" }],
        take: 3,
      }),

      prisma.post.findMany({
        where: { published: true },
        include: { category: true, user: true },
        orderBy: { createdAt: "desc" },
        take: 2,
      }),

      prisma.category.findMany({
        orderBy: { name: "asc" },
      }),
    ]);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.eyebrow}>THE INKSPIRE EDIT</span>
          <h2>Worth your attention.</h2>
        </div>
        <Link href="/search" className={styles.viewAll}>
          Explore all stories ↗
        </Link>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.mainColumn}>
          <div className={styles.featuredBlock}>
            <span className={styles.blockLabel}>FEATURED STORY</span>

            {featuredArticle ? (
              <article className={styles.featuredArticle}>
                <Link
                  href={`/post/${featuredArticle.slug}`}
                  className={styles.featuredImageLink}
                >
                  <ArticleImage
                    article={featuredArticle}
                    className={styles.featuredImage}
                  />
                </Link>

                <div className={styles.featuredDetails}>
                  <div className={styles.articleMeta}>
                    <span>
                      {featuredArticle.category?.name || "Journal"}
                    </span>
                    <span>{getReadingTime(featuredArticle.content)} min read</span>
                  </div>

                  <h3>
                    <Link href={`/post/${featuredArticle.slug}`}>
                      {featuredArticle.title}
                    </Link>
                  </h3>

                  <p>{featuredArticle.description}</p>

                  <div className={styles.articleByline}>
                    <span>
                      By {featuredArticle.user?.name || "Inkspire contributor"}
                    </span>
                    <span>{formatDate(featuredArticle.createdAt)}</span>
                  </div>

                  <Link
                    href={`/post/${featuredArticle.slug}`}
                    className={styles.readLink}
                  >
                    Read the story ↗
                  </Link>
                </div>
              </article>
            ) : (
              <div className={styles.emptyFeature}>
                <span className={styles.emptyMark}>I.</span>
                <h3>Your next featured story starts here.</h3>
                <p>
                  Publish an article and mark it as featured from your
                  dashboard to showcase it in this space.
                </p>
              </div>
            )}
          </div>

          <div className={styles.popularBlock}>
            <div className={styles.blockHeading}>
              <span className={styles.blockLabel}>POPULAR READS</span>
              <span className={styles.subtleLabel}>MOST VIEWED</span>
            </div>

            {popularPosts.length > 0 ? (
              <div className={styles.popularList}>
                {popularPosts.map((post, index) => (
                  <article className={styles.popularItem} key={post.id}>
                    <span className={styles.popularNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className={styles.popularDetails}>
                      <span className={styles.popularCategory}>
                        {post.category?.name || "Journal"}
                      </span>
                      <h3>
                        <Link href={`/post/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>
                      <span className={styles.popularMeta}>
                        {getReadingTime(post.content)} min read · {post.views} views
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.emptyMessage}>
                Popular stories will appear here once articles are published.
              </p>
            )}
          </div>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.editorBlock}>
            <span className={styles.blockLabel}>EDITOR&apos;S PICKS</span>

            {editorPicks.length > 0 ? (
              <div className={styles.editorList}>
                {editorPicks.map((post) => (
                  <article className={styles.editorItem} key={post.id}>
                    <Link
                      href={`/post/${post.slug}`}
                      className={styles.editorImageLink}
                    >
                      <ArticleImage
                        article={post}
                        className={styles.editorImage}
                      />
                    </Link>

                    <div className={styles.editorDetails}>
                      <span>{post.category?.name || "Journal"}</span>
                      <h3>
                        <Link href={`/post/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>
                      <small>{formatDate(post.createdAt)}</small>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.emptyMessage}>
                Your latest published stories will appear here.
              </p>
            )}
          </div>

          <div className={styles.categoryBlock}>
            <span className={styles.blockLabel}>EXPLORE TOPICS</span>

            {categories.length > 0 ? (
              <div className={styles.categoryList}>
                {categories.map((category) => (
                  <Link
                    href={`/category/${category.slug}`}
                    key={category.id}
                    className={styles.categoryLink}
                  >
                    {category.name}
                    <span>↗</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className={styles.emptyMessage}>
                Topics will appear here as categories are added.
              </p>
            )}
          </div>

          <div className={styles.newsletterBlock}>
            <span className={styles.newsletterEyebrow}>A NOTE FROM INKSPIRE</span>
            <h3>Good ideas deserve to travel.</h3>
            <p>
              Discover thoughtful perspectives, fresh ideas and stories
              worth passing along.
            </p>
            <Link href="/search" className={styles.newsletterLink}>
              Find your next read ↗
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
