
import "./globals.css";
import { ThemeProvider } from "./providers/ThemeProvider";
import AuthProvider from "./providers/AuthProvider";

export const metadata = {
  title: "Inkspire | Ideas Worth Sharing",
  description:
    "Discover fresh perspectives, explore ideas and share your stories with Inkspire.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
