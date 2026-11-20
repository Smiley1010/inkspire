
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Navbar from "../components/Navbar";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email address and password.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        setError("Incorrect email address or password. Please try again.");
        return;
      }

      if (result?.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to sign in. Please try again.");
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

      <section className={styles.loginSection}>
        <div className={styles.loginContainer}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>WELCOME BACK TO INKSPIRE</p>

            <h1>
              Your next great
              <br />
              idea starts <em>here.</em>
            </h1>

            <p className={styles.introText}>
              Sign in to continue exploring stories, sharing perspectives
              and connecting with a community of curious minds.
            </p>

            <div className={styles.quote}>
              <span>“</span>
              <p>Every great idea deserves a place to be heard.</p>
            </div>
          </div>

          <div className={styles.formContainer}>
            <div className={styles.formHeading}>
              <h2>Sign in</h2>
              <p>Enter your details to access your account.</p>
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
              <span>OR CONTINUE WITH EMAIL</span>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className={styles.field}>
                <div className={styles.passwordLabel}>
                  <label htmlFor="password">Password</label>
                  <Link href="/forgot-password">Forgot password?</Link>
                </div>

                <div className={styles.passwordInput}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
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
              </div>

              <label className={styles.remember}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Remember me</span>
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
                {loading ? "Signing in..." : "Sign in"}
                {!loading && <span>→</span>}
              </button>
            </form>

            <p className={styles.signupPrompt}>
              Don't have an account? <Link href="/register">Create one</Link>
            </p>

            <p className={styles.terms}>
              By continuing, you agree to Inkspire's Terms of Service and
              Privacy Policy.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
