
import Link from "next/link";
import Navbar from "../components/Navbar";
import prisma from "@/lib/prisma";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

function getReadTime(content = "") {
  const text = content.replace(/<[^>]*>/g, " ").trim();
  const words = text ? text.split(/\s+/).length : 0;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = (params?.q || "").trim();

  const articles = query
    ? await prisma.post.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { content: { contains: query } },
          ],
        },
        include: {
          category: true,
          user: true,
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      })
    : [];

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.container}>
        <p className={styles.eyebrow}>EXPLORE INKSPIRE</p>
        <h1>Find a story.</h1>
        <p className={styles.intro}>
          Search for ideas, perspectives and stories worth sharing.
        </p>

        <form action="/search" method="GET" className={styles.searchForm}>
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search articles, topics or ideas..."
            aria-label="Search published articles"
          />
          <button type="submit">Search ↗</button>
        </form>

        {query ? (
          <>
            <div className={styles.resultsHeading}>
              <h2>Search results</h2>
              <span>{articles.length} found</span>
            </div>

            {articles.length > 0 ? (
              <div className={styles.results}>
                {articles.map((article) => (
                  <article className={styles.result} key={article.id}>
                    {article.image && (
                      <Link
                        href={`/post/${article.slug}`}
                        className={styles.imageLink}
                      >
                        <img src={article.image} alt={article.title} />
                      </Link>
                    )}

                    <div className={styles.resultDetails}>
                      <span className={styles.category}>
                        {article.category?.name || "Uncategorised"}
                      </span>

                      <h3>
                        <Link href={`/post/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h3>

                      <p>{article.description}</p>

                      <div className={styles.meta}>
                        <span>
                          By {article.user?.name || "Inkspire author"}
                        </span>
                        <span>{getReadTime(article.content)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <h3>No matching stories found.</h3>
                <p>
                  Try another search phrase or explore the latest articles.
                </p>
                <Link href="/">Explore Inkspire ↗</Link>
              </div>
            )}
          </>
        ) : (
          <div className={styles.empty}>
            <h3>What would you like to discover?</h3>
            <p>Enter a word or phrase to search published stories.</p>
          </div>
        )}
      </section>
    </main>
  );
}
