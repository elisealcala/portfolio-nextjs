import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/content";
export default function BlogCard({
  slug,
  title,
  date,
}: {
  slug: string;
  title: string;
  date: string;
}) {
  return (
    <Link href={`/blog/${slug}`} className="archive-row">
      <time dateTime={date} className="mono">
        {formatDate(date)}
      </time>
      <div>
        <h2>{title}</h2>
      </div>
      <ArrowUpRight size={20} aria-hidden="true" />
    </Link>
  );
}
