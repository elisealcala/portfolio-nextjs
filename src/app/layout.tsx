import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Elizabeth Alcalá: Frontend Developer & Tech Blogger",
  description:
    "Join Elizabeth Alcalá on her journey through frontend development. Discover insights, tutorials, and thoughtful discussions on technologies such as React, TypeScript, and GraphQL.",
  icons: {
    icon: "/favicon-dark.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
