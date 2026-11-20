
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "../providers/ThemeProvider";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const accountRef = useRef(null);
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();

  const isLoggedIn = status === "authenticated";
  const user = session?.user;

  const closeMenu = () => {
    setMenuOpen(false);
    setAccountOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setAccountOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setAccountOpen(false);
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const initials = (user?.name || user?.email || "U")
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  async function handleLogout() {
    await signOut({ callbackUrl: "/" });
  }

  return (
    <header className={styles.header}>
      <div className={styles.navbar}>
        <Link href="/" className={styles.logo} onClick={closeMenu}>
          <span className={styles.logoName}>inkspire</span>
          <span className={styles.logoDot}>.</span>
        </Link>

        <nav
          className={`${styles.navLinks} ${
            menuOpen ? styles.navLinksOpen : ""
          }`}
        >
          <Link href="/" className={styles.navLink} onClick={closeMenu}>
            Home
          </Link>

          <Link
            href="/#latest"
            className={styles.navLink}
            onClick={closeMenu}
          >
            Discover
          </Link>

          <Link
            href="/#topics"
            className={styles.navLink}
            onClick={closeMenu}
          >
            Topics
          </Link>

          <Link
            href="/search"
            className={styles.navLink}
            onClick={closeMenu}
          >
            Search
          </Link>

          <Link
            href="/#about"
            className={styles.navLink}
            onClick={closeMenu}
          >
            About
          </Link>

          {isLoggedIn && (
            <Link
              href="/dashboard"
              className={`${styles.navLink} ${styles.mobileDashboard}`}
              onClick={closeMenu}
            >
              My dashboard
            </Link>
          )}
        </nav>

        <div className={styles.navActions}>
          <button
            type="button"
            className={styles.themeButton}
            onClick={toggleTheme}
            aria-label={`Switch to ${
              theme === "light" ? "dark" : "light"
            } mode`}
            title={`Switch to ${
              theme === "light" ? "dark" : "light"
            } mode`}
          >
            {theme === "light" ? "☾" : "☀"}
          </button>

          {status === "loading" ? (
            <span className={styles.authLoading}>...</span>
          ) : isLoggedIn ? (
            <>
              <Link href="/create" className={styles.readButton}>
                Write a story <span>↗</span>
              </Link>

              <div className={styles.accountWrapper} ref={accountRef}>
                <button
                  type="button"
                  className={styles.accountButton}
                  onClick={() => setAccountOpen(!accountOpen)}
                  aria-expanded={accountOpen}
                  aria-label="Open account menu"
                >
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt=""
                      className={styles.avatar}
                    />
                  ) : (
                    <span className={styles.avatarInitials}>
                      {initials}
                    </span>
                  )}

                  <span className={styles.accountName}>
                    {user?.name || "My account"}
                  </span>

                  <span className={styles.chevron}>
                    {accountOpen ? "⌃" : "⌄"}
                  </span>
                </button>

                {accountOpen && (
                  <div className={styles.accountDropdown}>
                    <div className={styles.dropdownIdentity}>
                      <strong>{user?.name || "Inkspire reader"}</strong>
                      <span>{user?.email}</span>
                    </div>

                    <div className={styles.dropdownDivider} />

                    <Link
                      href="/profile"
                      onClick={closeMenu}
                      className={styles.dropdownLink}
                    >
                      My profile
                    </Link>

                    <Link
                      href="/dashboard"
                      onClick={closeMenu}
                      className={styles.dropdownLink}
                    >
                      My dashboard
                    </Link>

                    <Link
                      href="/create"
                      onClick={closeMenu}
                      className={styles.dropdownLink}
                    >
                      Write an article
                    </Link>

                    <Link
                      href="/search"
                      onClick={closeMenu}
                      className={styles.dropdownLink}
                    >
                      Search stories
                    </Link>

                    <div className={styles.dropdownDivider} />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className={styles.logoutButton}
                    >
                      Sign out <span>↗</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.loginButton}>
                Sign in
              </Link>

              <Link href="/register" className={styles.readButton}>
                Join Inkspire <span>↗</span>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className={styles.menuButton}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
