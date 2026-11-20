
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Navbar from "../components/Navbar";
import DashboardPostActions from "./DashboardPostActions";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const posts = await prisma.post.findMany({
    where: { userId: session.user.id },
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });

  const published = posts.filter((post) => post.published).length;
  const drafts = posts.length - published;

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.container}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>YOUR INKSPIRE WORKSPACE</p>
            <h1>Your stories.</h1>
            <p>Manage your writing and keep your ideas moving.</p>
          </div>

          <Link href="/create" className={styles.createButton}>
            + Write a story
          </Link>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span>Total articles</span>
            <strong>{posts.length}</strong>
          </div>

          <div className={styles.stat}>
            <span>Published</span>
            <strong>{published}</strong>
          </div>

          <div className={styles.stat}>
            <span>Drafts</span>
            <strong>{drafts}</strong>
          </div>
        </div>

        <div className={styles.sectionHeading}>
          <h2>Your articles</h2>
          <span>{posts.length} ARTICLES</span>
        </div>

        {posts.length > 0 ? (
          <div className={styles.postList}>
            {posts.map((post) => (
              <article className={styles.post} key={post.id}>
                {post.image ? (
                  <img
                    className={styles.cover}
                    src={post.image}
                    alt={post.title}
                  />
                ) : (
                  <div className={styles.coverPlaceholder}>INKSPIRE</div>
                )}

                <div className={styles.postDetails}>
                  <div className={styles.postMeta}>
                    <span>{post.category?.name || "Uncategorised"}</span>
                    <span
                      className={
                        post.published ? styles.published : styles.draft
                      }
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </div>

                  <h3>{post.title}</h3>
                  <p>{post.description}</p>

                  <span className={styles.date}>
                    Last updated:{" "}
                    {new Intl.DateTimeFormat("en", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(post.updatedAt))}
                  </span>

                  <div className={styles.actions}>
                    <DashboardPostActions postId={post.id} />

                    {post.published && (
                      <Link
                        href={`/post/${post.slug}`}
                        className={styles.viewLink}
                      >
                        View article ↗
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <h3>Your writing journey starts here.</h3>
            <p>You haven't created any articles yet.</p>
            <Link href="/create">Create your first story ↗</Link>
          </div>
        )}
      </section>
    </main>
  );
}
