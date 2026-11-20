
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./DashboardPostActions.module.css";

export default function DashboardPostActions({ postId }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this article? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete this article.");
      }

      router.refresh();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div className={styles.actions}>
      <Link href={`/edit/${postId}`} className={styles.editButton}>
        Edit article
      </Link>

      <button
        type="button"
        className={styles.deleteButton}
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting ? "Deleting..." : "Delete"}
      </button>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
