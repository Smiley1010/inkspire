
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/app/components/Navbar";
import styles from "./page.module.css";

const ArticleEditor = dynamic(
  () => import("@/app/components/ArticleEditor"),
  { ssr: false }
);

const categories = [
  "Lifestyle",
  "Creativity",
  "Culture",
  "Technology",
  "Personal Growth",
];

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { status } = useSession();

  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryName: "",
    image: "",
    content: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status !== "authenticated" || !id) return;

    let cancelled = false;

    async function loadPost() {
      try {
        const response = await fetch(`/api/posts/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load this article.");
        }

        if (!cancelled) {
          setForm({
            title: data.title || "",
            description: data.description || "",
            categoryName: data.category?.name || "",
            image: data.image || "",
            content: data.content || "",
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPost();

    return () => {
      cancelled = true;
    };
  }, [id, status, router]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function savePost(published) {
    setError("");
    setSuccess("");

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.categoryName ||
      !form.content.replace(/<[^>]*>/g, "").trim()
    ) {
      setError("Please complete the title, description, category and article content.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          published,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save your changes.");
      }

      setSuccess(
        published
          ? "Your article has been published."
          : "Your changes have been saved."
      );

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <main className={styles.loading}>
        <p>Loading your article...</p>
      </main>
    );
  }

  if (error && !form.title) {
    return (
      <main className={styles.loading}>
        <p>{error}</p>
        <Link href="/dashboard">Return to dashboard</Link>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <Navbar />

      <div className={styles.wrapper}>
        <div className={styles.topBar}>
          <div>
            <Link href="/dashboard" className={styles.backLink}>
              ← Back to dashboard
            </Link>
            <p className={styles.eyebrow}>YOUR STORY, REFINED</p>
            <h1>Edit article</h1>
            <p className={styles.subtitle}>
              Make your changes and save your updated story.
            </p>
          </div>
        </div>

        <div className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <div className={styles.field}>
            <label htmlFor="title">Article title</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Give your story a compelling title"
              maxLength={150}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="description">Short description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="What is your article about?"
              rows={3}
              maxLength={300}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="categoryName">Category</label>
            <select
              id="categoryName"
              name="categoryName"
              value={form.categoryName}
              onChange={handleChange}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="image">Cover image URL</label>
            <input
              id="image"
              name="image"
              type="url"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
            {form.image && (
              <div className={styles.imagePreview}>
                <img
                  src={form.image}
                  alt="Article cover preview"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label>Article content</label>
            <ArticleEditor
              value={form.content}
              onChange={(content) =>
                setForm((previous) => ({ ...previous, content }))
              }
            />
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.draftButton}
              disabled={saving}
              onClick={() => savePost(false)}
            >
              {saving ? "Saving..." : "Save as draft"}
            </button>

            <button
              type="button"
              className={styles.publishButton}
              disabled={saving}
              onClick={() => savePost(true)}
            >
              {saving ? "Saving..." : "Publish article"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
