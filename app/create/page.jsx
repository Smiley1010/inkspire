
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
import styles from "./page.module.css";

const ArticleEditor = dynamic(
  () => import("../components/ArticleEditor"),
  { ssr: false }
);

export default function CreatePage() {
  const router = useRouter();
  const { status } = useSession();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function saveArticle(published) {
    setMessage("");

    if (!title.trim() || !description.trim() || !category.trim() || !content.trim()) {
      setMessage("Please complete your title, description, category and article.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          image,
          content,
          published,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to save article.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return <main className={styles.loading}>Loading your account...</main>;
  }

  if (status === "unauthenticated") {
    return (
      <main className={styles.loading}>
        <p>You need to sign in before writing an article.</p>
        <button onClick={() => router.push("/login")}>Sign in</button>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.container}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>THE INKSPIRE EDITORIAL DESK</p>
          <h1>Write a <em>story.</em></h1>
          <p>Give your ideas a voice. Create something worth sharing.</p>
        </div>

        <div className={styles.form}>
          <label htmlFor="title">Article title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your story a compelling title"
            maxLength={180}
          />

          <label htmlFor="description">Short description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is your article about?"
            maxLength={300}
            rows={3}
          />

          <div className={styles.row}>
            <div>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Choose a category</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Creativity">Creativity</option>
                <option value="Culture">Culture</option>
                <option value="Technology">Technology</option>
                <option value="Personal Growth">Personal Growth</option>
              </select>
            </div>

            <div>
              <label htmlFor="image">Cover image URL (optional)</label>
              <input
                id="image"
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {image && (
            <div className={styles.imagePreview}>
              <img src={image} alt="Article cover preview" />
            </div>
          )}

          <label>Article content</label>
          <ArticleEditor value={content} onChange={setContent} />

          {message && <p className={styles.message} role="alert">{message}</p>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.draftButton}
              disabled={loading}
              onClick={() => saveArticle(false)}
            >
              {loading ? "Saving..." : "Save as draft"}
            </button>

            <button
              type="button"
              className={styles.publishButton}
              disabled={loading}
              onClick={() => saveArticle(true)}
            >
              {loading ? "Saving..." : "Publish article"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}