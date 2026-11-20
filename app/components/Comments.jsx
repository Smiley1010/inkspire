
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import styles from "./Comments.module.css";

function formatDate(date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function getInitials(name) {
  return (name || "I")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function Comments({ postSlug }) {
  const { data: session, status } = useSession();
  const currentUserId = session?.user?.id;

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Load saved comments from MongoDB.
  useEffect(() => {
    let cancelled = false;

    async function loadComments() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/posts/${encodeURIComponent(postSlug)}/comments`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load comments.");
        }

        if (!cancelled) {
          setComments(data.comments || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (postSlug) {
      loadComments();
    }

    return () => {
      cancelled = true;
    };
  }, [postSlug]);

  // Submit a new comment.
  async function submitComment(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!content.trim()) {
      setError("Please write a comment before submitting.");
      return;
    }

    if (content.trim().length > 3000) {
      setError("Your comment cannot exceed 3,000 characters.");
      return;
    }

    setPosting(true);

    try {
      const response = await fetch(
        `/api/posts/${encodeURIComponent(postSlug)}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: content.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to post your comment.");
      }

      setComments((previous) => [
        data.comment,
        ...previous,
      ]);

      setContent("");
      setMessage("Your comment has been posted.");
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  }

  // Delete a comment belonging to the signed-in user.
  async function deleteComment(commentId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete your comment? This cannot be undone."
    );

    if (!confirmed) return;

    setError("");
    setMessage("");
    setDeletingId(commentId);

    try {
      const response = await fetch(
        `/api/posts/${encodeURIComponent(postSlug)}/comments/${commentId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete comment.");
      }

      setComments((previous) =>
        previous.filter((comment) => comment.id !== commentId)
      );

      setMessage("Your comment has been deleted.");
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className={styles.commentsSection}>
      <div className={styles.commentsHeading}>
        <span className={styles.eyebrow}>
          JOIN THE CONVERSATION
        </span>

        <h2>Thoughts and responses.</h2>

        <p>
          Share your perspective and engage respectfully
          with other readers.
        </p>
      </div>

      {status === "authenticated" ? (
        <form
          className={styles.commentForm}
          onSubmit={submitComment}
        >
          <label htmlFor="comment">
            Leave a comment
          </label>

          <textarea
            id="comment"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="What are your thoughts on this story?"
            rows={5}
            maxLength={3000}
          />

          <div className={styles.formFooter}>
            <span>{content.length}/3000</span>

            <button
              type="submit"
              disabled={posting || !content.trim()}
            >
              {posting ? "Posting..." : "Post comment"}
            </button>
          </div>
        </form>
      ) : status === "unauthenticated" ? (
        <div className={styles.signInPrompt}>
          <p>
            Sign in to share your thoughts on this story.
          </p>

          <Link href="/login">
            Sign in to comment ↗
          </Link>
        </div>
      ) : (
        <p className={styles.statusMessage}>
          Checking your account...
        </p>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className={styles.success} role="status">
          {message}
        </p>
      )}

      <div className={styles.commentsList}>
        <div className={styles.listHeading}>
          <h3>Reader comments</h3>
          <span>{comments.length}</span>
        </div>

        {loading ? (
          <p className={styles.statusMessage}>
            Loading comments...
          </p>
        ) : comments.length > 0 ? (
          comments.map((comment) => {
            const author =
              comment.user?.name || "Inkspire reader";

            const isOwner =
              currentUserId &&
              currentUserId === comment.user?.id;

            return (
              <article
                className={styles.comment}
                key={comment.id}
              >
                <div className={styles.commentAvatar}>
                  {comment.user?.image ? (
                    <img
                      src={comment.user.image}
                      alt=""
                    />
                  ) : (
                    <span>{getInitials(author)}</span>
                  )}
                </div>

                <div className={styles.commentBody}>
                  <div className={styles.commentMeta}>
                    <strong>{author}</strong>

                    <span>
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  <p>{comment.content}</p>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => deleteComment(comment.id)}
                      className={styles.deleteComment}
                      disabled={deletingId === comment.id}
                    >
                      {deletingId === comment.id
                        ? "Deleting..."
                        : "Delete comment"}
                    </button>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <div className={styles.emptyComments}>
            <h4>Be the first to share a thought.</h4>

            <p>
              There are no comments on this story yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
