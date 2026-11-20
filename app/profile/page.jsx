
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import styles from "./page.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const { status } = useSession();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    image: "",
    createdAt: "",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status !== "authenticated") return;

    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await fetch("/api/profile");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile.");
        }

        if (!cancelled) {
          setProfile({
            name: data.user.name || "",
            email: data.user.email || "",
            image: data.user.image || "",
            createdAt: data.user.createdAt,
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [status, router]);

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          image: profile.image,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile.");
      }

      setProfile((previous) => ({
        ...previous,
        ...data.user,
        image: data.user.image || "",
      }));

      setMessage(data.message);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Your new passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Your new password must contain at least 8 characters.");
      return;
    }

    setPasswordSaving(true);

    try {
      const response = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to change password.");
      }

      setPasswordMessage(data.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordSaving(false);
    }
  }

  if (status === "loading" || loading) {
    return <main className={styles.loading}>Loading your profile...</main>;
  }

  const initials = profile.name
    ? profile.name.trim().charAt(0).toUpperCase()
    : "I";

  return (
    <main className={styles.page}>
      <Navbar />

      <div className={styles.container}>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>YOUR INKSPIRE ACCOUNT</p>
          <h1>My profile.</h1>
          <p>Manage your personal information and account security.</p>
        </div>

        <section className={styles.profileCard}>
          <div className={styles.profileIdentity}>
            {profile.image ? (
              <img
                src={profile.image}
                alt="Your profile"
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarInitial}>{initials}</div>
            )}

            <div>
              <h2>{profile.name || "Inkspire member"}</h2>
              <p>{profile.email}</p>
              {profile.createdAt && (
                <span>
                  Member since{" "}
                  {new Intl.DateTimeFormat("en", {
                    month: "long",
                    year: "numeric",
                  }).format(new Date(profile.createdAt))}
                </span>
              )}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>Personal information</h2>
            <p>Update the information associated with your account.</p>
          </div>

          <form className={styles.form} onSubmit={saveProfile}>
            <label htmlFor="name">Display name</label>
            <input
              id="name"
              value={profile.name}
              onChange={(event) =>
                setProfile({ ...profile, name: event.target.value })
              }
              maxLength={80}
              required
            />

            <label htmlFor="email">Email address</label>
            <input id="email" type="email" value={profile.email} disabled />

            <label htmlFor="image">Profile image URL</label>
            <input
              id="image"
              type="url"
              value={profile.image}
              onChange={(event) =>
                setProfile({ ...profile, image: event.target.value })
              }
              placeholder="https://example.com/photo.jpg"
            />

            {error && <p className={styles.error}>{error}</p>}
            {message && <p className={styles.success}>{message}</p>}

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </button>
          </form>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <h2>Account security</h2>
            <p>Change your password to keep your account secure.</p>
          </div>

          <form className={styles.form} onSubmit={changePassword}>
            <label htmlFor="currentPassword">
              Current password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder="Enter your current password"
              autoComplete="current-password"
            />

            <label htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              maxLength={128}
              required
              autoComplete="new-password"
            />

            <label htmlFor="confirmPassword">Confirm new password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Enter your new password again"
              minLength={8}
              maxLength={128}
              required
              autoComplete="new-password"
            />

            {passwordError && (
              <p className={styles.error}>{passwordError}</p>
            )}
            {passwordMessage && (
              <p className={styles.success}>{passwordMessage}</p>
            )}

            <button type="submit" disabled={passwordSaving}>
              {passwordSaving ? "Updating..." : "Change password"}
            </button>
          </form>
        </section>

        <Link href="/dashboard" className={styles.backLink}>
          ← Return to dashboard
        </Link>
      </div>
    </main>
  );
}
