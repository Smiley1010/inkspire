
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import Comments from "../../components/Comments";
import ScrollToTop from "../../components/ScrollToTop";
import prisma from "@/lib/prisma";
import sanitizeHtml from "sanitize-html";
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

function getHeadings(content = "") {
  const headings = [];
  const expression = /<h([1-3])[^>]*>(.*?)<\/h\1>/gi;
  let match;

  while ((match = expression.exec(content)) !== null) {
    const text = match[2].replace(/<[^>]*>/g, "").trim();

    if (text) {
      headings.push({
        text,
        id: `section-${headings.length}`,
      });
    }
  }

  return headings;
}

function prepareArticleContent(content = "") {
  const cleanContent = sanitizeHtml(content, {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "h1",
      "h2",
      "u",
      "s",
      "iframe",
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height"],
      a: ["href", "name", "target", "rel"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
  });

  let headingIndex = 0;

  return cleanContent.replace(
    /<h([1-3])([^>]*)>(.*?)<\/h\1>/gi,
    (match, level, attributes, text) => {
      const id = `section-${headingIndex++}`;
      return `<h${level}${attributes} id="${id}">${text}</h${level}>`;
    }
  );
}

export default async function PostPage({ params }) {
  const { slug } = await params;

  let article = await prisma.post.findFirst({
    where: {
      slug,
      published: true,
    },
    include: {
      category: true,
      user: true,
    },
  });

  if (!article) {
    notFound();
  }

  // Increment views without overwriting other article updates.
  await prisma.post.update({
    where: { id: article.id },
    data: {
      views: { increment: 1 },
    },
  });

  const authorName = article.user?.name || "Inkspire author";
  const authorInitial = authorName.charAt(0).toUpperCase();
  const categoryName = article.category?.name || "Uncategorised";
  const headings = getHeadings(article.content);
  const safeContent = prepareArticleContent(article.content);

  const authorBio = "Contributor to Inkspire.";

  return (
    <main className={styles.container}>
      <Navbar />
      <ScrollToTop />

      <div className={styles.wrapper}>
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href={`/category/${article.category?.slug || ""}`}>
            {categoryName}
          </Link>
        </div>

        <header className={styles.articleHeader}>
          <span className={styles.category}>{categoryName}</span>

          <h1>{article.title}</h1>

          <p className={styles.excerpt}>{article.description}</p>

          <div className={styles.authorDetails}>
            <div className={styles.authorAvatar}>{authorInitial}</div>

            <div className={styles.authorInfo}>
              <span className={styles.authorName}>{authorName}</span>
              <span className={styles.authorBio}>{authorBio}</span>
            </div>

            <div className={styles.articleMeta}>
              <span>{formatDate(article.createdAt)}</span>
              <span>{getReadTime(article.content)}</span>
            </div>
          </div>
        </header>

        {article.image && (
          <figure className={styles.coverFigure}>
            <div
              className={styles.coverImage}
              style={{
                backgroundImage: `url("${article.image}")`,
              }}
            />
            <figcaption>{article.title}</figcaption>
          </figure>
        )}

        <div className={styles.articleLayout}>
          <aside className={styles.articleAside}>
            <span className={styles.asideLabel}>IN THIS STORY</span>

            {headings.length > 0 ? (
              headings.map((heading) => (
                <a href={`#${heading.id}`} key={heading.id}>
                  {heading.text}
                </a>
              ))
            ) : (
              <span className={styles.authorBio}>
                Enjoy the full story.
              </span>
            )}
          </aside>

          <article className={styles.articleBody}>
            <div
              className={styles.articleContent}
              dangerouslySetInnerHTML={{
                __html: safeContent,
              }}
            />

            <div className={styles.articleEnd}>
              <span>—</span>
              <p>Thank you for spending time with this story.</p>
              <span>INKSPIRE</span>
            </div>

            <div className={styles.authorCard}>
              <div className={styles.authorAvatarLarge}>
                {authorInitial}
              </div>

              <div>
                <span className={styles.authorCardLabel}>
                  ABOUT THE AUTHOR
                </span>
                <h3>{authorName}</h3>
                <p>{authorBio}</p>
              </div>
            </div>

            <Comments postSlug={article.slug} />
          </article>
        </div>

        <div className={styles.backToHome}>
          <Link href="/">← Back to all stories</Link>
        </div>
      </div>
    </main>
  );
}
