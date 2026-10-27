import Navbar from "@/components/navbar";
import Link from "next/link";
import { ScrollReveal } from "@/components/scroll-reveal";
export default function GeneralLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      <ScrollReveal />
      <main id="main" className="container" tabIndex={-1}>
        {children}
      </main>
      <footer className="site-footer container">
        <div>
          <Link href="/" className="wordmark" aria-label="Elizabeth Alcalá, home">
            ea<span>.</span>
          </Link>
        </div>
        <div>
          <span>Lima, Perú</span>
          <a href="https://github.com/elisealcala" target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
          <a href="mailto:elizabethalcala28@gmail.com">Get in touch ↗</a>
        </div>
      </footer>
    </>
  );
}
