"use client";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
const links = [
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/notes", label: "Notes" },
  { href: "/blog", label: "Archive" },
  { href: "/about", label: "About" },
];
export default function Navbar() {
  const { setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Link href="/" className="brand" aria-label="Elizabeth Alcalá, home">
          <span className="wordmark">
            ea<span>.</span>
          </span>
          <span className="brand-name">
            Elizabeth Alcalá<span>SOFTWARE ENGINEER</span>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <button
          className="theme-toggle"
          aria-label="Toggle color theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          <Moon className="moon-icon" size={17} aria-hidden="true" />
          <Sun className="sun-icon" size={17} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
