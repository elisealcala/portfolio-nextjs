import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { siteUrl, siteName } from "@/lib/site";

const sans = localFont({
  src: "../../public/fonts/inter-tight.woff2",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
});
const mono = localFont({
  src: "../../public/fonts/jetbrains-mono.woff2",
  variable: "--font-mono",
  weight: "100 800",
  display: "swap",
  preload: false,
});
const display = localFont({
  src: "../../public/fonts/playfair-display-italic.woff2",
  variable: "--font-display",
  weight: "400 900",
  style: "italic",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: "%s — Elizabeth Alcalá" },
  description:
    "Senior software engineer building web products and AI-powered tools. Explore my experience, engineering ideas, and writing.",
  openGraph: {
    type: "website",
    siteName,
    images: [{ url: "/social-card.svg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sans.variable} ${mono.variable} ${display.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
