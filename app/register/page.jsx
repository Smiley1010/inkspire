
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Navbar from "../components/Navbar";
import styles from "./page.module.css";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please complete all the required fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed. Please try again.");
        return;
      }

      const result = await signIn("credentials", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        setError(
          "Your account was created, but automatic sign-in failed. Please sign in manually."
        );
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Registration error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialSignIn(provider) {
    setError("");
    setLoading(true);

    try {
      await signIn(provider, { callbackUrl: "/" });
    } catch (error) {
      console.error("Social sign-in error:", error);
      setError("Unable to connect. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.registerSection}>
        <div className={styles.registerContainer}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>YOUR STORY STARTS HERE</p>

            <h1>
              Make room
              <br />
              for <em>new ideas.</em>
            </h1>

            <p className={styles.introText}>
              Join a community of thinkers, storytellers and curious minds.
              Discover perspectives, share your voice and give your ideas
              a place to grow.
            </p>

            <div className={styles.benefits}>
              <div>
                <span>01</span>
                <p>Discover thoughtful stories and fresh perspectives.</p>
              </div>

              <div>
                <span>02</span>
                <p>Save ideas and explore topics that interest you.</p>
              </div>

              <div>
                <span>03</span>
                <p>Share your own stories with the Inkspire community.</p>
              </div>
            </div>
          </div>

          <div className={styles.formContainer}>
            <div className={styles.formHeading}>
              <h2>Create an account</h2>
              <p>Start your Inkspire journey in a few simple steps.</p>
            </div>

            <div className={styles.socialButtons}>
              <button
                type="button"
                className={styles.socialButton}
                onClick={() => handleSocialSignIn("google")}
                disabled={loading}
              >
                <span className={styles.googleIcon}>G</span>
                Continue with Google
              </button>

              <button
                type="button"
                className={styles.socialButton}
                onClick={() => handleSocialSignIn("github")}
                disabled={loading}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="19"
                  height="19"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.29-1.23-1.63-1.23-1.63-1.01-.7.08-.69.08-.69 1.12.08 1.71 1.15 1.71 1.15 1 .1.76 1.72 3.36 1.72.32-.49.7-.82 1.12-1.01-2.48-.28-5.08-1.24-5.08-5.53 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.06 1.15a10.64 10.64 0 0 1 5.57 0c2.12-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.3-2.6 5.24-5.09 5.52.4.35.76 1.03.76 2.08v3.09c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
                </svg>
                Continue with GitHub
              </button>
            </div>

            <div className={styles.divider}>
              <span>OR REGISTER WITH EMAIL</span>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="password">Password</label>

                <div className={styles.passwordInput}>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <p className={styles.fieldHint}>
                  Use at least 8 characters.
                </p>
              </div>

              <div className={styles.field}>
                <label htmlFor="confirmPassword">Confirm password</label>

                <div className={styles.passwordInput}>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Enter your password again"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <label className={styles.termsCheckbox}>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                />

                <span>
                  I agree to the <Link href="/terms">Terms of Service</Link> and{" "}
                  <Link href="/privacy">Privacy Policy</Link>.
                </span>
              </label>

              {error && (
                <p className={styles.errorMessage} role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
                {!loading && <span>→</span>}
              </button>
            </form>

            <p className={styles.loginPrompt}>
              Already have an account? <Link href="/login">Sign in</Link>
            </p>

            <p className={styles.termsNote}>
              Your information will be handled in accordance with our
              privacy policy.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
