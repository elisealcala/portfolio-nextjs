import Link from "next/link";
export default function NotFound() {
  return (
    <main className="container not-found">
      <span className="eyebrow">404 / Not found</span>
      <h1>
        This path
        <br />
        <span className="accent-text">ends here.</span>
      </h1>
      <p>
        The page may have moved. The engineering notes and archive are still available.
      </p>
      <Link className="button" href="/">
        Back home
      </Link>
    </main>
  );
}
